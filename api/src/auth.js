/**
 * 인증 — Google 로그인 (Google Identity Services ID 토큰 검증)
 *
 * 흐름:
 *   프론트(GIS 버튼) → ID 토큰 발급 → POST /api/auth/google {credential}
 *   → 구글 공개키로 검증 → users upsert → httpOnly 세션 쿠키 발급
 *
 * 환경변수:
 *   GOOGLE_CLIENT_ID  — Google Cloud OAuth 클라이언트 ID (없으면 503 auth_not_configured)
 *   SESSION_SECRET    — 세션 JWT 서명 키 (프로덕션 필수, 개발은 기본값 + 경고)
 */

import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

const COOKIE_NAME = "hanul_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 14; // 14일

let warnedSecret = false;
function sessionSecret() {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET 환경변수가 필요합니다 (production)");
  }
  if (!warnedSecret) {
    console.warn("[auth] SESSION_SECRET 미설정 — 개발용 기본 키 사용 중");
    warnedSecret = true;
  }
  return "hanul-dev-secret-do-not-use-in-prod";
}

function publicUser(row) {
  return { id: Number(row.id), email: row.email, name: row.name, picture: row.picture, role: row.role };
}

/** ADMIN_EMAILS(쉼표 구분)에 포함된 이메일은 로그인 시 자동으로 관리자 승격 */
function isAdminEmail(email) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email) && list.includes(email.toLowerCase());
}

/** req에서 현재 로그인 사용자 조회 (없으면 null) */
export async function currentUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, sessionSecret());
    const { rows } = await pool.query(
      "SELECT id, email, name, picture, role FROM users WHERE id = $1",
      [payload.uid],
    );
    return rows[0] ? publicUser(rows[0]) : null;
  } catch {
    return null;
  }
}

/** 쓰기 API 보호용 미들웨어 */
export async function requireAuth(req, res, next) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: "not_authenticated" });
  req.user = user;
  next();
}

/** 관리자 전용 미들웨어 */
export async function requireAdmin(req, res, next) {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: "not_authenticated" });
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  req.user = user;
  next();
}

export function authRouter() {
  const router = Router();
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const google = clientId ? new OAuth2Client(clientId) : null;

  /** 프론트가 GIS 초기화에 사용할 공개 설정 */
  router.get("/config", (_req, res) => {
    res.json({ googleClientId: clientId || null });
  });

  router.post("/google", async (req, res) => {
    if (!google) return res.status(503).json({ error: "auth_not_configured" });
    const credential = req.body?.credential;
    if (typeof credential !== "string" || !credential) {
      return res.status(400).json({ error: "invalid_credential" });
    }
    try {
      const ticket = await google.verifyIdToken({ idToken: credential, audience: clientId });
      const p = ticket.getPayload();
      if (!p?.sub) return res.status(401).json({ error: "invalid_token" });

      const admin = isAdminEmail(p.email);
      const { rows } = await pool.query(
        `INSERT INTO users (google_sub, email, name, picture, last_login_at, role)
         VALUES ($1, $2, $3, $4, now(), $5)
         ON CONFLICT (google_sub) DO UPDATE
           SET email = $2, name = $3, picture = $4, last_login_at = now(),
               role = CASE WHEN $5 THEN 'admin' ELSE users.role END
         RETURNING id, email, name, picture, role`,
        [p.sub, p.email ?? null, p.name ?? null, p.picture ?? null, admin ? "admin" : "member"],
      );
      const user = publicUser(rows[0]);

      const token = jwt.sign({ uid: user.id }, sessionSecret(), { expiresIn: SESSION_TTL_SEC });
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_TTL_SEC * 1000,
        path: "/",
      });
      res.json({ user });
    } catch (err) {
      console.warn("[auth] 토큰 검증 실패:", err.message);
      res.status(401).json({ error: "invalid_token" });
    }
  });

  router.post("/logout", (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.json({ ok: true });
  });

  router.get("/me", async (req, res) => {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ error: "not_authenticated" });
    res.json({ user });
  });

  return router;
}

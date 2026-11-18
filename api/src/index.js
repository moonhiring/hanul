import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pool, waitForDb } from "./db.js";
import { initSchema, seedIfEmpty } from "../db/seed.js";
import { authRouter, requireAdmin } from "./auth.js";
import { adminRouter } from "./admin.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter());
app.use("/api/admin", adminRouter());

const SELECT_COLS = `
  id, name, category, raw_category AS "rawCategory", city, locality,
  address, phone, website, lat, lng, confidence, verified, source
`;

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

/**
 * GET /api/businesses?city=뉴욕&category=맛집&q=김밥&limit=100&offset=0
 * - limit 기본 100, 최대 20000 (현재 프론트가 클라이언트 필터링 — 추후 서버 페이지네이션으로 전환)
 */
app.get("/api/businesses", async (req, res) => {
  const { city, category, q } = req.query;
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 20000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const where = [`status NOT IN ('archived','not_korean')`]; // 확정 비노출만 숨김, needs_human은 무고 추정으로 노출 유지
  const params = [];
  if (typeof city === "string" && city) {
    params.push(city);
    where.push(`city = $${params.length}`);
  }
  if (typeof category === "string" && category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  if (typeof q === "string" && q.trim()) {
    params.push(`%${q.trim()}%`);
    where.push(`(lower(name) LIKE lower($${params.length}) OR lower(coalesce(address,'')) LIKE lower($${params.length}))`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const totalQ = await pool.query(`SELECT count(*)::int AS c FROM businesses ${whereSql}`, params);
    params.push(limit, offset);
    const itemsQ = await pool.query(
      `SELECT ${SELECT_COLS} FROM businesses ${whereSql}
       ORDER BY verified DESC, confidence DESC NULLS LAST, id
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ total: totalQ.rows[0].c, items: itemsQ.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * 방문자 기본 스타일 (docs: app/HANDOFF.md "방문자 기본 스타일")
 * GET  /api/site-style  — 공개. 미설정이면 { style: null }
 * POST /api/site-style  — 관리자 전용. { fontDisplay, fontBody, texture, texLevel }
 */
/* ---------- 한인교회 공개 API (churches 테이블 — 업소록과 별도) ---------- */

const CHURCH_COLS = `
  id, name, name_en AS "nameEn", denomination, country, region, locality,
  address, phone, website, lat, lng, worship_times AS "worshipTimes", source
`;

/** GET /api/churches?country=US&region=CA&locality=&denomination=장로교&q=사랑&limit=100&offset=0 */
app.get("/api/churches", async (req, res) => {
  const { country, region, locality, denomination, q } = req.query;
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 5000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const where = [`status NOT IN ('archived','not_korean')`];
  const params = [];
  for (const [col, val] of [
    ["country", country],
    ["region", region],
    ["locality", locality],
    ["denomination", denomination],
  ]) {
    if (typeof val === "string" && val) {
      params.push(val);
      where.push(`${col} = $${params.length}`);
    }
  }
  if (typeof q === "string" && q.trim()) {
    params.push(`%${q.trim()}%`);
    where.push(
      `(lower(name) LIKE lower($${params.length}) OR lower(coalesce(name_en,'')) LIKE lower($${params.length}) OR lower(coalesce(address,'')) LIKE lower($${params.length}))`,
    );
  }
  const whereSql = `WHERE ${where.join(" AND ")}`;

  try {
    const totalQ = await pool.query(`SELECT count(*)::int AS c FROM churches ${whereSql}`, params);
    params.push(limit, offset);
    const itemsQ = await pool.query(
      `SELECT ${CHURCH_COLS} FROM churches ${whereSql}
       ORDER BY country, region NULLS LAST, locality NULLS LAST, name
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    res.json({ total: totalQ.rows[0].c, items: itemsQ.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

/** GET /api/churches/meta — 필터 드롭다운용 국가/교단 집계 */
app.get("/api/churches/meta", async (_req, res) => {
  try {
    const [countries, denominations] = await Promise.all([
      pool.query(
        `SELECT country, count(*)::int AS c FROM churches
         WHERE status NOT IN ('archived','not_korean')
         GROUP BY country ORDER BY c DESC`,
      ),
      pool.query(
        `SELECT coalesce(denomination, '(미분류)') AS d, count(*)::int AS c FROM churches
         WHERE status NOT IN ('archived','not_korean')
         GROUP BY d ORDER BY c DESC`,
      ),
    ]);
    res.json({ countries: countries.rows, denominations: denominations.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

/** GET /api/churches/localities?country=US — 국가별 도시(locality) 목록 (도시 필터용) */
app.get("/api/churches/localities", async (req, res) => {
  const { country } = req.query;
  if (typeof country !== "string" || !country) return res.status(400).json({ error: "country_required" });
  try {
    const { rows } = await pool.query(
      `SELECT locality, count(*)::int AS c FROM churches
       WHERE status NOT IN ('archived','not_korean') AND country = $1 AND locality IS NOT NULL AND locality <> ''
       GROUP BY locality ORDER BY c DESC LIMIT 200`,
      [country],
    );
    res.json({ localities: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

/** GET /api/churches/:id */
app.get("/api/churches/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid_id" });
  try {
    const { rows } = await pool.query(
      `SELECT ${CHURCH_COLS} FROM churches WHERE id = $1 AND status NOT IN ('archived','not_korean')`,
      [id],
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

app.get("/api/site-style", async (_req, res) => {  try {
    const { rows } = await pool.query(
      "SELECT font_display, font_body, texture, tex_level, updated_at FROM site_settings WHERE id = 1",
    );
    if (!rows.length) return res.json({ style: null });
    const r = rows[0];
    res.json({
      style: {
        fontDisplay: r.font_display,
        fontBody: r.font_body,
        texture: r.texture,
        texLevel: r.tex_level,
        updatedAt: r.updated_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

app.post("/api/site-style", requireAdmin, async (req, res) => {
  const { fontDisplay, fontBody, texture, texLevel } = req.body ?? {};
  if (typeof fontDisplay !== "string" || !fontDisplay || typeof fontBody !== "string" || !fontBody) {
    return res.status(400).json({ error: "fontDisplay_and_fontBody_required" });
  }
  try {
    await pool.query(
      `INSERT INTO site_settings (id, font_display, font_body, texture, tex_level, updated_at)
       VALUES (1, $1, $2, $3, $4, now())
       ON CONFLICT (id) DO UPDATE
         SET font_display = $1, font_body = $2, texture = $3, tex_level = $4, updated_at = now()`,
      [fontDisplay, fontBody, texture || "hanji", texLevel || "base"],
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

app.get("/api/businesses/:id", async (req, res) => {  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid_id" });
  try {
    const { rows } = await pool.query(
      `SELECT ${SELECT_COLS} FROM businesses WHERE id = $1 AND status NOT IN ('archived','not_korean')`,
      [id],
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

async function main() {
  await waitForDb();
  await initSchema(pool);
  await seedIfEmpty(pool);
  app.listen(PORT, () => console.log(`[api] listening on :${PORT}`));
}

main().catch((err) => {
  console.error("[api] 부팅 실패:", err);
  process.exit(1);
});

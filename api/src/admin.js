/**
 * 관리자 API (/api/admin/*) — 전 경로 requireAdmin
 *
 * - GET  /stats                    대시보드 지표
 * - GET  /businesses               업체 목록 (status/q 필터, evidence 포함)
 * - POST /businesses               업체 수동 추가
 * - PATCH  /businesses/:id         필드/상태 수정 (검토 큐 승인·보류 포함)
 * - DELETE /businesses/:id         하드 삭제 (보통은 status='archived' 권장)
 * - GET  /users                    사용자 목록
 * - PATCH  /users/:id              역할 변경 (member|admin)
 */

import { Router } from "express";
import { pool } from "./db.js";
import { requireAdmin } from "./auth.js";

const VALID_STATUSES = new Set([
  "pending",
  "active",
  "stale",
  "likely_closed",
  "needs_human",
  "not_korean",
  "duplicate",
  "archived",
]);

const EDITABLE_FIELDS = new Set([
  "name",
  "category",
  "raw_category",
  "city",
  "locality",
  "address",
  "phone",
  "website",
  "lat",
  "lng",
  "confidence",
  "verified",
  "status",
]);

export function adminRouter() {
  const router = Router();
  router.use(requireAdmin);

  /** 대시보드 지표 */
  router.get("/stats", async (_req, res) => {
    try {
      const [byStatus, users, runs, businessesTotal] = await Promise.all([
        pool.query("SELECT status, count(*)::int AS c FROM businesses GROUP BY status ORDER BY c DESC"),
        pool.query("SELECT count(*)::int AS total, count(*) FILTER (WHERE role='admin')::int AS admins, count(*) FILTER (WHERE last_login_at > now() - interval '7 days')::int AS active7d FROM users"),
        pool.query("SELECT worker_id, batch_size, result, started_at, finished_at FROM verification_runs ORDER BY id DESC LIMIT 10"),
        pool.query("SELECT count(*)::int AS c FROM businesses"),
      ]);
      res.json({
        businessesTotal: businessesTotal.rows[0].c,
        byStatus: Object.fromEntries(byStatus.rows.map((r) => [r.status, r.c])),
        users: users.rows[0],
        recentRuns: runs.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  /** 업체 목록 (관리용 — evidence 포함, 비노출 상태도 조회 가능) */
  router.get("/businesses", async (req, res) => {
    const { status, q } = req.query;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const where = [];
    const params = [];
    if (typeof status === "string" && VALID_STATUSES.has(status)) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (typeof q === "string" && q.trim()) {
      params.push(`%${q.trim()}%`);
      where.push(`(lower(name) LIKE lower($${params.length}) OR lower(coalesce(address,'')) LIKE lower($${params.length}))`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    try {
      const totalQ = await pool.query(`SELECT count(*)::int AS c FROM businesses ${whereSql}`, params);
      params.push(limit, offset);
      const { rows } = await pool.query(
        `SELECT id, name, category, city, locality, address, phone, website, confidence,
                verified, source, status, last_checked_at, evidence, created_at
         FROM businesses ${whereSql}
         ORDER BY CASE status WHEN 'needs_human' THEN 0 ELSE 1 END, last_checked_at DESC NULLS LAST, id
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );
      res.json({ total: totalQ.rows[0].c, items: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  /** 업체 수동 추가 */
  router.post("/businesses", async (req, res) => {
    const b = req.body ?? {};
    if (typeof b.name !== "string" || !b.name.trim() || typeof b.city !== "string" || !b.city.trim()) {
      return res.status(400).json({ error: "name_and_city_required" });
    }
    try {
      const { rows: idRows } = await pool.query(
        "SELECT coalesce(max(id), 0) + 1 AS next_id FROM businesses",
      );
      const { rows } = await pool.query(
        `INSERT INTO businesses (id, name, category, city, locality, address, phone, website, lat, lng, verified, source, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,'admin','active')
         RETURNING id, name, city, status`,
        [
          idRows[0].next_id,
          b.name.trim(),
          (b.category || "기타").trim(),
          b.city.trim(),
          b.locality ?? null,
          b.address ?? null,
          b.phone ?? null,
          b.website ?? null,
          typeof b.lat === "number" ? b.lat : null,
          typeof b.lng === "number" ? b.lng : null,
        ],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  /** 업체 수정 — 검토 큐 승인(status='active')·확정 비노출('not_korean'/'archived') 포함 */
  router.patch("/businesses/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid_id" });
    const body = req.body ?? {};
    const sets = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (!EDITABLE_FIELDS.has(k)) continue;
      if (k === "status" && !VALID_STATUSES.has(v)) {
        return res.status(400).json({ error: "invalid_status" });
      }
      params.push(v);
      sets.push(`${k} = $${params.length}`);
    }
    if (!sets.length) return res.status(400).json({ error: "no_fields" });
    try {
      params.push(id);
      const { rows } = await pool.query(
        `UPDATE businesses SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING id, name, status`,
        params,
      );
      if (!rows.length) return res.status(404).json({ error: "not_found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  /** 하드 삭제 */
  router.delete("/businesses/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid_id" });
    try {
      const { rowCount } = await pool.query("DELETE FROM businesses WHERE id = $1", [id]);
      if (!rowCount) return res.status(404).json({ error: "not_found" });
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  /** 사용자 목록 */
  router.get("/users", async (_req, res) => {
    try {
      const { rows } = await pool.query(
        "SELECT id, email, name, picture, role, created_at, last_login_at FROM users ORDER BY created_at DESC LIMIT 500",
      );
      res.json({ items: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  /** 사용자 역할 변경 — 자기 자신의 admin 해임은 불가 */
  router.patch("/users/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { role } = req.body ?? {};
    if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid_id" });
    if (role !== "member" && role !== "admin") return res.status(400).json({ error: "invalid_role" });
    if (id === req.user.id && role !== "admin") {
      return res.status(400).json({ error: "cannot_demote_self" });
    }
    try {
      const { rows } = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role",
        [role, id],
      );
      if (!rows.length) return res.status(404).json({ error: "not_found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEED_CANDIDATES = [
  process.env.SEED_FILE,
  "/seed/businesses.json", // docker compose 마운트
  path.resolve(__dirname, "../../app/public/seed/businesses.json"), // 로컬 실행
].filter(Boolean);

const INSERT = `
  INSERT INTO businesses
    (id, name, category, raw_category, city, locality, address, phone, website, lat, lng, confidence, verified, source)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,FALSE,'overture')
  ON CONFLICT (id) DO NOTHING
`;

export async function initSchema(pool) {
  const schema = await readFile(path.resolve(__dirname, "../db/schema.sql"), "utf8");
  await pool.query(schema);
}

export async function seedIfEmpty(pool) {
  const { rows } = await pool.query("SELECT count(*)::int AS c FROM businesses");
  if (rows[0].c > 0) {
    console.log(`[seed] businesses 테이블에 이미 ${rows[0].c}건 — 시드 생략`);
    return;
  }

  let raw = null;
  for (const p of SEED_CANDIDATES) {
    try {
      raw = await readFile(p, "utf8");
      console.log(`[seed] 시드 파일: ${p}`);
      break;
    } catch {
      /* 다음 후보 시도 */
    }
  }
  if (!raw) {
    console.warn("[seed] 시드 파일을 찾지 못했습니다 — 빈 DB로 시작합니다");
    return;
  }

  const records = JSON.parse(raw);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const r of records) {
      await client.query(INSERT, [
        r.id, r.name, r.category, r.rawCategory ?? null, r.city,
        r.locality || null, r.address || null, r.phone || null,
        r.website || null, r.lat ?? null, r.lng ?? null, r.confidence ?? null,
      ]);
    }
    await client.query("COMMIT");
    console.log(`[seed] businesses ${records.length}건 삽입 완료`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 한인교회 CSV → churches 테이블 적재
 *
 * 사용법:
 *   node scripts/load_churches.js [CSV경로...]
 *   (인자 없으면 ../../data-pipeline/output/korean_churches_*.csv 전부)
 *
 * - overture_id 기준 upsert (재실행 안전)
 * - 교단(denomination)은 이름 휴리스틱으로 추정 — 정확도 제한 있으므로 검증 대상
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://hanul:hanul@localhost:5432/hanul",
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = path.resolve(__dirname, "../../data-pipeline/output");

const DENOM_RULES = [
  [/seventh[- ]day|안식일|재림|\bsda\b/i, "안식일(재림교)"],
  [/assembly of god|하나님의 ?성회|순복음/i, "순복음(하나님의성회)"],
  [/presbyterian|장로/i, "장로교"],
  [/methodist|감리/i, "감리교"],
  [/baptist|침례/i, "침례교"],
  [/catholic|성당|천주교|천주/i, "천주교"],
  [/episcopal|성공회/i, "성공회"],
  [/lutheran|루터/i, "루터교"],
  [/nazarene|나사렛/i, "나사렛성결회"],
  [/holiness|성결/i, "성결교"],
  [/orthodox|정교회/i, "정교회"],
  [/united church|연합/i, "연합교회"],
];

const HANGUL = /[가-힯]/;

function guessDenomination(name) {
  for (const [re, label] of DENOM_RULES) {
    if (re.test(name)) return label;
  }
  return null;
}

function splitNames(name) {
  // 한글이 섞여 있으면 한글 부분을 name으로, 나머지를 name_en 후보로
  if (!HANGUL.test(name)) return { name, nameEn: null };
  const hangulParts = name.match(/[가-힯][가-힯\s·ㆍ]*/g)?.join(" ").trim();
  const latinParts = name.replace(/[가-힯]/g, " ").replace(/\s{2,}/g, " ").trim();
  return {
    name: hangulParts && hangulParts.length >= 2 ? hangulParts : name,
    nameEn: latinParts.length >= 3 ? latinParts : null,
  };
}

async function load(file) {
  const rows = parse(fs.readFileSync(file, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });
  let inserted = 0,
    updated = 0;
  for (const r of rows) {
    const { name, nameEn } = splitNames((r.name || "").trim());
    if (!name) continue;
    const res = await pool.query(
      `INSERT INTO churches
         (overture_id, name, name_en, denomination, country, region, locality, address,
          lat, lng, phone, website, confidence, source, operating_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'overture',$14)
       ON CONFLICT (overture_id) DO UPDATE SET
         name=$2, name_en=$3, denomination=$4, country=$5, region=$6, locality=$7, address=$8,
         lat=$9, lng=$10, phone=$11, website=$12, confidence=$13, operating_status=$14
       RETURNING (xmax = 0) AS was_inserted`,
      [
        r.id || null,
        name,
        nameEn,
        guessDenomination(r.name || ""),
        r.country || null,
        r.region || null,
        r.locality || null,
        r.address || null,
        r.lat ? Number(r.lat) : null,
        r.lng ? Number(r.lng) : null,
        r.phone || null,
        r.website || null,
        r.confidence ? Number(r.confidence) : null,
        r.operating_status || null,
      ],
    );
    res.rows[0].was_inserted ? inserted++ : updated++;
  }
  console.log(`${path.basename(file)}: 신규 ${inserted}, 갱신 ${updated}`);
  return inserted + updated;
}

async function main() {
  const files =
    process.argv.slice(2).length > 0
      ? process.argv.slice(2)
      : fs
          .readdirSync(DEFAULT_DIR)
          .filter((f) => f.startsWith("korean_churches_") && f.endsWith(".csv"))
          .map((f) => path.join(DEFAULT_DIR, f));

  if (!files.length) {
    console.error("CSV 파일이 없습니다:", DEFAULT_DIR);
    process.exit(1);
  }

  let total = 0;
  for (const f of files) total += await load(f);

  const { rows } = await pool.query(
    "SELECT country, count(*)::int AS c FROM churches GROUP BY country ORDER BY c DESC LIMIT 10",
  );
  console.log(`\nchurches 총 ${total}건 처리. 국가별:`);
  for (const r of rows) console.log(`  ${r.country ?? "(미상)"}: ${r.c}`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});

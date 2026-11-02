/**
 * 한울 검증 워커 (docs/data-ops-design.md §3)
 *
 * 사용법:
 *   node src/worker/verify.js [--limit 1000] [--worker-id worker-1]
 *
 * 동작:
 *   1. Postgres 큐에서 SKIP LOCKED로 배치 클레임 (status='checking'으로 표시)
 *   2. 건당 신호 수집 — 웹사이트 도달성, 전화/주소 존재, Overture confidence
 *   3. LLM 판정 (HANUL_LLM_API_KEY 없으면 규칙 기반 폴백)
 *   4. businesses 갱신 + verification_runs 배치 로그
 *
 * 클레임 후 워커가 죽어도 1시간 지난 'checking' 행은 큐가 다시 회수한다.
 */

import { pool } from "../db.js";

const CHECK_TIMEOUT_MS = 8000;
const CONCURRENCY = 20;

const LLM_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const LLM_MODEL = process.env.HANUL_LLM_MODEL || "deepseek-chat";
const LLM_TIMEOUT_MS = 30000;
const VALID_VERDICTS = new Set(["active", "likely_closed", "not_korean", "duplicate", "needs_human"]);

/**
 * 업체를 지우는 계열의 판정은 자동 확정하지 않고 사람 검토 큐로 보낸다.
 * (사이트 철학: 억울하게 지우는 것보다 사람에게 넘기는 게 낫다 — 2026-11-02 확정)
 */
const ESCALATE_TO_REVIEW = new Set(["not_korean", "duplicate"]);

function parseArgs(argv) {
  const args = { limit: 1000, workerId: `worker-${process.pid}` };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--limit") args.limit = parseInt(argv[++i], 10);
    else if (argv[i] === "--worker-id") args.workerId = argv[++i];
  }
  if (!Number.isInteger(args.limit) || args.limit <= 0) {
    throw new Error(`--limit 값이 올바르지 않습니다: ${args.limit}`);
  }
  return args;
}

/** 1단계: 큐에서 배치 클레임. 짧은 트랜잭션으로 잠그고 상태만 바꾼 뒤 즉시 커밋. */
async function claimBatch(limit) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `WITH cte AS (
         SELECT id FROM businesses
         WHERE status IN ('pending','stale')
            OR (status <> 'checking' AND last_checked_at < now() - interval '30 days')
            OR (status = 'checking' AND last_checked_at < now() - interval '1 hour')
         ORDER BY last_checked_at NULLS FIRST
         LIMIT $1
         FOR UPDATE SKIP LOCKED
       )
       UPDATE businesses b
       SET status = 'checking', last_checked_at = now()
       FROM cte
       WHERE b.id = cte.id
       RETURNING b.id, b.name, b.city, b.address, b.phone, b.website, b.confidence`,
      [limit],
    );
    await client.query("COMMIT");
    return rows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** 2단계: 신호 수집 — 규칙 기반, 무료 */
async function collectSignals(biz) {
  const signals = {
    hasPhone: Boolean(biz.phone && biz.phone.trim()),
    hasAddress: Boolean(biz.address && biz.address.trim()),
    confidence: biz.confidence ?? null,
    website: null,
  };
  if (biz.website && biz.website.trim()) {
    const started = Date.now();
    try {
      const res = await fetch(biz.website, {
        signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
        redirect: "follow",
        headers: { "user-agent": "hanul-verify/0.1 (+https://hanul.example)" },
      });
      res.body?.cancel().catch(() => {});
      signals.website = {
        url: biz.website,
        ok: res.status < 400,
        httpStatus: res.status,
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      signals.website = {
        url: biz.website,
        ok: false,
        error: err.name === "TimeoutError" ? "timeout" : String(err.message || err),
        latencyMs: Date.now() - started,
      };
    }
  }
  return signals;
}

/**
 * 3단계: LLM 판정기 (DeepSeek, OpenAI 호환). 키가 없거나 오류면 null → 규칙 기반 폴백.
 * 출력 스키마: { verdict: 'active'|'likely_closed'|'not_korean'|'duplicate'|'needs_human', reason: string }
 */
async function judgeWithLLM(signals, biz) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.HANUL_LLM_API_KEY;
  if (!apiKey) return null;

  const site = signals.website;
  const prompt = [
    `상호: ${biz.name}`,
    `도시: ${biz.city}${biz.address ? ` / 주소: ${biz.address}` : " / 주소 정보 없음"}`,
    `전화: ${signals.hasPhone ? biz.phone : "없음"}`,
    `웹사이트: ${
      site
        ? `${site.url} — ${site.ok ? `응답 정상(HTTP ${site.httpStatus})` : `접속 실패(${site.error || `HTTP ${site.httpStatus}`})`}`
        : "없음"
    }`,
    `데이터 소스 신뢰도(confidence): ${signals.confidence ?? "알 수 없음"}`,
  ].join("\n");

  try {
    const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        response_format: { type: "json_object" },
        temperature: 0,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content: [
              "당신은 전 세계 한인 비즈니스 디렉토리의 데이터 검증관입니다.",
              "주어진 신호를 보고 이 업체가 실제로 영업 중인 한인 관련 비즈니스인지 판정합니다.",
              "verdict는 반드시 다음 중 하나: active(영업 중으로 보임), likely_closed(폐업했을 가능성 높음),",
              "not_korean(한인 비즈니스가 아님 — 한식·K-뷰티 카테고리만 한국 관련인 비한인 업체 포함),",
              "duplicate(같은 업체의 중복으로 보임), needs_human(신호가 부족하거나 모순되어 사람이 봐야 함).",
              "애매하면 무조건 needs_human을 선택하세요. 한인 업체를 억울하게 지우는 것보다 사람에게 넘기는 게 낫습니다.",
              '반드시 {"verdict": "...", "reason": "한국어 한 문장"} 형식의 JSON만 출력하세요.',
            ].join(" "),
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      console.warn(`[verify] LLM API 오류 HTTP ${res.status} — 규칙 폴백 (id ${biz.id})`);
      return null;
    }
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    if (!VALID_VERDICTS.has(parsed.verdict)) return null;
    return { verdict: parsed.verdict, reason: String(parsed.reason || "").slice(0, 300) };
  } catch (err) {
    console.warn(`[verify] LLM 호출 실패 (${err.message}) — 규칙 폴백 (id ${biz.id})`);
    return null;
  }
}

/** 규칙 기반 폴백 판정 — 부정 신호가 여러 개 겹칠 때만 폐업 추정, 나머지는 사람에게 */
function ruleBasedVerdict(signals) {
  const site = signals.website;
  if (site?.ok) {
    return { verdict: "active", reason: `웹사이트 응답 정상 (HTTP ${site.httpStatus}, ${site.latencyMs}ms)` };
  }
  const negativeCount =
    (site && !site.ok ? 1 : 0) + (!signals.hasPhone ? 1 : 0) + (!signals.hasAddress ? 1 : 0);
  if (negativeCount >= 2 && (signals.confidence ?? 0) < 0.8) {
    return {
      verdict: "likely_closed",
      reason: `부정 신호 ${negativeCount}개 (웹사이트 ${site ? "불량" : "없음"}, 전화 ${signals.hasPhone ? "있음" : "없음"}, 주소 ${signals.hasAddress ? "있음" : "없음"})`,
    };
  }
  return {
    verdict: "needs_human",
    reason: site
      ? `웹사이트 확인 실패(${site.error || `HTTP ${site.httpStatus}`}) — 수동 확인 필요`
      : "웹사이트 정보 없음 — 수동 확인 필요",
  };
}

/** 간이 동시성 제한 실행기 */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const { limit, workerId } = parseArgs(process.argv);
  const startedAt = new Date();
  console.log(`[verify] ${workerId} 시작 — 최대 ${limit}건`);

  const batch = await claimBatch(limit);
  if (batch.length === 0) {
    console.log("[verify] 검증 대상이 없습니다. 종료.");
    await pool.end();
    return;
  }
  console.log(`[verify] ${batch.length}건 클레임 완료`);

  const distribution = {};
  let done = 0;

  await mapLimit(batch, CONCURRENCY, async (biz) => {
    const signals = await collectSignals(biz);
    const llm = await judgeWithLLM(signals, biz);
    const { verdict, reason } = llm ?? ruleBasedVerdict(signals);

    // 지우는 계열 판정(not_korean/duplicate)은 상태를 강등하지 않고 검토 큐로 에스컬레이션
    const escalated = llm !== null && ESCALATE_TO_REVIEW.has(verdict);
    const finalStatus = escalated ? "needs_human" : verdict;

    const evidence = {
      signals,
      verdictSource: llm ? "llm" : "rules",
      reason,
      ...(escalated && { llmVerdict: verdict, escalatedToReview: true }),
      workerId,
      checkedAt: new Date().toISOString(),
    };
    await pool.query(
      `UPDATE businesses
       SET status = $1, last_checked_at = now(), evidence = $2
       WHERE id = $3`,
      [finalStatus, JSON.stringify(evidence), biz.id],
    );
    distribution[finalStatus] = (distribution[finalStatus] || 0) + 1;
    if (escalated) distribution.escalated = (distribution.escalated || 0) + 1;
    done++;
    if (done % 100 === 0) console.log(`[verify] 진행 ${done}/${batch.length}`);
  });

  const finishedAt = new Date();
  await pool.query(
    `INSERT INTO verification_runs (worker_id, batch_size, result, started_at, finished_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [workerId, batch.length, JSON.stringify(distribution), startedAt, finishedAt],
  );

  const secs = ((finishedAt - startedAt) / 1000).toFixed(1);
  console.log(`[verify] 완료 — ${batch.length}건, ${secs}초, 결과:`, distribution);
  await pool.end();
}

main().catch(async (err) => {
  console.error("[verify] 치명적 오류:", err);
  await pool.end();
  process.exit(1);
});

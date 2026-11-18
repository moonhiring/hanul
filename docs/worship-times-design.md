# 예배시간(worship_times) 수집 설계

> 작성: 기술팀(seat 137) / 2026-11-18
> 실행 담당: 데이터 에이전트 (D-1 완료 후 D-2로 착수)
> 목적: `churches.worship_times`(JSONB, 현재 전량 NULL)를 각 교회 공식 웹사이트에서 채운다.

---

## 1. 목표와 비목표

**목표**
- website가 있는 churches 레코드에서 예배/미사/법회 시간을 구조화해 `worship_times`에 저장
- 주기적 재확인(기본 90일)으로 변경 추적
- 수집 불가 사유(사이트 다운, 시간 정보 없음)도 evidence에 남겨 커버리지 측정 가능하게

**비목표**
- 소셜/블로그 등 비공식 채널에서의 추론 (2차 후보)
- 시간이 없는 교회에 대한 추정값 생성 — 없으면 NULL 유지
- 실시간성 — 90일 주기의 준정적 데이터로 충분

---

## 2. 데이터 형식 (worship_times JSONB)

```json
{
  "services": [
    { "day": "sun", "label": "주일 1부", "time": "09:00", "lang": "ko" },
    { "day": "sun", "label": "주일 2부", "time": "11:30", "lang": "ko" },
    { "day": "wed", "label": "수요예배", "time": "19:30", "lang": "ko" }
  ],
  "note": "새벽예배 매일 05:30",
  "source_url": "https://example-church.org/worship",
  "fetched_at": "2026-11-20T08:00:00Z",
  "confidence": 0.9,
  "model": "deepseek-chat"
}
```

- `day`: sun/mon/tue/wed/thu/fri/sat (소문자 고정)
- `time`: 24시간제 "HH:MM". 불명확하면 label에 원문 유지하고 time 생략
- `lang`: ko/en/ko+en 등 (있을 때만)
- `note`: 정형화 불가한 정보(새벽기도, 금요철야 등) 원문 요약
- 기존 스키마 변경 없음 — JSONB 내부 구조만 합의. 파싱 실패 시 전체를 저장하지 않음(NULL 유지)

---

## 3. 파이프라인

```
churches (website IS NOT NULL, status NOT IN archived/not_korean)
  → 큐 적재 (last_checked_at 오래된 순, 배치 500건)
  → [1] 홈페이지 GET (8초 타임아웃, 2MB 상한, robots.txt 준수)
  → [2] 후보 경로 순회: /worship, /예배, /service, /service-times, /about, /visit, /churchinfo
        (301 추적, 경로당 최대 2회 — 홈에서 시간을 찾으면 생략)
  → [3] HTML → 텍스트 정제 (script/style 제거, 4,000자 절단)
  → [4] DeepSeek 추출 (JSON 강제 출력, 스키마 §2, 온도 0)
  → [5] 검증 규칙: time 형식, day 값, "예배/미사/법회/worship/service/mass" 단서 ≥1
        → 통과 시 worship_times 저장 + last_checked_at 갱신 + evidence 기록
        → 실패 시 NULL 유지 + evidence에 실패 사유(site_down/no_schedule/parse_fail)
```

**실행 위치**: `data-pipeline/collect_worship_times.py` (신규) — verify 워커(`api/src/worker/verify.js`)의 큐 패턴 재사용하되 churches 전용 독립 스크립트. 적재는 기존처럼 서버 BOT 명령 블록으로 요청.

**LLM 설정**: `DEEPSEEK_API_KEY` (기존과 동일, `app/.env.txt`), model `deepseek-chat`, response_format JSON. 실패 시 재시도 1회 후 규칙 기반 폴백(시간 정규식 + "예배" 단서).

**예의 규칙(politeness)**: 도메인당 동시 1요청, 전역 동시 8, 요청 간 최소 200ms, User-Agent `HanulBot/1.0 (+https://hanul.world/bot)`.

---

## 4. 비용·시간 추정

- 대상: website 보유 약 1,100건 (전체 2,092건 중 — D-1 후 변동)
- 1건당 평균 1.6 페이지 × 4,000자 ≈ 입력 3k 토큰, 출력 150 토큰
- 건당 약 $0.001 이하 (deepseek-chat 기준) → 전체 1회 수집 $1~2, 시간 약 15~25분 (동시 8)
- 90일 재수집도 동일 비용 — 연간 $8 이하

---

## 5. 품질 검증

- 무작위 30건 사람 표본 대조 (웹사이트 원문 vs 저장값) — 정확도 90% 미만이면 프롬프트/규칙 수정 후 재수집
- 지표 리포트: 시도/성공/사유별 실패(site_down, no_schedule, parse_fail), confidence 분포
- `confidence < 0.7` 은 프론트에 "시간 미확인" 표시 (API는 그대로 반환, 표시 판단은 프론트)

## 6. 프론트 연동 (후속, 기술팀)

- `/churches` 카드에 "주일 09:00 · 11:30 외" 한 줄 요약 표시
- 상세(API `/api/churches/:id`는 이미 worshipTimes 반환 중)에 전체 시간표
- 디자인팀 다듬기 대상

---

## 7. 체크리스트 (D-2 착수 시)

1. [ ] `data-pipeline/collect_worship_times.py` 구현 (§3 파이프라인)
2. [ ] 10건 드라이런 → 출력 샘플 HANDOFF 공유
3. [ ] 100건 파일럿 → 지표 리포트 → 기술팀 승인
4. [ ] 전수 수집 (서버 BOT 명령 블록 전달)
5. [ ] 표본 검증 30건 → 정확도 기록
6. [ ] 재수집 스케줄 결정 (90일, Witty workflow 또는 서버 크론)

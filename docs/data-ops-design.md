# 한울 데이터 운영 설계 — 마중물 수집·검증·스토리 수확

작성일: 2026-11-01 | 상태: 설계 확정 + 뼈대 구현

## 0. 목표

1. **수집(Collect)**: 흩어진 한인 비즈니스/이야기 정보를 한 DB로 모은다.
2. **검증(Verify)**: 에이전트가 매일 에이전트당 1,000건씩 데이터 신선도·정확성을 검증한다.
3. **수확(Harvest)**: '좋은 이야기' 후보를 자동으로 긁어모아 에디터 큐에 올린다.

원칙: **사람은 마지막에만 개입**한다. 에이전트는 판정+근거를 남기고, 애매한 것만 사람에게.

---

## 1. 전체 구조

```
┌─ 수집기 (Collectors) ─────────────────────────────┐
│ Overture 월간 델타 │ OSM │ 공공데이터 │ RSS/뉴스 │ 제휴 │
└────────┬───────────────────────────────────────────┘
         ▼
┌─ 정규화·중복제거 (Normalize & Dedupe) ────────────┐
│ 이름 NFKC 정규화 + 좌표 근접 + 전화번호 매칭          │
└────────┬───────────────────────────────────────────┘
         ▼
   ┌─────────────┐      ┌─ 검증 워커 (Verify Agents) ────────┐
   │ PostgreSQL  │◄─────│ 큐 클레임(SKIP LOCKED) → 신호 수집   │
   │  = 작업 큐   │      │ → 판정(LLM) → 근거와 함께 기록       │
   └──────┬──────┘      └──────────────┬────────────────────┘
          │                            │
          ▼                            ▼
   한울 API (공개)              검토 큐 (사람/에디터)

┌─ 스토리 수확기 (Harvest) ──────────────────────────┐
│ RSS 수집 → 긍정 분류기(LLM) → story_candidates 큐   │
└───────────────────────────────────────────────────┘
```

---

## 2. 수집기 — 소스별 전략

| 소스 | 주기 | 방식 | 라이선스/약관 |
|---|---|---|---|
| Overture Maps Places | 월 1회 (릴리스 델타) | `data-pipeline` 재실행 → upsert | CDLA-Permissive 2.0 ✅ |
| OpenStreetMap | 월 1회 | Overpass로 `name:ko`, `cuisine=korean` | ODbL — 내부 보강용, 공개 DB 재배포 주의 |
| 각국 사업자 등록부 | 분기 | ABN Lookup(호주), Companies House(영국) 등 | 공공데이터 ✅ |
| 한인회·공관 디렉토리 | 분기 | 링크 허브로만 집계 (본문 크롤링 X) | 링크만 ✅ |
| 한인 언론 RSS | 매일 | 제목+요약+링크만 수집 | 전문 게재 금지, 링크 집계 |
| 업주 클레임 | 상시 | 앱 내 폼 (최우선 신뢰도) | 당사자 제공 ✅ |

원칙: **저작권 있는 본문은 저장하지 않는다.** 사실(상호·주소·전화)과 링크·요약만.

---

## 3. 검증 에이전트 — 1일 1,000건/대

### 작업 큐 (Postgres가 곧 큐 — 별도 MQ 불필요)

```sql
SELECT id FROM businesses
WHERE status IN ('pending','stale')
   OR last_checked_at < now() - interval '30 days'
ORDER BY last_checked_at NULLS FIRST
LIMIT 1000
FOR UPDATE SKIP LOCKED;   -- 워커 여러 대가 동시에 잡아도 중복 없음
```

### 검증 파이프라인 (건당 4단계)

1. **신호 수집 (규칙, 무료)**
   - 웹사이트 도달성 (HTTP 상태, 응답 시간)
   - 전화번호 존재·형식, 주소 존재 여부
   - Overture confidence 점수
2. **교차 확인 (검색)**
   - 상호+지역으로 웹 검색 → 최근 언급 존재 여부 (영업 중 신호)
3. **LLM 판정** (신호 묶음을 판정기에 전달)
   - 출력: `active | likely_closed | not_korean | duplicate | needs_human` + 판정 사유
   - 프롬프트 기준 톤: HANDOFF의 사이트 철학 참조
4. **기록**
   - `businesses.status`, `last_checked_at`, `evidence`(JSONB) 갱신
   - `verification_runs`에 배치 로그 (워커 id, 건수, 결과 분포, 소요 시간)

### 상태 기계

```
pending ──► active ──(30일 경과)──► stale ──► 재검증
   │           │
   ├─► likely_closed ──► (3회 연속) ──► 비노출(archived)
   └─► needs_human ──► 에디터 검토 큐 ──► 사람이 최종 확정

※ 지우는 계열 판정(not_korean, duplicate)은 LLM이 내더라도 자동 확정하지 않고
  needs_human으로 에스컬레이션 (2026-11-02 확정 — 오탐으로 한인 업체를 지우는 사고 방지).
  사람이 승인한 경우에만 status='not_korean' 확정 → API 비노출.
  needs_human은 무고 추정으로 공개 노출 유지.
```

### 처리량 계산
- 규칙 검사: 무료, 초당 수십 건
- LLM 판정: 건당 ~1초·수백 토큰 → 1,000건 ≈ 20분, 비용은 소형 모델 기준 일 수십 원~수백 원 수준
- 8,274건 전수 순회: 에이전트 1대로 약 8일, 2대면 4일. 이후 30일 주기 상시 순환.

---

## 4. 스토리 수확기

1. 한인 언론·커뮤니티 RSS를 매일 수집 (`story_sources` 테이블로 소스 관리)
2. 긍정 분류기(LLM)가 "응원하고 싶은 이야기" 점수화 — 사건사고·정치·비방 제외
3. 점수 상위만 `story_candidates`에 적재 (제목+요약+원문 링크, 본문 전문 저장 X)
4. 에디터가 큐에서 선택 → 한울 에디터가 직접 인터뷰/재작성 → 기고가 아닌 한 원문 링크로 보냄

---

## 5. 구현 현황 (2026-11-01)

- [x] Overture 수집 파이프라인 (`data-pipeline/`) — 10개 도시 8,274건
- [x] DB 스키마 확장 — `status`, `last_checked_at`, `evidence`, `verification_runs`, `story_candidates`, `story_sources`
- [x] 검증 워커 뼈대 — `api/src/worker/verify.js` (1단계 규칙 검사 동작, LLM 판정은 인터페이스만)
- [x] LLM 판정기 연결 — DeepSeek `deepseek-chat` (OpenAI 호환, `DEEPSEEK_API_KEY` 환경변수). JSON 강제 출력, 실패 시 규칙 폴백
- [ ] 웹 검색 교차 확인 연결
- [ ] RSS 수확기
- [ ] 매일 자동 실행 스케줄링 — compose에 `worker` 서비스 상시 기동, 또는 Kimi Work 크론 잡으로 일 1회 실행

## 6. 다음 결정 사항

1. ~~LLM 판정에 쓸 모델~~ → DeepSeek `deepseek-chat`으로 결정 (2026-11-02). 남은 것: 키 전달 경로(env/compose)와 일일 비용 상한 모니터링
2. 'not_korean' 오탐 허용률 — 보수적(놓침 허용) vs 적극적(오탐 허용)
3. 검증 주기 30일이 적절한지 (맛집은 짧게, 교회·기관은 길게 차등 가능)

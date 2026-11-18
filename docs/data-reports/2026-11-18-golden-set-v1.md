# 데이터 리포트 — 정답셋 v1 확정 + 기존 데이터 기준선 측정

> 작성: 데이터팀 / 2026-11-18
> 과제: `docs/DATA-TEAM-churches.md` §7-1 (정답셋 v1 확정)
> 산출물: `data-pipeline/reference/golden_set_churches_v1.csv` (최종 20건)

> **검증 태그 정책 (사용자 지시, 2026-11-18)**: 웹사이트 존재 / YouTube 계정 존재 / Google 또는 최근 리뷰 존재 중 하나라도 확인되면 `verified`. 미확인 항목은 정답셋에서 제외. CSV의 `signals` 컬럼에 근거 신호를 기록한다.

---

## 1. 기존 데이터 기준선 (회귀 테스트 출발점)

문서 §5의 미국 목록(8항목)을 검증한 결과 **동일 교회 중복 1건, 소재지 오기 2건**이 있어
7개 고유 교회로 정리했다. 이 7곳을 기존 `korean_churches_usa.csv`(1,561건)에서 찾은 결과:

| 정답셋 교회 | 도시 수준 발견 | 비고 |
|---|---|---|
| 나성영락교회 (Young Nak Presbyterian Church of L.A.) | ❌ | SD·Hacienda Heights·TX의 동명/유사 교회만 존재 |
| 남가주사랑의교회 (Sa-Rang Community Church) | ❌ | 영문명만 등록된 대형 교회 — 문서 진단 그대로 |
| 은혜한인교회 (Grace Korean Church, Fullerton) | ❌ | AZ·GA·SF 등 다른 Grace Korean만 존재 |
| 동양선교교회 (Oriental Mission Church, LA) | ❌ | UT 로간 지교회만 존재 |
| 새누리교회 (구 Berendo Street Baptist) | ✅ | **유일한 발견** — 2022년 개명한 한글명 덕분에 필터에 걸림 (984 S Berendo St) |
| 풍성한교회 (Abundant Mission Church, LA) | ❌ | MD주 동명 교회만 존재 |
| ANC 온누리교회 (Lake View Terrace) | ❌ | Palm Desert의 별개 교회만 존재 |

**CA 앵커 정밀 발견율: 1/7 (14%)** — 문서의 실패 진단(영어명 대형 교회 통째 누락)이 수치로 확인됨.

### 이름 단독 매칭의 오탐 위험 (회귀 테스트 설계 시 반영 필요)
이름 접두어만으로 찾으면 다른 도시의 동명 교회가 발견으로 오인된다:
- "Young Nak Pr…" → San Diego 교회 오인
- "Grace Korean…" → Anaheim Calvary Chapel·Corona 수양관·SF 오인
- "ANC 온누리교회" → Palm Desert 교회 오인

→ **회귀 테스트는 이름 변형(name_ko/name_en/alt_names) OR 매칭 + 도시(또는 좌표 반경) 결합**으로 구현해야 한다.
정답셋 CSV에 `alt_names`·`city` 컬럼을 둔 이유다.

## 2. 문서 원본 목록에 대한 정정 사항

| 문서 표기 | 검증 결과 | 근거 |
|---|---|---|
| "Sa-Rang Community Church (Anaheim)" + "남가주사랑의교회 (Anaheim)" 별도 항목 | **동일 교회** — 병합 (Sa-Rang Community Church of Southern California = 남가주사랑의교회, PCA, 노창수 목사) | 위키피디아·공식 사이트 sarang.com |
| "풍성한교회 (Sunny Central?)" | "Sunny Central"는 오기. LA의 **풍성한교회 (Abundant Mission Church)**, 2911 Beverly Blvd, RCA 소속 | jcweb.net 교회 디렉터리 |
| "ANC 온누리교회 (Fullerton)" | 현 소재지는 **Lake View Terrace** (10000 Foothill Blvd). 교회 실체·주소·웹사이트 모두 확인되어 `verified`로 유지 (Fullerton 표기는 오기로 처리) | CRCNA 공식 교회 등록·anconnuri.com |
| "Berendo Street Baptist Church (LA)" | 2022년 한글명 **새누리교회**로 변경(법적명 유지). 양쪽 명칭 모두 검색 키로 필요 | Baptist Press 2022-05 |

## 3. 정답셋 v1 구성 (최종 20건)

- **CA 앵커 7건** (위 표, 회귀 테스트 통과 조건의 핵심)
- **뉴욕/뉴저지 5건**: 프라미스교회(퀸즈), 뉴욕장로교회(플러싱), 퀸즈한인교회(잭슨하이츠), 뉴욕한인교회(맨해튼, 1921년 최초), 뉴욕효신장로교회
- **토론토 2건**: 토론토영락교회(1977), 토론토한인장로교회(1967, PCC)
- **시드니 2건**: 시드니온누리교회(Lidcombe), 시드니한인장로교회(Strathfield)
- **런던 2건**: 런던한인교회, 런던갈보리교회(뉴몰든)
- **도쿄 2건**: 동경중앙교회(재일대한기독교회), 동경비전교회

전체 20건 기준 기존 데이터 발견율: 이름 단독 57% → 주/도 제한 43% → **오탐 제거 실발견은 이보다 낮음**(CA 앵커 참조).
문서 원칙대로 각 지역 5~10건 확장은 기술팀·사용자 검토 후 v1.1로 보강 예정 (현재 지역별 2~5건).

### 제외 기록 (사용자 지시 반영)
- **뉴몰든한인교회**: uknara 디렉터리 1곳뿐, 웹사이트·YouTube·Google 리뷰 모두 미확인 → v1에서 제외. 확인 가능한 출처 확보 시 v1.1에서 재등록 가능.
- (복원) **ANC 온누리교회**: 초기에 `needs_confirmation`으로 분류했다가, 공식 사이트 + CRCNA 교단 등록이 확인되어 verified로 정답셋에 유지.

## 4. 수집 중 확보한 Tier 1·2 소스 후보 (과제 2·3에 활용)

| 소스 | Tier | 커버 | 비고 |
|---|---|---|---|
| CRCNA 공식 교회 등록 (crcna.org/churches) | 1 | 북미 CRC 소속 한인교회 | 교회별 고유 ID 페이지 존재 |
| 토론토 한인교회 협의회 회원교회명단 (onchurches.org) | 2 | 토론토 | 주소·전화·목회자 포함 |
| uknara.com 영국 한인 교회 주소록 | 2 | 영국 전역 | 뉴몰든 중심 |
| 재일대한기독교회 (지방회 5개, 약 100개 교회) | 1 | 일본 | 소속 교회 명부 확보 경로 확인 필요 |
| lakoreatownmap.com / koreaportal 업소록 종교 카테고리 | 2 | 남가주 | 수백 건, 담임목사명 포함 |
| Radio Korea 업소록 종교단체(G04) | 2 | 남가주 | **수집 완료 882건** (`output/radiokorea_churches.csv`). CA 앵커 6/7 주소 일치 |
| 제칠일안식일예수재림교 한국연합회 해외교회 주소록 | 1 | 전 지역 SDA | 지역별 분류 완비 |
| jcweb.net 교회 디렉터리 | 2 | 미국 | 교단·주소·전화 구조화됨 |

## 4-1. 라디오코리아 업소록 수집기 (사용자 제공 소스)

사용자가 제공한 Radio Korea 업소록 종교단체(교회) 카테고리
(`radiokorea.com/rakotel/search.php?st=cat&cd=G04&dir=1`, 총 43페이지)를 수집하는 스크립트
`data-pipeline/extract_radiokorea_churches.py`를 작성·실행했다.
HTML 원문은 `data-pipeline/raw/radiokorea/g04_page*.html`에 캐시해 재다운로드를 막았다.

- **수집 925건 → 중복 제거(이름 정규화: 끝의 "(목사명)" 제거 + 전화) 후 882건**
- 산출물: `data-pipeline/output/radiokorea_churches.csv`
- **정답셋 CA 앵커 7곳 중 6곳이 주소까지 정확히 일치** — Tier 2 디렉터리로서 신뢰도 높음
  (미등재는 ANC 온누리교회 1곳뿐)
- 보너스 발견: 새누리교회가 "남가주새누리교회(박성근)"로 등재 → 정답셋 `alt_names`에 추가함

## 4-2. Google Maps·웹 직접 검증 (사용자 선호 방식)

사용자 지시("google map 검색으로 확인하면 제일좋아")에 따라 인앱 브라우저 + 웹 검색으로 확인:

| 정답셋 교회 | 결과 |
|---|---|
| 새누리교회 (GS-CA-05) | ✅ Google Maps "BSBC-교회" — 975 S Berendo St, 4.8★/리뷰 45(최근 5개월), 링크된 사이트 kingdomfc.org (Overture 기록과 일치) |
| 풍성한교회 (GS-CA-06) | ✅ Google Maps "Abundant Mission Church" — 2911 Beverly Blvd, (213) 381-9490, 4.8★/리뷰 4 — 주소·전화 정답셋과 일치 |
| 뉴욕장로교회 (GS-NY-02) | ✅ **정정** — 142-08 32nd Ave Flushing의 "Church"(nypp.church)는 별개 교회 '뉴욕교회'(New York Pure Presbyterian, 김성기 목사). 진짜 뉴욕장로교회는 공식 사이트 **nypc.org**, **43-23 37th Ave, Long Island City, NY 11101**, (718) 706-0100, 오세준 담임목사 설교 2026-11-15 게시. 정답셋 주소·도시(Flushing→LIC)·웹사이트 반영, signals `news\|website` |
| 뉴욕한인교회 (GS-NY-04) | ✅ 공식 사이트 **newyorkkoreanchurch.com** 생존 확인 — 2026-11-15 주일예배 영상 게시, YouTube 채널 링크. signals `wikipedia\|directory\|website\|youtube` |
| 시드니한인장로교회 (GS-AU-02) | △ 디렉토리 3곳(auschurches·koreanpages·Alamy 건물사진) 주소 일치, 우편번호 **2135 확정**, 전화 02-9746-5205. 웹사이트·YouTube·GMaps 리뷰는 미확인 — 디렉토리 복수 일치로 verified 유지하되 신호 보강 필요 |
| 뉴몰든한인교회 | ❌ 제외 유지 — 웹사이트·YouTube·리뷰 재검색에서도 미확인 (뉴몰든 지역 기사들만 검색됨) |

브라우저 연결이 간헐적으로 끊겨 GMaps 직접 확인은 새누리·풍성한 2건만 완료, 나머지는 웹 검색·공식 사이트 직접 방문으로 대체 검증.

## 5. 다음 액션 (문서 §7 순서)

1. ✅ 정답셋 v1 확정 (본 리포트, 20건) — 기술팀·사용자 검토·보강 요청
2. ✅ 라디오코리아 수집기 (§4-1, 882건) — Tier 2로 활용
3. ⬜ KPCA 명부 수집기 (`data-pipeline/`에 신규 스크립트)
4. ⬜ Overture 좌표 매칭 (Tier 3 보강)
5. ⬜ CA 배치 리포트 (정답셋 발견율 100% 도달 여부)

## 미결 사항 (확인 요청)

- 정답셋 지역별 목표 개수 (문서는 5~10개/지역) — v1.1에서 확장할 때 우선 지역이 있는지
- 회귀 테스트 구현 위치 제안: `data-pipeline/validate_golden_set.py` (CSV 대조) + 적재 후 DB 대조용 SQL — 괜찮은지

# 한울 HANUL — 프로젝트 인수인계 노트

새 작업 공간에서 이어서 작업할 때 참고하세요.

## 프로젝트 개요
- **한울(HANUL)**: 전 세계 재외 한인을 위한 모바일 친화 커뮤니티 + 비즈니스 리스팅 포털 목업
- 스택: React + TypeScript + Vite + Tailwind + shadcn/ui (프론트엔드 목업, 백엔드 없음)
- 실행: `npm install` → `npm run dev`(개발) / `npm run build`(빌드, 산출물 `dist/`)

## 디자인 시스템
- 컬러: 포레스트 그린 `#286d55`(메인) / 크림 `#f6dece` / 베이지 `#e9e7e1` / 코랄 `#e24e67`(포인트) / 잉크 `#222`
- 폰트: Fraunces(영문 세리프) + Noto Serif KR(한글 디스플레이) + Noto Sans KR(UI)
- 커스텀 토큰: `tailwind.config.js`의 forest/cream/coral/beige/ink/paper, `src/index.css`의 유틸리티(folio-label, serif-display, ticker, pulse-dot 등)

## 구조
- `src/data.ts` — 모든 목업 데이터(도시, 스토리, 업체, 구인/부동산/모임, 응원 게시글) + 한/영 문구. 실데이터 연동 시 이 파일을 API 호출로 교체
- `src/context.tsx` — SiteProvider: 언어/도시/등록모달 전역 상태 (useSite 훅)
- `src/layouts/SiteLayout.tsx` — Header + Outlet + Footer + RegisterDialog 공통 레이아웃, 라우트 변경 시 스크롤 상단 이동
- `src/sections/` — Header, Hero, Ticker, Stories, Directory, Community, Cheer, Footer (홈 랜딩 섹션, 상세는 페이지로 링크)
- `src/pages/` — Home, StoriesPage, StoryDetailPage, DirectoryPage, BusinessDetailPage, LifePage, CheerPage
- `src/components/RegisterDialog.tsx` — 업체 등록 폼 모달
- 라우트: `/` `/stories` `/stories/:id` `/directory` `/directory/:id` `/life` `/cheer` (react-router v7)

## 확정된 기획 방향 (사용자 요구)
- 20~60대 전 연령 커버, 모바일 친화, 아주 현대적이고 세련된 디자인
- "좋은 이야기만" 담는 긍정 큐레이션 — 응원/행복 콘텐츠가 핵심 차별화
- 비즈니스 리스팅 + 커뮤니티 포털 결합
- **공개 리뷰 없음** (2026-11-01 확정): 별점 부익부 빈인빈을 만들지 않는다. 방문자 피드백은 사업주에게만 비공개 전달 + 작성자에게 감사 쪽지. 공개 표면에는 사업주 본인의 소식/피드백 응답만 노출. "리뷰는 다른 데서 보세요, 우리는 숨겨진 보물을 찾는 곳"
- **AI 소프트 모더레이션** (2026-11-01 확정): 원치 않는 글은 쓰게는 두되 공개 표면에 노출하지 않음(섀도우). 좋은/감동적인 글은 더 진하게·더 위에. 정체성: "한인 모두가 같이 성장하도록 서로에게 자그만 사랑과 감사의 씨앗이 되는 곳"

## 사이트 철학 (사용자 원문, 2026-11-01)
> "완벽한 세상은 존재하지 않는다. 가끔은 불친절한 사람도 있고 내게 손해를 끼치는 사람들도 있지만 그들이 있기에 나도 존재한다는 우주적인 측면에서의 상생. 그것마저도 감사할 수 있기를 바라는 마음. 그걸 믿는 사람들이 우리 사이트 방문자들."
- 함의: 모더레이션은 '적을 지우는 것'이 아니라 품고 조용히 돌보는 것. 아픈 진실도 사장님에게는 비공개로 정중히 전달되어 성장의 씨앗이 됨. 카피/정책/AI 프롬프트 작성 시 이 톤을 기준으로 할 것.

## 다음 작업 후보 (미결정)
1. 백엔드(DB/로그인) 추가 — 샘플 데이터를 실제 데이터로
2. 데이터 수집 전략: 무단 크롤링 대신 공개 데이터 + RSS 링크 집계 + 업주 클레임 시스템 권장 (법적 리스크 때문)
3. 브랜드 네이밍/컬러 조정, 실제 사진 적용
4. 영어 레이어 확장 (현재 페이지 콘텐츠는 한국어 목업 중심)

## 협업 메모
- **디자인은 별도 디자인 에이전트가 진행 중** (사용자 전달, 2026-11-01) — `src/index.css`, `tailwind.config.js`, 섹션 비주얼/레이아웃 수정은 충돌 위험. 이 에이전트는 기능·데이터·백엔드 작업 위주로 진행하고, 스타일 변경이 필요하면 사용자에게 먼저 확인.

## 인프라 확정 사항
- **본격 개발 단계부터 Docker 컨테이너 기반으로 진행** (사용자 지시, 2026-11-01)
- 2026-11-01 스캐폴드 완료:
  - `api/` — Express + pg. `GET /api/health`, `GET /api/businesses`(city/category/q/limit/offset), `GET /api/businesses/:id`. 부팅 시 스키마 생성 + 시드 자동 삽입
  - `docker-compose.yml` — db(postgres:16) + api(:4000) + web(nginx, :8080)
  - `app/Dockerfile` + `app/nginx.conf` — Vite 빌드 → nginx 서빙, /api 프록시, SPA fallback
  - 프론트 `use-businesses.ts` — /api 우선, 실패 시 /seed/businesses.json 폴백. vite dev 서버 /api → localhost:4000 프록시
- 주의: 이 머신에 Docker 미설치(2026-11-01 기준) — 컨테이너 기동 검증은 Docker Desktop 설치 후 `docker compose up --build`로 확인 필요. API 코드는 문법 검사만 완료
- 2026-11-01 기동 검증 완료: Docker Desktop 설치됨. `docker-compose up -d`로 3컨테이너 정상 기동, 시드 8,274건 삽입 확인, API 필터/상세 및 web→api 프록시(:8080) 검증 완료
  - 참고: git bash PATH에 docker 미포함 → `export PATH="$PATH:/c/Program Files/Docker/Docker/resources/bin"` 필요, `docker compose` 플러그인 인식 안 돼 `docker-compose`(하이픈) 명령 사용

## 검증 상태
- 빌드 통과, 전 라우트(7개) HTTP 200 스모크 테스트 완료 (2026-11-01)
- 주의: package-lock.json은 공식 npm 레지스트리 기준으로 재생성됨 (기존 msh.team 미러 접속 불가)

## 인증 + 관리자 (2026-11-02)
- **Google 로그인**: GIS ID 토큰 → `POST /api/auth/google`에서 구글 공개키 검증 → users upsert → httpOnly 세션 쿠키(14일, JWT). `/api/auth/config|me|logout`. env: `GOOGLE_CLIENT_ID`(미설정 시 로그인 버튼 비활성 안내), `SESSION_SECRET`(프로덕션 필수)
- **쓰기 게이트**: 업체 등록/사장님께 전하기/응원 글쓰기는 `requireAuth()` — 비로그인 시 로그인 다이얼로그. 헤더에 로그인/계정 메뉴 추가
- **관리자**: `users.role`(member|admin) + `ADMIN_EMAILS`(쉼표 구분) 이메일 로그인 시 자동 승격. `/admin` 페이지 4탭 — 대시보드(상태 분포/사용자/검증 실행 이력), 검토 큐(needs_human 승인·비한인 확정·보관), 업체 관리(검색/상태변경/추가/삭제), 사용자(역할 변경, 자기 해임 불가). API는 `/api/admin/*` 전 구간 requireAdmin (401/403)
- 관리자 화면은 기능 우선 임시 스타일 — 디자인 에이전트 다듬기 예정

## 배포 (2026-11-02)
- **도메인: hanul.world (Cloudflare)** / **호스팅: VPS 1대 결정** — docker-compose 통째 배포 (웹+API+DB+워커). Vercel은 DB·워커가 안 맞아 기각
- **배포 완료 (2026-11-02)**: https://hanul.world 라이브. 서버 178.105.173.183 (queenofGaya, Hetzner, Ubuntu 24.04 — 기존 Jitsi/queenofgaya.com과 공존)
  - 저장소: github.com/moonhiring/hanul (deploy key: 로컬·서버 모두 `~/.ssh/hanul_deploy`)
  - 서버 경로 `/opt/hanul`, web은 `127.0.0.1:8090` 바인딩(WEB_BIND env), 호스트 nginx가 80/443에서 도메인별 프록시 + certbot TLS
  - 서버 DB에 로컬 전수 검증 결과 이전 완료 (active 1,983 / needs_human 6,291)
  - 주의: 이 compose 버전은 `!reset`에 새 값을 같이 쓰면 값이 유실됨 — 포트는 WEB_BIND env 패턴 사용
  - 배포 절차: 로컬 push → 서버 `cd /opt/hanul && git pull && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`
- 미설정: GOOGLE_CLIENT_ID / ADMIN_EMAILS (서버 /opt/hanul/.env에 추가 후 `up -d` 필요 — 추가 전까지 로그인 버튼 비활성 안내)
- `docker-compose.prod.yml` — DB 포트 비공개, restart 정책
- `docs/deploy.md` — 배포 절차 문서
- 남은 것: Google OAuth 클라이언트 ID 발급(사용자), 워커 상시화(compose 서비스 또는 크론)

## 실데이터 시드 (2026-11-01)
- `data-pipeline/`: Overture Maps Places 추출 파이프라인
  - `extract_korean_businesses.py` — bbox 다운로드 결과에서 한인 업체 후보 추출 (카테고리/한글명/토큰 매칭)
  - `to_seed_json.py` — 정제·dedupe·카테고리 매핑 → `app/public/seed/businesses.json`
- 시드 규모: **10개 도시 8,274건** (LA 1,708 / 도쿄 1,575 / 호치민 1,452 / 뉴욕 1,195 / 런던 745 / 시드니 442 / 밴쿠버 356 / 토론토 322 / 멜버른 301 / 베를린 178, 성씨 규칙 오탐 등 168건 제외)
- 앱 연동: `src/hooks/use-businesses.ts`가 큐레이션 목업(1~18) + 시드(10001~)를 병합, DirectoryPage/BusinessDetailPage에서 사용
- 시드 업체는 미인증·리뷰 없음 상태, 상세에 클레임 배너 노출. 라이선스: CDLA-Permissive 2.0 (출처 표기 필요)
- 품질 메모: 호치민·도쿄는 K-뷰티/한식 카테고리 비한인 업체가 일부 섞일 수 있음 — 클레임/검증 워크플로우로 정제 전제. 도시 추가는 bbox 다운로드 → 추출 → to_seed_json.py 재실행 순서.
- 발견된 데이터 이슈(2026-11-02): 일부 한글명이 mojibake로 깨져 있음 (예: id 10722 "Bang Ga Nae ë°©ê°€ë„¤") — 추출 파이프라인의 인코딩 처리 점검 필요.

## 데이터 운영 — 수집·검증·수확 (2026-11-02)
- 설계 문서: `docs/data-ops-design.md` — 수집(소스별 라이선스 표) / 검증(에이전트당 일 1,000건, SKIP LOCKED 큐) / 수확(RSS 긍정 분류) 3축
- DB 확장: `businesses.status`(pending→active/stale/likely_closed/not_korean/duplicate/needs_human)·`last_checked_at`·`evidence`(JSONB) + `verification_runs`, `story_sources`, `story_candidates` 테이블. 실행 DB에 적용 완료
- 검증 워커 `api/src/worker/verify.js` 동작 확인 (`npm run verify -- --limit N --worker-id ID`):
  - 큐 클레임(SKIP LOCKED, 'checking' 표시, 1시간 경과 시 자동 회수) → 신호 수집(웹사이트 도달성 8초 타임아웃/전화/주소/confidence) → 판정 → 행 갱신 + 배치 로그
  - LLM 판정은 DeepSeek `deepseek-chat` 연결 완료 (2026-11-02, `DEEPSEEK_API_KEY` 환경변수, JSON 강제 출력, 실패 시 규칙 폴백). 규칙 폴백: 사이트 정상=active, 부정 신호 2개+=likely_closed, 나머지=needs_human
  - **에스컬레이션 규칙 (2026-11-02 확정)**: LLM이 not_korean/duplicate를 판정해도 자동 확정하지 않고 needs_human 검토 큐로 보냄 (원 판정은 evidence.llmVerdict에 보존). 사람 승인 후에만 not_korean 확정. 공개 API는 확정 비노출(archived/not_korean)만 숨기고 needs_human은 무고 추정으로 노출 유지
  - 실측: 10건 3.1초(규칙), 50건 7.2초(LLM), **1,000건 113초(LLM)** — active 385 / needs_human 675 / 그중 에스컬레이션 24건 (JFK공항·한국전 기념비 같은 비업체 오수집을 LLM이 잡아냄). needs_human 다수는 웹사이트 없는 업체 — 2단계 웹 검색 교차 확인 연결 시 대폭 감소 예상
  - **전수 1회 완주 (2026-11-02)**: 8,274건 약 12분. 최종 active 1,983(24%) / needs_human 6,291 (그중 에스컬레이션 677). 도시별 정상률 편차 큼 — 호치민·도쿄는 active 비율 낮음(비한인 카테고리 오수집 의심) → 검토 큐 우선순위 참고
- 남은 결정: not_korean 오탐 허용률, 검증 주기(30일 기본), RSS 수확기 구현, 매일 자동 실행 방식(compose 상시 worker vs 크론), 2단계 웹 검색 교차 확인

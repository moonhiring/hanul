# Hanul 프로젝트 에이전트 메모

## 팀 구성 (2026-11-18 사용자 확인)
- **나 (seat 137 · kimi-hanul lead dev)**: PM 겸 lead dev — 과제 배분, 진행 공유, 채널 운영
- **디자인 에이전트**: 서브 에이전트 — app/src 비주얼 담당 (기존 담당 분리 규칙과 동일)
- **데이터 에이전트**: 서브 에이전트 — data-pipeline/ 수집·검증 담당. 과제 문서 `docs/DATA-TEAM-churches.md` 전달 완료 상태로 간주
- durio-hanul 채널 멤버: TK(admin, 사람), 나(seat 137), `kimi-hanul-dev`(에이전트 — 디자인/데이터 중 하나로 추정, 소속 확인 필요)

## Witty 시트 (태스크 관리 SaaS — 사용자 운영 서비스)
- 좌석: **seat 137 · kimi-hanul lead dev**
- 키 파일 경로(키 값은 절대 기록하지 않음): `C:\Users\surgetobillions\.witty\seat-137-kimi-hanul-lead-dev\seat-137.key`
  - 환경변수 `WITTY_SEAT_KEY_FILE` 로 위 경로를 가리켜 사용
  - 토큰 캐시: 같은 폴더의 `seat-137.tok` (~15분 유효, 만료 시 재발급)
  - 규칙: 이 폴더만 읽고/쓴다. 다른 시트 폴더 접근 금지. 재등록(re-enrol) 금지 — 키 폐기됨
- base URL: `https://api.witty.team`
- 루프 간격: 30분 (서버 bootstrap `PT1800S`)
- 감시 채널: `general` (공지·합류 인사), `durio-hanul` (프로젝트 작업 채널, id `01a1ed9a-4990-7204-bc8c-a7dcf83c01e2`)
- 게스트 규칙: 배정된 카드·초대된 채널만 본다. 카드가 계약 — 결과는 카드 댓글로 보고. 자격증명 요청/수락 금지
- 첫 인사 게시 완료 (2026-11-18, general), durio-hanul 채널 개시 보고 완료
- **역할: 나는 durio-hanul의 PM 겸 lead dev (사용자 지정 2026-11-18)** — 과제는 카드로, 진행 공유와 채팅은 durio-hanul 채널
- **카드 생성**: 아래 "카드 생성 해결" 참고 — Durio.me 보드 경로로 생성 가능 (구 경로 거부 기록은 폐기)
- 디자인·데이터 에이전트 Witty 가입 예정 (2026-11-18 사용자 예고) — 가입하면 카드 배정+채널 보고 체계로 전환
- 첫 과제 채널 게시 완료 (2026-11-18): D-1 교회 데이터 재구축(docs/DATA-TEAM-churches.md), G-1 /churches 페이지 디자인 다듬기
- **카드 생성 해결 (2026-11-18, TK 제공 경로)**: `POST /api/v1/pms/boards/01a0f3e5-31d4-7399-8837-456167377eb3/tasks` (Durio.me 보드) — 필드: title, objective(필수, 없으면 objective_required), description, assignee_id, reviewer_id(본인 가능), status_id, acceptance_criteria[{text}]. 상태 id는 `GET /api/v1/pms/card-statuses`
- 생성된 카드: D-1 id `01a1edbc-75ec-7fcd-856b-be713b8d159f`, G-1 id `01a1edbd-f11a-728d-846c-ec2685cf59a5` — 둘 다 New, assignee/reviewer는 일단 나(137), 각 에이전트 가입 후 actor id 받아 전환
- 동작 확인된 경로: `/me`, `/me/brief`, `/me/bootstrap`, `/me/policy`, `/me/skills`, `/me/tasks`(GET), `/labels`, `/chat/*`
- **한글 포스팅 주의**: git bash curl `-d`에 한글 직접 넣으면 mojibake로 저장됨. Python으로 UTF-8 JSON을 임시파일에 쓰고 `curl --data-binary "@파일"` 로 전송. Cloudflare가 Python urllib(UA)를 error 1010으로 차단하므로 HTTP 호출은 항상 curl 사용

### Wake 시퀀스 (세션 시작 시)
```sh
export WITTY_SEAT_KEY_FILE="$HOME/.witty/seat-137-kimi-hanul-lead-dev/seat-137.key"
# 1. 토큰 발급
curl -s -X POST https://api.witty.team/join/token \
  -H "Content-Type: application/json" \
  -d "{\"seat_key\":\"$(cat "$WITTY_SEAT_KEY_FILE")\"}"
# → .data.token 을 ~/.witty/seat-137-kimi-hanul-lead-dev/seat-137.tok 에 저장
# 2. GET /api/v1/me            — seat 137 확인
# 3. GET /api/v1/me/brief      — 작업 규칙
# 4. GET /api/v1/me/bootstrap  — 카드/채널/케이던스
# 5. GET /api/v1/chat/conversations → 채널별 messages 확인
# 인증: Authorization: Bearer <token>
# 403 core.enrollment.error.out_of_scope = 경로 오타 또는 권한 부족. 재등록으로 "수정"하지 말 것.
```

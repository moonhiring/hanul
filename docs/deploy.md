# 한울 배포 가이드 — hanul.world (VPS 1대 + Cloudflare)

작성일: 2026-11-02 | 결정: VPS 1대에 docker-compose 통째로, Cloudflare는 DNS+TLS 담당

## 0. 준비물

| 항목 | 상태 |
|---|---|
| 도메인 hanul.world (Cloudflare 네임서버) | ✅ 완료 |
| VPS (Ubuntu 24.04, 2GB RAM 이상) | ⬜ 사용자가 생성 — Hetzner CX22(~€4) 또는 Oracle 프리티어(무료) |
| Google OAuth 클라이언트 ID | ⬜ Google Cloud Console에서 발급 |
| 이 저장소 | ✅ |

## 1. VPS 준비 (최초 1회)

```bash
# Ubuntu 24.04 기준
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 || sudo apt install -y docker-compose-plugin
sudo usermod -aG docker $USER   # 재로그인 후 적용

# 방화벽: SSH + HTTP만 열기 (TLS는 Cloudflare가 종단하므로 443은 선택)
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw enable
```

## 2. 코드 배포

```bash
git clone <repo-url> hanul && cd hanul
# git이 없다면 로컬에서: rsync -avz --exclude node_modules --exclude dist . user@<vps>:~/hanul/
```

## 3. 환경변수 — 서버에 `.env` 파일 생성 (compose가 자동으로 읽음)

```bash
cat > .env <<'EOF'
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
SESSION_SECRET=<openssl rand -hex 32 로 생성>
ADMIN_EMAILS=관리자@gmail.com
EOF
chmod 600 .env
```

> DB 비밀번호도 운영 전에 `docker-compose.yml`의 hanul/hanul을 바꾸는 것을 권장
> (DB 포트는 prod에서 외부 비공개라 급한 건 아님).

## 4. 기동

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
curl http://127.0.0.1:8090/api/health   # {"ok":true} 확인
```

> 실제 서버(178.105.173.183 queenofGaya)에는 호스트 nginx가 80/443에서 기존 사이트를 서빙 중이므로,
> 한울 web 컨테이너는 `127.0.0.1:8090`에만 바인딩하고 호스트 nginx가 도메인별로 프록시한다.
> (8080은 Jitsi가 사용 중) TLS는 호스트 certbot(Let's Encrypt)으로 발급.

## 5. Cloudflare DNS

| 유형 | 이름 | 값 | 프록시 |
|---|---|---|---|
| A | @ | `<VPS IP>` | 🟠 켬 (Proxied) |
| A | www | `<VPS IP>` | 🟠 켬 |

SSL/TLS 모드: **Full** (Flexible은 리다이렉트 루프 위험).
여유가 되면 Cloudflare Origin Certificate를 발급받아 nginx에 달고 **Full (strict)**로 상향.

## 6. Google OAuth 설정

발급받은 클라이언트 ID의 **승인된 JavaScript 원본**에 추가:

- `https://hanul.world`
- `https://www.hanul.world`
- `http://localhost:8080` (로컬 개발용)

## 7. 검증 워커 상시화 (배포 후)

`docker-compose.prod.yml`에 워커 서비스 추가 예정 — api 이미지를 재사용해
`node src/worker/verify.js --limit 1000`를 일 1회 실행하는 스케줄 컨테이너(또는 VPS 크론).
현재는 수동 실행:

```bash
docker-compose exec api node src/worker/verify.js --limit 1000 --worker-id prod-1
```

## 롤백

```bash
git checkout <이전 커밋> && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
# DB는 볼륨(db_data)에 유지되므로 코드만 롤백하면 됨
```

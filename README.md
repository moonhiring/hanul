# 한울 HANUL

전 세계 재외 한인을 위한 커뮤니티 + 비즈니스 리스팅 포털.

## 구조

| 경로 | 설명 |
|---|---|
| `app/` | 프론트엔드 — React + TypeScript + Vite + Tailwind + shadcn/ui |
| `api/` | 백엔드 — Node.js(Express) + PostgreSQL |
| `data-pipeline/` | Overture Maps 기반 한인 업체 시드 추출 파이프라인 |
| `docker-compose.yml` | web + api + db 통합 기동 |

## Docker로 실행 (권장)

Docker Desktop 설치 후:

```bash
docker compose up --build
```

- 웹: http://localhost:8080
- API: http://localhost:4000/api/health
- DB: localhost:5432 (hanul/hanul)

최초 기동 시 API가 스키마를 만들고 `app/public/seed/businesses.json`(10개 도시 8,274건)을 자동 삽입합니다.

## 로컬 개발 (Docker 없이)

```bash
cd app && npm install && npm run dev   # 프론트 :3000 — /seed JSON 폴백으로 동작
```

백엔드를 함께 띄우려면 로컬 PostgreSQL에 `hanul` DB를 만들고:

```bash
cd api && npm install && npm run dev   # :4000 — 프론트의 /api 요청이 프록시됨
```

프록시 대상 변경: `VITE_API_TARGET=http://host:port npm run dev`

## 데이터 파이프라인

```bash
cd data-pipeline
overturemaps download --bbox=<xmin,ymin,xmax,ymax> -f geojson --type=place -o raw/<city>_places.geojson
python extract_korean_businesses.py <city>
python to_seed_json.py   # app/public/seed/businesses.json 재생성
```

라이선스: Overture Maps Places — CDLA-Permissive 2.0 (출처 표기 필요)

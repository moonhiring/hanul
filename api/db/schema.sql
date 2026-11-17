CREATE TABLE IF NOT EXISTS businesses (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  raw_category  TEXT,
  city          TEXT NOT NULL,
  locality      TEXT,
  address       TEXT,
  phone         TEXT,
  website       TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  confidence    REAL,
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  source        TEXT NOT NULL DEFAULT 'overture',
  /* 검증 상태 (docs/data-ops-design.md §3) */
  status        TEXT NOT NULL DEFAULT 'pending',
  last_checked_at TIMESTAMPTZ,
  evidence      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses (city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses (category);
CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON businesses (lower(name));
/* 기존 배포 테이블용 마이그레이션 (idempotent) */
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS evidence JSONB;

CREATE INDEX IF NOT EXISTS idx_businesses_verify_queue
  ON businesses (last_checked_at NULLS FIRST) WHERE status IN ('pending','stale');

/* 검증 배치 실행 이력 */
CREATE TABLE IF NOT EXISTS verification_runs (
  id          BIGSERIAL PRIMARY KEY,
  worker_id   TEXT NOT NULL,
  batch_size  INT NOT NULL,
  result      JSONB NOT NULL,      -- {active: n, likely_closed: n, ...}
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

/* 사이트 기본 스타일 — 단일 행 (id=1 고정). 운영자가 지정하는 방문자 기본 폰트·질감 */
CREATE TABLE IF NOT EXISTS site_settings (
  id           SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  font_display TEXT NOT NULL,
  font_body    TEXT NOT NULL,
  texture      TEXT NOT NULL DEFAULT 'hanji',
  tex_level    TEXT NOT NULL DEFAULT 'base',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* 사용자 — Google 로그인 */
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  google_sub    TEXT NOT NULL UNIQUE,
  email         TEXT,
  name          TEXT,
  picture       TEXT,
  role          TEXT NOT NULL DEFAULT 'member',  -- member | admin
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';

/* 한인교회 — 업소록(businesses)과 분리된 전용 구조 (2026-11-17 결정)
   적재: api/scripts/load_churches.js (Overture 추출 CSV → upsert) */
CREATE TABLE IF NOT EXISTS churches (
  id            BIGSERIAL PRIMARY KEY,
  overture_id   TEXT UNIQUE,             -- Overture GERS id (외부 소스 dedupe 키)
  name          TEXT NOT NULL,
  name_en       TEXT,                    -- 영문명 (한글명 레코드 보완용)
  denomination  TEXT,                    -- 교단: 장로교/감리교/침례교/순복음/안식일/천주교/성공회/루터교 등
  country       TEXT,                    -- ISO 2자리 (US/JP/DE…)
  region        TEXT,                    -- 주/도 (CA, NY, 도쿄도…)
  locality      TEXT,                    -- 도시
  address       TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  phone         TEXT,
  website       TEXT,
  worship_times JSONB,                   -- 예배 시간 (추후 수집: [{day, time, lang, note}])
  confidence    REAL,
  source        TEXT NOT NULL DEFAULT 'overture',
  operating_status TEXT,                 -- Overture 원본값 (open 등)
  /* 검증 상태 — businesses와 같은 상태 기계 */
  status        TEXT NOT NULL DEFAULT 'pending',
  last_checked_at TIMESTAMPTZ,
  evidence      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_churches_country ON churches (country);
CREATE INDEX IF NOT EXISTS idx_churches_name ON churches (lower(name));
CREATE INDEX IF NOT EXISTS idx_churches_verify_queue
  ON churches (last_checked_at NULLS FIRST) WHERE status IN ('pending','stale');

/* 스토리 수확 — RSS 소스와 후보 */
CREATE TABLE IF NOT EXISTS story_sources (
  id      BIGSERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  feed_url TEXT NOT NULL UNIQUE,
  lang    TEXT DEFAULT 'ko',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS story_candidates (
  id          BIGSERIAL PRIMARY KEY,
  source_id   BIGINT REFERENCES story_sources(id),
  title       TEXT NOT NULL,
  link        TEXT NOT NULL UNIQUE,
  summary     TEXT,
  published_at TIMESTAMPTZ,
  warmth_score REAL,               -- 긍정 분류기 점수 0~1
  status      TEXT NOT NULL DEFAULT 'queued',  -- queued | picked | rejected
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

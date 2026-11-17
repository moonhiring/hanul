"""
Overture Maps Places → 해외 한인교회 추출 (국가 규모)

기존 extract_korean_businesses.py는 도시 bbox를 통째로 내려받았지만,
교회는 카테고리가 명확하므로 DuckDB로 S3 GeoParquet을 직접 질의한다
(카테고리 + bbox + 한글명 필터를 서버 데이터에 바로 적용 → 수GB 다운로드 불필요).

필터:
  카테고리: church / chapel / cathedral / place_of_worship 계열
  한인 신호: 이름에 한글 포함 OR 이름에 korean 포함

지역: usa(본토+하와이) → japan → europe(4타일) 순서.

출력: output/korean_churches_{region}.csv
라이선스: Overture Maps Places — CDLA-Permissive 2.0 (배포 시 attribution 필요)
"""
import re
import sys
from pathlib import Path

import duckdb

RELEASE = "2026-10-21.0"
S3 = f"s3://overturemaps-us-west-2/release/{RELEASE}/theme=places/type=place/*"

OUT = Path(__file__).parent / "output"
OUT.mkdir(exist_ok=True)

# (region_id, xmin, ymin, xmax, ymax)
# japan bbox는 동경 129.6부터 — 한국 본토(동단 129.4)를 제외하기 위함 (독도/울릉도는 country 필터로 제외)
REGIONS = {
    "usa": [
        ("usa-mainland", -125.0, 24.0, -66.9, 49.6),
        ("usa-hawaii", -161.0, 18.5, -154.5, 22.6),
        ("usa-alaska", -170.0, 51.0, -130.0, 71.5),
    ],
    "japan": [
        ("japan", 129.6, 30.9, 146.2, 45.7),
    ],
    "europe": [
        ("eu-west", -11.0, 34.9, 5.0, 61.0),
        ("eu-central", 5.0, 44.0, 19.0, 58.0),
        ("eu-north", 4.0, 58.0, 32.0, 71.5),
        ("eu-southeast", 19.0, 34.9, 45.0, 58.0),
    ],
}

# 국가 필터 — bbox가 이웃 나라를 침범하는 경우를 걸러낸다 (country가 비어있으면 유지)
COUNTRIES = {
    "usa": {"US"},
    "japan": {"JP"},
    "europe": {
        "GB", "IE", "FR", "DE", "NL", "BE", "LU", "CH", "AT", "ES", "PT", "IT", "MT",
        "SE", "NO", "DK", "FI", "IS", "PL", "CZ", "SK", "HU", "RO", "BG", "GR", "HR",
        "SI", "EE", "LV", "LT", "UA", "BY", "MD", "RS", "BA", "ME", "MK", "AL", "XK",
        "TR", "CY", "RU",
    },
}

QUERY = """
SELECT
  id,
  names['primary'] AS name,
  basic_category AS category,
  operating_status,
  confidence,
  addresses[1]['freeform'] AS address,
  addresses[1]['locality'] AS locality,
  addresses[1]['region'] AS region,
  addresses[1]['country'] AS country,
  phones[1] AS phone,
  websites[1] AS website,
  ST_X(geometry) AS lng,
  ST_Y(geometry) AS lat
FROM read_parquet($1, filename=true, hive_partitioning=1)
WHERE bbox.xmin BETWEEN $2 AND $4
  AND bbox.ymin BETWEEN $3 AND $5
  AND (
       lower(basic_category) LIKE '%church%'
    OR lower(basic_category) LIKE '%chapel%'
    OR lower(basic_category) LIKE '%cathedral%'
    OR lower(basic_category) LIKE '%place_of_worship%'
  )
  AND (
       regexp_matches(names['primary'], '[가-힯]')
    OR regexp_matches(lower(names['primary']), '\\bkorean\\b')
  )
"""


def main() -> None:
    targets = sys.argv[1:] or ["usa", "japan", "europe"]

    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute("INSTALL spatial; LOAD spatial;")
    con.execute("SET s3_region='us-west-2';")

    for region in targets:
        tiles = REGIONS.get(region)
        if not tiles:
            print(f"알 수 없는 지역: {region} (가능: {', '.join(REGIONS)})")
            continue

        frames = []
        for tile_id, xmin, ymin, xmax, ymax in tiles:
            print(f"[{region}/{tile_id}] 질의 중…", flush=True)
            df = con.execute(QUERY, [S3, xmin, ymin, xmax, ymax]).df()
            print(f"[{region}/{tile_id}] {len(df):,}건")
            frames.append(df)

        import pandas as pd

        merged = pd.concat(frames, ignore_index=True).drop_duplicates(subset="id")
        # 국가 필터: 주소의 country가 있으면 지역 국가 집합과 일치해야 함 (없으면 유지)
        keep = COUNTRIES[region]
        before = len(merged)
        merged = merged[merged["country"].isna() | (merged["country"] == "") | merged["country"].isin(keep)]
        if before != len(merged):
            print(f"[{region}] 국가 필터: {before:,} → {len(merged):,}건")
        out = OUT / f"korean_churches_{region}.csv"
        merged.to_csv(out, index=False, encoding="utf-8-sig")
        print(f"=== {region}: {len(merged):,}건 → {out}")
        if len(merged):
            print(merged["country"].value_counts().head(10).to_string())


if __name__ == "__main__":
    main()

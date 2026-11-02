"""
Overture Maps Places → 한인 비즈니스 후보 추출 PoC

필터 규칙 (OR):
 1) 카테고리에 'korean' 포함 (예: korean_restaurant)
 2) 이름에 한글 포함
 3) 이름에 한인 업체 시그널 토큰 포함 (korean, kimchi, seoul, kbbq, han-, hansik 등)

출력: korean_businesses_{city}.csv + 요약 통계
라이선스: Overture Maps Places — CDLA-Permissive 2.0 (일부 ODbL 상속, 배포 시 attribution 필요)
"""
import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path

BASE = Path(__file__).parent
RAW = BASE / "raw"
OUT = BASE / "output"
OUT.mkdir(exist_ok=True)

HANGUL = re.compile(r"[가-힯]")
SIGNAL_TOKENS = re.compile(
    r"\b(korean|korea|kimchi|seoul|kbbq|k-bbq|hansik|hangul|hallyu|k-?pop|bibimbap|bulgogi|soju|tteok|mandu|kalbi|galbi|jajang|samgye|hangeul|dae bak|daebak|onion ?hair|han ?river)\b",
    re.IGNORECASE,
)
# 이름 앞부분 흔한 한국 성씨/단어 패턴 (오탐 줄이기용 보조)
NAME_HINT = re.compile(
    r"^(kim'?s|lee'?s|park'?s|choi'?s|han'?s|shin'?s|yoon'?s|jung'?s|cho'?s|kang'?s|bae'?s|hwang'?s)\b",
    re.IGNORECASE,
)


def match_reason(name: str, primary_cat: str, alt_cats: list[str]) -> str | None:
    cats = " ".join([primary_cat or "", *alt_cats]).lower()
    if "korean" in cats:
        return "category:korean"
    if name and HANGUL.search(name):
        return "name:hangul"
    if name and SIGNAL_TOKENS.search(name):
        return "name:token"
    if name and NAME_HINT.search(name) and any(
        k in cats for k in ("restaurant", "market", "grocery", "salon", "clinic", "church")
    ):
        return "name:korean-surname"
    return None


def process(city: str, src: Path) -> None:
    rows, reasons, cat_counter = [], Counter(), Counter()
    total = 0
    with open(src, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('{"type"'):
                continue
            line = line.rstrip(",")
            if line.endswith("]}"):
                line = line[:-2]
            if line in ("]}", "]", "}"):
                continue
            total += 1
            feat = json.loads(line)
            props = feat.get("properties") or {}
            names = props.get("names") or {}
            name = names.get("primary") or ""
            taxonomy = props.get("taxonomy") or {}
            legacy_cats = props.get("categories") or {}
            primary = taxonomy.get("primary") or legacy_cats.get("primary") or props.get("basic_category") or ""
            alt = taxonomy.get("alternates") or legacy_cats.get("alternate") or []

            reason = match_reason(name, primary, alt)
            if not reason:
                continue

            geom = feat.get("geometry") or {}
            coords = geom.get("coordinates") or [None, None]
            addrs = props.get("addresses") or [{}]
            addr = addrs[0] if addrs else {}
            rows.append({
                "id": props.get("id", ""),
                "name": name,
                "category": primary,
                "confidence": props.get("confidence", ""),
                "reason": reason,
                "address": addr.get("freeform") or "",
                "locality": addr.get("locality") or "",
                "postcode": addr.get("postcode") or "",
                "phone": (props.get("phones") or [""])[0] if props.get("phones") else "",
                "website": (props.get("websites") or [""])[0] if props.get("websites") else "",
                "lng": coords[0],
                "lat": coords[1],
            })
            reasons[reason] += 1
            cat_counter[primary] += 1

    out_csv = OUT / f"korean_businesses_{city}.csv"
    with open(out_csv, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ["id"])
        w.writeheader()
        w.writerows(rows)

    print(f"\n=== {city.upper()} ===")
    print(f"전체 POI: {total:,} → 한인 후보: {len(rows):,} ({len(rows)/max(total,1)*100:.2f}%)")
    print(f"매칭 근거: {dict(reasons)}")
    print(f"상위 카테고리: {cat_counter.most_common(10)}")
    print(f"저장: {out_csv}")


if __name__ == "__main__":
    targets = sys.argv[1:] or ["nyc", "sydney"]
    for city in targets:
        process(city, RAW / f"{city}_places.geojson")

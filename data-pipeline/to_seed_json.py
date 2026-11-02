"""
korean_businesses_{city}.csv → 앱 시드 데이터(app/public/seed/businesses.json) 변환

정제 규칙:
 - name:korean-surname 매칭은 오탐률이 높아 제외 (별도 검토 큐로 분리 필요)
 - 이름 정규화 + locality 기준 dedupe
 - Overture 카테고리 → 한울 카테고리 매핑 (매핑 안 되면 '기타')
 - id는 10001부터 부여 (목업 데이터 1~18과 충돌 방지)
"""
import csv
import json
import re
import unicodedata
from pathlib import Path

BASE = Path(__file__).parent
OUT_CSV = BASE / "output"
APP_PUBLIC = BASE.parent / "app" / "public" / "seed"
APP_PUBLIC.mkdir(parents=True, exist_ok=True)

CITY_MAP = {
    "nyc": "뉴욕",
    "la": "로스앤젤레스",
    "toronto": "토론토",
    "vancouver": "밴쿠버",
    "sydney": "시드니",
    "melbourne": "멜버른",
    "london": "런던",
    "berlin": "베를린",
    "tokyo": "도쿄",
    "hcmc": "호치민",
}

# Overture taxonomy → 한울 카테고리
CATEGORY_MAP = {
    # 맛집
    "korean_restaurant": "맛집", "restaurant": "맛집", "barbecue_restaurant": "맛집",
    "chinese_restaurant": "맛집", "vietnamese_restaurant": "맛집", "japanese_restaurant": "맛집",
    "asian_restaurant": "맛집", "pizza_restaurant": "맛집", "fast_food_restaurant": "맛집",
    "cafe": "맛집", "coffee_shop": "맛집", "bakery": "맛집", "bubble_tea_shop": "맛집",
    "bar": "맛집", "cocktail_bar": "맛집", "pub": "맛집", "ice_cream_shop": "맛집",
    # 뷰티
    "hair_salon": "뷰티", "nail_salon": "뷰티", "beauty_salon": "뷰티", "spa": "뷰티",
    "barber_shop": "뷰티", "massage_therapist": "뷰티", "tattoo_and_piercing": "뷰티",
    # 의료
    "dental_clinic": "의료", "acupuncture": "의료", "medical_clinic": "의료",
    "doctor": "의료", "pharmacy": "의료", "optometrist": "의료", "chiropractor": "의료",
    "physical_therapy": "의료", "hospital": "의료", "dermatologist": "의료",
    "medical_laboratory": "의료", "alternative_medicine": "의료",
    # 법률·회계
    "financial_service": "법률·회계", "accountant": "법률·회계", "lawyer": "법률·회계",
    "legal_services": "법률·회계", "insurance_agency": "법률·회계", "tax_preparation": "법률·회계",
    "immigration_service": "법률·회계", "notary_public": "법률·회계", "bank": "법률·회계",
    # 교육
    "educational_service": "교육", "school": "교육", "language_school": "교육",
    "tutoring_service": "교육", "music_school": "교육", "art_school": "교육",
    "driving_school": "교육", "preschool": "교육", "child_care": "교육", "daycare": "교육",
    "martial_arts_club": "교육", "dance_school": "교육",
    # 부동산
    "real_estate_agency": "부동산", "real_estate": "부동산", "property_management": "부동산",
    "mortgage_broker": "부동산",
    # 마트·식료품
    "grocery_store": "마트·식료품", "korean_grocery_store": "마트·식료품",
    "supermarket": "마트·식료품", "farmers_market": "마트·식료품",
    "convenience_store": "마트·식료품", "butcher_shop": "마트·식료품",
    "liquor_store": "마트·식료품", "health_food_store": "마트·식료품",
    # 종교·기관
    "christian_place_of_worship": "종교·기관", "place_of_worship": "종교·기관",
    "religious_organization": "종교·기관", "buddhist_temple": "종교·기관",
    "social_and_human_service": "종교·기관", "community_center": "종교·기관",
    "non_profit_organization": "종교·기관", "government_office": "종교·기관",
}


def norm_key(name: str, locality: str) -> str:
    n = unicodedata.normalize("NFKC", name).lower()
    n = re.sub(r"[\s\-'\".,()&]+", "", n)
    return f"{n}|{locality.lower()}"


def main() -> None:
    seen: dict[str, dict] = {}
    next_id = 10001
    skipped = 0

    for city_file, city_ko in CITY_MAP.items():
        path = OUT_CSV / f"korean_businesses_{city_file}.csv"
        with open(path, encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                if row["reason"] == "name:korean-surname":
                    skipped += 1
                    continue
                if not row["name"].strip():
                    skipped += 1
                    continue
                key = norm_key(row["name"], row["locality"])
                rec = {
                    "name": row["name"].strip(),
                    "category": CATEGORY_MAP.get(row["category"], "기타"),
                    "rawCategory": row["category"],
                    "city": city_ko,
                    "address": row["address"],
                    "locality": row["locality"],
                    "phone": row["phone"],
                    "website": row["website"],
                    "lat": float(row["lat"]) if row["lat"] else None,
                    "lng": float(row["lng"]) if row["lng"] else None,
                    "confidence": float(row["confidence"]) if row["confidence"] else None,
                }
                # dedupe: confidence 높은 쪽 유지
                if key in seen:
                    if (rec["confidence"] or 0) <= (seen[key].get("confidence") or 0):
                        continue
                rec["id"] = seen[key]["id"] if key in seen else next_id
                if key not in seen:
                    next_id += 1
                seen[key] = rec

    records = sorted(seen.values(), key=lambda r: (r["city"], -(r["confidence"] or 0)))
    out = APP_PUBLIC / "businesses.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, separators=(",", ":"))

    from collections import Counter
    cats = Counter(r["category"] for r in records)
    cities = Counter(r["city"] for r in records)
    print(f"저장: {out} ({out.stat().st_size/1024:.0f} KB)")
    print(f"총 {len(records)}건 (제외 {skipped}건) | 도시: {dict(cities)}")
    print(f"카테고리: {cats.most_common()}")


if __name__ == "__main__":
    main()

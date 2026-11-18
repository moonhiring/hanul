"""
Radio Korea 업소록 — 종교단체(교회) 카테고리 수집기 (Tier 2 커뮤니티 디렉터리)

- 대상: https://www.radiokorea.com/rakotel/search.php?st=cat&cd=G04&dir=1&page=N
- 남가주 중심 한인 업소록. 한글명/영문명/전화/주소 구조화, 약 43페이지
- 같은 교회가 "(목사명)" 유무로 중복 등재되는 경우가 있음 → 이름 정규화+전화번호로 dedupe
- 출력: output/radiokorea_churches.csv

용도: Tier 2 보조 정답지. Tier 1(교단 명부) 결과와 교차 검증 + 소형 교회 후보.
"""
import re
import sys
import time
import urllib.request
from pathlib import Path

import pandas as pd

BASE = "https://www.radiokorea.com/rakotel/search.php?st=cat&cd=G04&dir=1&page={}"
RAW = Path(__file__).parent / "raw" / "radiokorea"
OUT = Path(__file__).parent / "output"
RAW.mkdir(parents=True, exist_ok=True)
OUT.mkdir(exist_ok=True)

ITEM_RE = re.compile(
    r'href="view\.php\?uid=(\d+)&dir=1".*?'
    r'<span class="name">([^<]+)</span>.*?'
    r'<span class="tel">([^<]*)</span>.*?'
    r'<div class="en-name">([^<]*)</div>\s*'
    r'<div class="address">([^<]*)</div>',
    re.S,
)


def fetch(page: int) -> str:
    path = RAW / f"g04_page{page}.html"
    if path.exists():
        return path.read_text(encoding="utf-8", errors="replace")
    req = urllib.request.Request(
        BASE.format(page), headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", errors="replace")
    path.write_text(html, encoding="utf-8")
    time.sleep(0.5)  # 예의상 딜레이
    return html


def norm_name(name: str) -> str:
    # "(목사명)" 꼬리표 제거 후 비교용 정규화
    return re.sub(r"\s*\([^)]*\)\s*$", "", name).strip()


def main() -> None:
    last_page = int(sys.argv[1]) if len(sys.argv) > 1 else 43
    rows = []
    for p in range(1, last_page + 1):
        html = fetch(p)
        items = ITEM_RE.findall(html)
        if not items:
            print(f"[page {p}] 항목 없음 — 종료로 판단")
            break
        for uid, name, tel, en, addr in items:
            rows.append({
                "uid": uid,
                "name": name.strip(),
                "phone": re.sub(r"[^\d]", "", tel),
                "name_en": en.strip(),
                "address": " ".join(addr.split()),
            })
        print(f"[page {p}] {len(items)}건")

    df = pd.DataFrame(rows)
    df["name_norm"] = df["name"].map(norm_name)
    before = len(df)
    # 전화번호+정규화 이름 기준 dedupe (전화 없으면 이름만)
    df["_key"] = df.apply(
        lambda r: f"{r['name_norm']}|{r['phone']}" if r["phone"] else r["name_norm"], axis=1
    )
    df = df.drop_duplicates(subset="_key").drop(columns=["_key"])
    out = OUT / "radiokorea_churches.csv"
    df.to_csv(out, index=False, encoding="utf-8-sig")
    print(f"\n=== 수집 {before:,}건 → dedupe 후 {len(df):,}건 → {out}")


if __name__ == "__main__":
    main()

import { useState } from "react";
import { Search, BadgeCheck, ArrowDown } from "lucide-react";
import { cities, i18n } from "@/data";
import { useSite } from "@/context";
import Globe from "@/components/Globe";

interface Props {
  onSearch: (q: string) => void;
}

export default function Hero({ onSearch }: Props) {
  const { lang, city } = useSite();
  const [q, setQ] = useState("");
  const cityName = cities.find((c) => c.id === city)?.ko ?? "뉴욕";

  return (
    <section id="top" className="relative overflow-hidden">
      {/* 세로쓰기 캡션 — 화면 우측 가장자리의 여백 장식 */}
      <p
        aria-hidden
        className="vertical-text absolute right-6 top-28 hidden select-none text-[11px] font-medium text-ink/40 xl:block"
      >
        세상 모든 한인을 잇다 — 하늘 아래, 한울
      </p>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-8 lg:pb-36 lg:pt-28">
        {/* 선언문 — 넓은 여백 위의 먹글씨 */}
        <div className="max-w-xl">
          <p className="folio-label fade-up">{i18n.hero.kicker[lang]}</p>
          <h1 className="serif-display fade-up fade-up-delay-1 mt-8 break-keep text-[2.7rem] font-black leading-[1.28] tracking-[-0.01em] text-ink sm:text-6xl sm:leading-[1.24] lg:text-[4.1rem]">
            {i18n.hero.title1[lang]}
            <br />
            <span className="text-forest">{i18n.hero.title2[lang]}</span>
          </h1>
          <p className="latin-serif fade-up fade-up-delay-1 mt-5 text-xl italic text-coral-deep sm:text-2xl">
            {i18n.hero.titleLatin}
          </p>
          <p className="fade-up fade-up-delay-2 mt-8 max-w-md text-base leading-8 text-ink/70">
            {i18n.hero.body[lang]}
          </p>

          {/* 검색 — 헤어라인 필 */}
          <form
            className="fade-up fade-up-delay-2 mt-10 flex max-w-md items-center rounded-full border border-border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-forest/25"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(q);
            }}
          >
            <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={i18n.hero.searchPlaceholder[lang]}
              className="w-full min-w-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
              aria-label={i18n.hero.searchBtn[lang]}
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-cream transition-opacity hover:opacity-90"
            >
              {i18n.hero.searchBtn[lang]}
            </button>
          </form>

          {/* 통계 — 얇은 먹줄 위 숫자 */}
          <div className="fade-up fade-up-delay-3 mt-14 flex gap-10 border-t border-ink/15 pt-7 sm:gap-14">
            <div>
              <p className="serif-display text-3xl font-black text-ink">42</p>
              <p className="mt-1.5 text-xs font-semibold tracking-wide text-muted-foreground">{i18n.hero.statCities[lang]}</p>
            </div>
            <div>
              <p className="serif-display text-3xl font-black text-ink">12,847</p>
              <p className="mt-1.5 text-xs font-semibold tracking-wide text-muted-foreground">{i18n.hero.statBiz[lang]}</p>
            </div>
            <div>
              <p className="serif-display text-3xl font-black text-ink">386</p>
              <p className="mt-1.5 text-xs font-semibold tracking-wide text-muted-foreground">{i18n.hero.statStories[lang]}</p>
            </div>
          </div>
        </div>

        {/* 3D 지구본 — 도시를 고르면 그곳을 향해 회전 */}
        <div className="relative mx-auto w-full max-w-[480px]">
          <Globe cityId={city} />

          {/* 떠 있는 카드 */}
          <div className="fade-up fade-up-delay-2 absolute -left-2 bottom-3 w-44 rounded-2xl border border-border bg-card p-3 shadow-md sm:-left-6">
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-forest" />
              <span className="text-[11px] font-bold text-forest">인증 업체</span>
            </div>
            <p className="serif-display mt-1.5 text-sm font-bold">달달 베이커리</p>
            <p className="text-[11px] text-muted-foreground">시드니 · 리뷰 342</p>
          </div>
          <div className="fade-up fade-up-delay-3 absolute -bottom-2 right-0 w-36 rounded-2xl bg-forest grain-deep p-3 shadow-lg sm:-right-4 sm:bottom-auto sm:top-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/70">지금 {cityName}에서는</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-cream">새 구인 공고 3건과 주말 모임이 올라왔어요</p>
          </div>

          <a
            href="#stories"
            className="absolute -bottom-10 left-1/2 hidden h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-ink transition-colors hover:bg-beige lg:flex"
            aria-label="아래로 스크롤"
          >
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowUpRight, ChevronDown, MapPin, Search, X } from "lucide-react";
import { bizCategories, cities, type BizCategory } from "@/data";
import { useBusinesses } from "@/hooks/use-businesses";

const PAGE_SIZE = 60;

export default function DirectoryPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState<BizCategory | "전체">("전체");
  const [city, setCity] = useState<string>("전체");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { businesses, seedLoaded } = useBusinesses();

  const query = (params.get("q") ?? "").trim().toLowerCase();

  const citiesWithBiz = useMemo(
    () => cities.filter((c) => businesses.some((b) => b.city === c.ko)),
    [businesses]
  );

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const catOk = cat === "전체" || b.category === cat;
      const cityOk = city === "전체" || b.city === city;
      const qOk =
        !query ||
        `${b.name}${b.category}${b.city}${b.tagline ?? ""}${b.locality ?? ""}${b.address ?? ""}`
          .toLowerCase()
          .includes(query);
      return catOk && cityOk && qOk;
    });
  }, [businesses, cat, city, query]);

  const visible = filtered.slice(0, limit);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLimit(PAGE_SIZE);
    setParams(q.trim() ? { q: q.trim() } : {});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <p className="folio-label">업소록 · Directory</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="serif-display text-3xl font-black text-ink sm:text-5xl">
          믿고 찾는
          <br />
          한인 비즈니스
        </h1>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          인증 배지, 실사용자 리뷰, 사장님 스토리까지. 전화번호부가 아닌 현대식 디렉토리입니다.
        </p>
      </div>

      {/* search */}
      <form
        onSubmit={applySearch}
        className="mt-10 flex max-w-lg items-center rounded-full border border-border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-forest/25"
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="업체명, 카테고리, 지역으로 검색"
          className="w-full min-w-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
          aria-label="업소록 검색"
        />
        <button type="submit" className="shrink-0 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-cream transition-opacity hover:opacity-90">
          검색
        </button>
      </form>

      {/* filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["전체", ...bizCategories] as const).map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              setLimit(PAGE_SIZE);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              cat === c
                ? "border-forest bg-forest text-cream"
                : "border-border bg-card text-ink/75 hover:border-forest hover:text-forest"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {["전체", ...citiesWithBiz.map((c) => c.ko)].map((c) => (
          <button
            key={c}
            onClick={() => {
              setCity(c);
              setLimit(PAGE_SIZE);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              city === c
                ? "border-ink bg-ink text-cream"
                : "border-border bg-card text-ink/70 hover:border-ink"
            }`}
          >
            {c}
          </button>
        ))}
        {query && (
          <button
            onClick={() => {
              setQ("");
              setParams({});
              setLimit(PAGE_SIZE);
            }}
            className="flex items-center gap-1.5 rounded-full bg-coral px-3.5 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            “{params.get("q")}” 검색 중 <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <p className="mt-8 text-xs font-semibold text-muted-foreground">
        {filtered.length.toLocaleString()}개의 업체
        {seedLoaded && " · 공공 POI 데이터(Overture Maps) 기반 시드 포함"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-beige/40 p-12 text-center">
          <p className="serif-display text-xl font-bold text-ink">조건에 맞는 업체가 아직 없어요</p>
          <p className="mt-2 text-sm text-muted-foreground">다른 카테고리나 검색어로 찾아보세요.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((b) => (
              <Link
                key={b.id}
                to={`/directory/${b.id}`}
                className="group rounded-3xl border border-border bg-card p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="serif-display flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-2xl font-black text-forest">
                    {b.initial}
                  </span>
                  {b.verified && (
                    <span className="flex items-center gap-1.5 rounded-full bg-forest/10 px-2.5 py-1 text-[11px] font-bold text-forest">
                      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-forest" />
                      인증
                    </span>
                  )}
                </div>
                <h2 className="serif-display mt-4 flex items-center gap-2 break-keep text-xl font-black leading-snug text-ink">
                  {b.name}
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
                </h2>
                <p className="mt-1 truncate text-sm text-muted-foreground">{b.tagline ?? b.category}</p>
                {b.promo && (
                  <p className="mt-3 w-fit rounded-full bg-coral/10 px-3 py-1 text-[11px] font-bold text-coral-deep">{b.promo}</p>
                )}
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-xs font-semibold text-ink/70">
                  <span className="uppercase tracking-wider text-forest">{b.category}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {b.locality ? `${b.locality} · ` : ""}{b.city}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length > limit && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setLimit((v) => v + PAGE_SIZE)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:border-forest hover:text-forest"
              >
                더 보기 ({(filtered.length - limit).toLocaleString()}개 남음)
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

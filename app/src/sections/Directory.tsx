import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, BadgeCheck, MapPin } from "lucide-react";
import { businesses, bizCategories, type BizCategory } from "@/data";

export default function Directory() {
  const [cat, setCat] = useState<BizCategory | "전체">("전체");

  const filtered = useMemo(
    () => businesses.filter((b) => cat === "전체" || b.category === cat),
    [cat]
  );

  const featured = filtered.filter((b) => b.featured);
  const rest = filtered.filter((b) => !b.featured).slice(0, 5);

  return (
    <section id="directory" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <p className="folio-label">업소록 · Directory — 02</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="serif-display text-3xl font-black text-ink sm:text-5xl">
            검증된 한인 비즈니스,
            <br />
            한눈에
          </h2>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            전화번호부가 아닙니다. 실사용자 리뷰와 인증 배지, 사장님의 이야기가 함께하는 현대식 디렉토리입니다.
          </p>
        </div>

        {/* filters */}
        <div className="mt-10 flex flex-wrap items-center gap-2">
          {(["전체", ...bizCategories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
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

        {/* featured cards */}
        {featured.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
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
                <h3 className="serif-display mt-4 text-xl font-black text-ink">{b.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.tagline}</p>
                <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-ink/70">
                  <span className="uppercase tracking-wider text-forest">{b.category}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {b.city}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ledger rows */}
        {rest.length > 0 && (
          <div className="mt-12">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">전체 목록</p>
            {rest.map((b, i) => (
              <Link
                key={b.id}
                to={`/directory/${b.id}`}
                className="group flex w-full items-center gap-4 border-b border-border py-5 text-left transition-colors hover:bg-beige/40"
              >
                <span className="latin-serif w-8 text-sm font-semibold text-coral-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="serif-display hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beige text-lg font-black text-forest sm:flex">
                  {b.initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="serif-display flex items-center gap-2 text-lg font-bold text-ink">
                    <span className="truncate">{b.name}</span>
                    {b.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-forest" />}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{b.tagline}</span>
                </span>
                <span className="hidden w-20 text-xs font-semibold uppercase tracking-wider text-forest md:block">{b.category}</span>
                <span className="hidden w-16 text-xs text-muted-foreground md:block">{b.city}</span>
                {b.verified && (
                  <span className="hidden items-center gap-1 text-[11px] font-bold text-forest sm:flex">
                    <BadgeCheck className="h-3.5 w-3.5" /> 인증
                  </span>
                )}
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/directory"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:border-forest hover:text-forest"
          >
            업소록 전체 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

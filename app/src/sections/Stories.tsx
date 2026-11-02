import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, Heart, MapPin } from "lucide-react";
import { stories } from "@/data";

export default function Stories() {
  const [featured, ...rest] = stories;

  return (
    <section id="stories" className="scroll-mt-20 border-t border-border bg-beige/40">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="flex items-end justify-between">
          <div>
            <p className="folio-label">이야기 · Stories — 01</p>
            <h2 className="serif-display mt-4 text-3xl font-black text-ink sm:text-5xl">
              응원하고 싶은
              <br />
              사람들의 하루
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm leading-6 text-muted-foreground md:block">
            사건사고가 아닌 사람 이야기. 한울 에디터가 직접 만나 기록하는 디아스포라의 좋은 소식만 담습니다.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          {/* featured */}
          <Link
            to={`/stories/${featured.id}`}
            className="group relative overflow-hidden rounded-3xl bg-forest grain-deep p-8 text-left transition-transform duration-300 hover:-translate-y-1 lg:col-span-3 lg:p-12"
          >
            <span className="rounded-full bg-coral px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
              {featured.tag}
            </span>
            <h3 className="serif-display mt-6 text-2xl font-black leading-snug text-cream sm:text-4xl lg:text-[2.6rem]">
              “{featured.title}”
            </h3>
            <p className="mt-5 max-w-lg text-sm leading-7 text-cream/80">{featured.excerpt}</p>
            <div className="mt-8 flex items-center gap-4 text-xs text-cream/70">
              <span className="font-bold text-cream">{featured.author}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {featured.city}
              </span>
              <span>{featured.readTime} 읽기</span>
              <span className="ml-auto flex items-center gap-1 font-semibold text-cream">
                <Heart className="h-3.5 w-3.5 fill-cream" /> {featured.cheers.toLocaleString()}
              </span>
            </div>
            <ArrowUpRight className="absolute right-6 top-6 h-6 w-6 text-cream/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-cream" />
          </Link>

          {/* ledger list */}
          <div className="lg:col-span-2">
            {rest.slice(0, 3).map((s, i) => (
              <Link
                key={s.id}
                to={`/stories/${s.id}`}
                className="group flex w-full items-start gap-4 border-b border-border py-6 text-left first:pt-0 last:border-b-0"
              >
                <span className="latin-serif mt-1 text-sm font-semibold text-coral-deep">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-forest">{s.tag}</span>
                  <span className="serif-display mt-1 block text-lg font-bold leading-snug text-ink transition-colors group-hover:text-forest">
                    {s.title}
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {s.city} · {s.date} · {s.readTime}
                  </span>
                </span>
                <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/stories"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:border-forest hover:text-forest"
          >
            모든 이야기 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Heart, MapPin } from "lucide-react";
import { stories } from "@/data";

export default function StoriesPage() {
  const tags = useMemo(() => ["전체", ...Array.from(new Set(stories.map((s) => s.tag)))], []);
  const [tag, setTag] = useState("전체");

  const filtered = tag === "전체" ? stories : stories.filter((s) => s.tag === tag);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <p className="folio-label">이야기 · Stories</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="serif-display text-3xl font-black text-ink sm:text-5xl">
          세계 각지에서 온
          <br />
          좋은 소식들
        </h1>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          한울 에디터가 직접 만나 기록하는 디아스포라의 이야기. 사건사고 대신 사람을 담습니다.
        </p>
      </div>

      {/* tag filter */}
      <div className="mt-10 flex flex-wrap gap-2">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              tag === t
                ? "border-forest bg-forest text-cream"
                : "border-border bg-card text-ink/75 hover:border-forest hover:text-forest"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold text-muted-foreground">{filtered.length}편의 이야기</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Link
            key={s.id}
            to={`/stories/${s.id}`}
            className="group flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="w-fit rounded-full bg-forest/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-forest">
              {s.tag}
            </span>
            <h2 className="serif-display mt-4 text-xl font-black leading-snug text-ink transition-colors group-hover:text-forest">
              {s.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{s.excerpt}</p>
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="font-bold text-ink">{s.author}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {s.city}
              </span>
              <span>{s.readTime}</span>
              <span className="ml-auto flex items-center gap-1 font-semibold text-ink/70">
                <Heart className="h-3.5 w-3.5 fill-coral text-coral" /> {s.cheers.toLocaleString()}
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

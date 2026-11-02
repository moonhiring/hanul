import { useState } from "react";
import { Link } from "react-router";
import { MessageSquare, Heart, ChevronDown, ArrowRight } from "lucide-react";
import { lifePosts, cities } from "@/data";

const tabIds = ["nyc", "sydney", "london", "hcmc"];

const kindStyle: Record<string, string> = {
  구인: "bg-forest/10 text-forest",
  부동산: "bg-coral/10 text-coral-deep",
  모임: "bg-ink/8 text-ink",
};

export default function Community() {
  const [tab, setTab] = useState("nyc");
  const [expanded, setExpanded] = useState(false);
  const posts = lifePosts[tab] ?? [];
  const visible = expanded ? posts : posts.slice(0, 3);

  return (
    <section id="community" className="scroll-mt-20 border-t border-border bg-beige/40">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="flex items-end justify-between">
          <div>
            <p className="folio-label">일자리·모임 · Life — 05</p>
            <h2 className="serif-display mt-4 text-3xl font-black text-ink sm:text-5xl">
              정착에 필요한 것들,
              <br />
              더 빠르게
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm leading-6 text-muted-foreground md:block">
            도시를 고르면 그 동네의 구인, 부동산, 모임 소식이 바로 보입니다. 게시판을 뒤질 필요가 없어요.
          </p>
        </div>

        {/* city tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          {tabIds.map((id) => {
            const c = cities.find((c) => c.id === id)!;
            return (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setExpanded(false);
                }}
                className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-colors ${
                  tab === id
                    ? "border-ink bg-ink text-cream"
                    : "border-border bg-card text-ink/75 hover:border-ink"
                }`}
              >
                {c.ko}
              </button>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card">
          {visible.map((p) => (
            <div key={p.id} className="flex items-center gap-4 border-b border-border px-5 py-5 transition-colors last:border-b-0 hover:bg-paper sm:px-7">
              <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${kindStyle[p.kind]}`}>{p.kind}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-ink">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.meta} · {p.time}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> {p.comments}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> {p.cheers}
                </span>
              </div>
            </div>
          ))}
        </div>

        {posts.length > 3 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:border-forest hover:text-forest"
            >
              {expanded ? "접기" : "더 보기"}
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/life"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-cream transition-opacity hover:opacity-90"
          >
            전체 게시판 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Heart } from "lucide-react";
import { cheerPosts } from "@/data";

export default function Cheer() {
  const [cheered, setCheered] = useState<Record<number, boolean>>({});
  const [popping, setPopping] = useState<Record<number, boolean>>({});

  const toggle = (id: number) => {
    setCheered((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!cheered[id]) {
      setPopping((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setPopping((prev) => ({ ...prev, [id]: false })), 400);
    }
  };

  return (
    <section id="cheer" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <p className="folio-label">응원 광장 · Cheer — 06</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="serif-display text-3xl font-black text-ink sm:text-5xl">
            지금, 응원이
            <br />
            필요한 이야기
          </h2>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            돈이 아니라 마음이 필요한 순간이 있습니다. 하트 하나가 낯선 땅의 누군가에겐 하루의 힘이 됩니다.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cheerPosts.slice(0, 3).map((p) => {
            const on = !!cheered[p.id];
            return (
              <article key={p.id} className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="serif-display flex h-11 w-11 items-center justify-center rounded-full bg-beige text-lg font-black text-forest">
                    {p.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.meta}</p>
                  </div>
                </div>
                <p className="mt-5 flex-1 text-[15px] leading-7 text-ink/85">{p.text}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <span className="text-sm font-bold text-ink">
                    {(p.cheers + (on ? 1 : 0)).toLocaleString()}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">명이 응원 중</span>
                  </span>
                  <button
                    onClick={() => toggle(p.id)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                      on ? "bg-coral text-white" : "border border-border bg-paper text-ink hover:border-coral hover:text-coral-deep"
                    }`}
                    aria-pressed={on}
                  >
                    <Heart className={`h-4 w-4 ${on ? "fill-white" : ""} ${popping[p.id] ? "heart-pop" : ""}`} />
                    {on ? "응원했어요" : "응원하기"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/cheer"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:border-coral hover:text-coral-deep"
          >
            응원 광장 가기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

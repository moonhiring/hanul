import { useState } from "react";
import {
  BookOpen, CloudRain, Coffee, Heart, Image as ImageIcon,
  MapPin, Play, Store, Sunset, TreePine, TramFront, UtensilsCrossed,
} from "lucide-react";
import type { Dispatch, DispatchMood } from "@/data";

const moodIcon: Record<DispatchMood, typeof Coffee> = {
  coffee: Coffee,
  park: TreePine,
  market: Store,
  rain: CloudRain,
  sunset: Sunset,
  food: UtensilsCrossed,
  street: TramFront,
  book: BookOpen,
};

/** 사진·영상 자리 — 실제 미디어가 들어올 플레이스홀더 (듀오톤 그라데이션 + 아이콘) */
function Media({ d }: { d: Dispatch }) {
  const Icon = moodIcon[d.mood];
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        aspectRatio: d.kind === "video" ? "16 / 9" : "4 / 3",
        background: `linear-gradient(150deg, hsl(${d.hue} 28% 88%), hsl(${d.hue} 32% 72%) 55%, hsl(${d.hue} 30% 58%))`,
      }}
      role="img"
      aria-label={`${d.city} ${d.neighborhood} ${d.kind === "video" ? "영상" : "사진"}`}
    >
      <Icon className="h-10 w-10 text-white/70" strokeWidth={1.25} />
      {d.kind === "video" ? (
        <>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/45 text-cream backdrop-blur-sm transition-transform group-hover:scale-105">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </span>
          </span>
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-ink/55 px-2 py-0.5 text-[10px] font-bold text-cream backdrop-blur-sm">
            {d.duration ?? "0:10"}
          </span>
        </>
      ) : (
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-ink/40 px-2 py-0.5 text-[10px] font-bold text-cream backdrop-blur-sm">
          <ImageIcon className="h-2.5 w-2.5" /> 사진
        </span>
      )}
      <span className="absolute left-2.5 top-2.5 rounded-full bg-cream/85 px-2.5 py-0.5 text-[10px] font-bold text-ink/80">
        {d.weather}
      </span>
    </div>
  );
}

export default function DispatchCard({ d }: { d: Dispatch }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="group mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {d.kind !== "note" && <Media d={d} />}
      <div className="p-5">
        {d.kind === "note" && (
          <p className="mb-3 flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
            <span className="rounded-full bg-beige px-2.5 py-0.5">{d.weather}</span>
            짧은 글
          </p>
        )}
        <p className={`text-ink/90 ${d.kind === "note" ? "serif-display text-lg font-bold leading-8" : "text-sm leading-7"}`}>
          {d.text}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink">{d.correspondent}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {d.city} · {d.neighborhood} · {d.time}
            </p>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            aria-pressed={liked}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              liked ? "bg-coral/10 text-coral-deep" : "text-muted-foreground hover:text-coral-deep"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-coral text-coral" : ""}`} />
            {d.likes + (liked ? 1 : 0)}
          </button>
        </div>
      </div>
    </article>
  );
}

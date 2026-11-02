import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowUpRight, Heart, MapPin } from "lucide-react";
import { stories } from "@/data";

export default function StoryDetailPage() {
  const { id } = useParams();
  const story = stories.find((s) => s.id === Number(id));
  const [cheered, setCheered] = useState(false);
  const [popping, setPopping] = useState(false);

  if (!story) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="serif-display text-2xl font-black text-ink">이야기를 찾을 수 없어요</p>
        <p className="mt-3 text-sm text-muted-foreground">주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
        <Link
          to="/stories"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" /> 이야기 목록으로
        </Link>
      </div>
    );
  }

  const related = stories.filter((s) => s.id !== story.id).slice(0, 2);
  const paragraphs = story.body.split("\n\n");

  const cheer = () => {
    setCheered((v) => !v);
    if (!cheered) {
      setPopping(true);
      setTimeout(() => setPopping(false), 400);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
      <Link
        to="/stories"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" /> 모든 이야기
      </Link>

      <article className="mt-8">
        <span className="rounded-full bg-forest px-3 py-1 text-[11px] font-bold text-cream">{story.tag}</span>
        <h1 className="serif-display mt-5 break-keep text-3xl font-black leading-snug text-ink sm:text-[2.6rem]">
          {story.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="font-bold text-ink">{story.author}</span>
          <span>{story.authorRole}</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {story.city}
          </span>
          <span>{story.date}</span>
          <span>{story.readTime} 읽기</span>
        </div>

        <div className="my-8 h-px bg-border" />

        {paragraphs.map((p, i) => (
          <p key={i} className="mb-6 text-[16px] leading-8 text-ink/85">
            {p}
          </p>
        ))}

        {/* cheer bar */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-border bg-beige/40 p-8 text-center">
          <p className="serif-display text-lg font-bold text-ink">이 이야기가 따뜻했다면, 하트로 응원해 주세요</p>
          <button
            onClick={cheer}
            aria-pressed={cheered}
            className={`flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-all ${
              cheered ? "bg-coral text-white" : "border border-border bg-card text-ink hover:border-coral hover:text-coral-deep"
            }`}
          >
            <Heart className={`h-4 w-4 ${cheered ? "fill-white" : ""} ${popping ? "heart-pop" : ""}`} />
            {cheered ? "응원했어요" : "응원하기"}
          </button>
          <p className="text-xs font-semibold text-muted-foreground">
            {(story.cheers + (cheered ? 1 : 0)).toLocaleString()}명이 이 이야기를 응원했습니다
          </p>
        </div>
      </article>

      {/* related */}
      <div className="mt-16">
        <p className="folio-label">이어서 읽기</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {related.map((s) => (
            <Link
              key={s.id}
              to={`/stories/${s.id}`}
              className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-forest">{s.tag}</span>
              <h3 className="serif-display mt-2 text-lg font-bold leading-snug text-ink transition-colors group-hover:text-forest">
                {s.title}
              </h3>
              <p className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                {s.city} · {s.readTime}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

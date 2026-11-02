import { useState } from "react";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cities, cheerPosts, type CheerPost } from "@/data";
import { toast } from "sonner";
import { useSite } from "@/context";

/**
 * AI 소프트 모더레이션 시뮬레이션.
 * 실제 서비스에서는 서버 측 분류 모델이 담당:
 *  - 부정 신호 → 작성은 받되 공개 표면에 노출하지 않음 (에디터 검토 큐행)
 *  - 따뜻한 신호 → '따뜻한 씨앗'으로 더 진하게 노출
 */
const NEGATIVE_SIGNALS = /(바보|멍청|꺼져|죽어|쓰레기|사기꾼|최악|망해라|혐오|정치인|투표)/;
const WARM_SIGNALS = /(감사|고마|덕분|응원|사랑|힘이|행복|따뜻|자랑|축하|보고싶)/;

export default function CheerPage() {
  const { requireAuth } = useSite();
  const [posts, setPosts] = useState<CheerPost[]>(cheerPosts);
  const [cheered, setCheered] = useState<Record<number, boolean>>({});
  const [popping, setPopping] = useState<Record<number, boolean>>({});

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const toggle = (id: number) => {
    setCheered((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!cheered[id]) {
      setPopping((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setPopping((prev) => ({ ...prev, [id]: false })), 400);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!name.trim() || !city || !text.trim()) {
      setError("이름, 도시, 이야기를 모두 입력해 주세요.");
      return;
    }
    const body = text.trim();
    setName("");
    setCity("");
    setText("");
    setError("");

    // 소프트 모더레이션: 부정 신호가 감지되면 공개 목록에 올리지 않는다
    if (NEGATIVE_SIGNALS.test(body)) {
      toast("접수되었습니다", {
        description: "한울 에디터가 검토한 뒤 게시 여부가 결정됩니다. 응원과 격려의 글은 바로 공개돼요.",
      });
      return;
    }

    const warm = WARM_SIGNALS.test(body);
    const cityName = cities.find((c) => c.id === city)?.ko ?? city;
    setPosts((prev) => [
      {
        id: Math.max(...prev.map((p) => p.id)) + 1,
        name: name.trim(),
        meta: `${cityName} · 방금 전`,
        text: body,
        cheers: 0,
        warm,
      },
      ...prev,
    ]);
    toast.success(
      warm
        ? "따뜻한 씨앗으로 선정됐어요 — 더 많은 분께 진하게 보여집니다 🌱"
        : "이야기가 올라왔습니다. 누군가의 하루가 조금 더 따뜻해질 거예요."
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <p className="folio-label">응원 광장 · Cheer</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="serif-display text-3xl font-black text-ink sm:text-5xl">
          지금, 응원이
          <br />
          필요한 이야기
        </h1>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          돈이 아니라 마음이 필요한 순간이 있습니다. 하트 하나가 낯선 땅의 누군가에겐 하루의 힘이 됩니다.
        </p>
      </div>

      {/* guideline */}
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-forest/20 bg-forest/5 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
        <p className="text-sm leading-6 text-ink/80">
          응원 광장에는 <b className="text-forest">응원과 격려</b>만 올라옵니다. 한울 AI가 부정적인 글은
          공개되지 않도록 조용히 가리고, 따뜻한 글은 더 진하게 보여줍니다. 모두가 기분 좋게 머무는 공간을 함께 만들어요.
        </p>
      </div>

      {/* write */}
      <form onSubmit={submit} className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-sm">
        <p className="serif-display text-lg font-bold text-ink">당신의 이야기도 들려주세요</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 또는 닉네임" className="bg-paper" />
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="bg-paper">
              <SelectValue placeholder="도시 선택" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.ko} · {c.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="응원받고 싶은 순간, 해낸 일, 시작하는 일을 들려주세요"
          className="mt-3 bg-paper"
          rows={3}
        />
        {error && <p className="mt-2 text-sm font-medium text-coral-deep">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-coral px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            이야기 올리기
          </button>
        </div>
      </form>

      {/* posts */}
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => {
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
                {p.warm && (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-bold text-coral-deep">
                    <Sparkles className="h-3 w-3" /> 따뜻한 씨앗
                  </span>
                )}
              </div>
              <p className={`mt-5 flex-1 leading-7 ${p.warm ? "text-base font-medium text-ink" : "text-[15px] text-ink/85"}`}>
                {p.text}
              </p>
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
    </div>
  );
}

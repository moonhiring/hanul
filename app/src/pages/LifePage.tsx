import { useMemo, useState } from "react";
import { Heart, MessageSquare, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cities, lifePosts, type LifePost } from "@/data";
import { toast } from "sonner";
import { useSite } from "@/context";

const kinds = ["전체", "구인", "부동산", "모임"] as const;

const kindStyle: Record<string, string> = {
  구인: "bg-forest/10 text-forest",
  부동산: "bg-coral/10 text-coral-deep",
  모임: "bg-ink/8 text-ink",
};

export default function LifePage() {
  const { city: siteCity } = useSite();
  const [city, setCity] = useState(siteCity);
  const [kind, setKind] = useState<(typeof kinds)[number]>("전체");
  const [active, setActive] = useState<LifePost | null>(null);

  const posts = useMemo(() => {
    const all = lifePosts[city] ?? [];
    return kind === "전체" ? all : all.filter((p) => p.kind === kind);
  }, [city, kind]);

  const cityName = cities.find((c) => c.id === city)?.ko ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <p className="folio-label">일자리·부동산·모임 · Life</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="serif-display text-3xl font-black text-ink sm:text-5xl">
          정착에 필요한 것들,
          <br />
          더 빠르게
        </h1>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          도시를 고르면 그 동네의 구인, 부동산, 모임 소식이 바로 보입니다. 게시판을 뒤질 필요가 없어요.
        </p>
      </div>

      {/* city tabs */}
      <div className="mt-10 flex flex-wrap gap-2">
        {cities.map((c) => (
          <button
            key={c.id}
            onClick={() => setCity(c.id)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              city === c.id
                ? "border-ink bg-ink text-cream"
                : "border-border bg-card text-ink/75 hover:border-ink"
            }`}
          >
            {c.ko}
          </button>
        ))}
      </div>

      {/* kind filter */}
      <div className="mt-3 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              kind === k
                ? "border-forest bg-forest text-cream"
                : "border-border bg-card text-ink/70 hover:border-forest hover:text-forest"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs font-semibold text-muted-foreground">
        {cityName} · {posts.length}개의 소식
      </p>

      {posts.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-beige/40 p-12 text-center">
          <p className="serif-display text-xl font-bold text-ink">아직 올라온 소식이 없어요</p>
          <p className="mt-2 text-sm text-muted-foreground">첫 소식을 올려주시겠어요?</p>
          <button
            onClick={() => toast.success("글쓰기는 로그인 후 이용할 수 있어요")}
            className="mt-6 rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-cream transition-opacity hover:opacity-90"
          >
            첫 글 올리기
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className="flex w-full items-center gap-4 border-b border-border px-5 py-5 text-left transition-colors last:border-b-0 hover:bg-paper sm:px-7"
            >
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
            </button>
          ))}
        </div>
      )}

      {/* post detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="bg-card sm:max-w-md">
          {!active && <DialogTitle className="sr-only">게시글 상세</DialogTitle>}
          {active && (
            <>
              <DialogHeader>
                <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold ${kindStyle[active.kind]}`}>
                  {active.kind}
                </span>
                <DialogTitle className="serif-display mt-3 text-xl font-black leading-snug">{active.title}</DialogTitle>
                <DialogDescription className="pt-1 text-xs">
                  {cityName} · {active.meta} · {active.time}
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 h-px bg-border" />
              <p className="text-[15px] leading-7 text-ink/85">
                {active.kind === "구인" &&
                  "상세 근무 조건과 지원 방법은 작성자와의 문의를 통해 안내받으실 수 있습니다. 한울 인증 업체의 공고는 사전 검증을 거칩니다."}
                {active.kind === "부동산" &&
                  "매물 사진, 정확한 위치, 입주 조건은 작성자에게 문의해 주세요. 계약 전 반드시 현장 확인을 권장합니다."}
                {active.kind === "모임" &&
                  "모임 시간, 장소, 참가비 등 자세한 내용은 작성자에게 문의해 주세요. 처음 오시는 분도 언제나 환영합니다."}
              </p>
              <button
                onClick={() => toast.success("문의 요청을 보냈습니다. 작성자가 확인하면 알림을 드릴게요.")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream transition-opacity hover:opacity-90"
              >
                <Send className="h-4 w-4" /> 작성자에게 문의하기
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

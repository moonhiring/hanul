import { useMemo, useState } from "react";
import { ArrowBigDown, ArrowBigUp, Flame, MessageSquare, PenLine, Clock3, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { communityChannels, communityPosts, type PostFlair } from "@/data";

type SortKey = "hot" | "new" | "comments";

const flairs: PostFlair[] = ["질문", "정보", "후기", "잡담", "나눔"];

const flairClass: Record<PostFlair, string> = {
  질문: "bg-coral/10 text-coral-deep",
  정보: "bg-forest/10 text-forest",
  후기: "bg-ink/10 text-ink/75",
  잡담: "bg-beige text-ink/70",
  나눔: "bg-coral/10 text-coral",
};

const sortTabs: { key: SortKey; label: string; icon: typeof Flame }[] = [
  { key: "hot", label: "인기순", icon: Flame },
  { key: "new", label: "최신순", icon: Clock3 },
  { key: "comments", label: "댓글순", icon: MessageSquare },
];

function fmtMembers(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

export default function CommunityPage() {
  const [channel, setChannel] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("hot");
  const [votes, setVotes] = useState<Record<number, -1 | 0 | 1>>({});
  const [writeOpen, setWriteOpen] = useState(false);
  const [written, setWritten] = useState(false);
  const [form, setForm] = useState({ title: "", channel: "", flair: "" as PostFlair | "", body: "" });

  const posts = useMemo(() => {
    const list = communityPosts.filter((p) => channel === "all" || p.channel === channel);
    const score = (p: (typeof communityPosts)[number]) => p.votes + (votes[p.id] ?? 0);
    return [...list].sort((a, b) =>
      sort === "hot" ? score(b) - score(a) : sort === "new" ? b.id - a.id : b.comments - a.comments
    );
  }, [channel, sort, votes]);

  const channelName = (id: string) => communityChannels.find((c) => c.id === id)?.name ?? id;

  const castVote = (id: number, dir: -1 | 1) =>
    setVotes((prev) => ({ ...prev, [id]: prev[id] === dir ? 0 : dir }));

  const submitPost = () => {
    if (!form.title.trim() || !form.channel || !form.flair || !form.body.trim()) {
      toast.error("제목, 마당, 말머리, 본문을 모두 채워 주세요.");
      return;
    }
    setWritten(true);
  };

  const activeChannel = channel === "all" ? null : communityChannels.find((c) => c.id === channel);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="folio-label">커뮤니티 · Community</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="serif-display text-3xl font-black text-ink sm:text-5xl">
          전 세계 한인의
          <br />
          마당을 엽니다
        </h1>
        <button
          onClick={() => {
            setWritten(false);
            setWriteOpen(true);
          }}
          className="flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <PenLine className="h-4 w-4" /> 글쓰기
        </button>
      </div>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
        도시별 마당과 주제별 마당에서 묻고, 답하고, 나눕니다. 좋은 글에는 공감을 모아 주세요.
      </p>

      {/* 모바일 마당 칩 */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
        <button
          onClick={() => setChannel("all")}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            channel === "all" ? "border-forest bg-forest text-cream" : "border-border bg-card text-ink/75"
          }`}
        >
          전체
        </button>
        {communityChannels.map((c) => (
          <button
            key={c.id}
            onClick={() => setChannel(c.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              channel === c.id ? "border-forest bg-forest text-cream" : "border-border bg-card text-ink/75"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[220px_1fr_260px]">
        {/* 좌측: 마당 목록 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-5">
            <p className="folio-label">마당 둘러보기</p>
            <nav className="mt-4 flex flex-col gap-1">
              <button
                onClick={() => setChannel("all")}
                className={`rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                  channel === "all" ? "bg-forest text-cream" : "text-ink/80 hover:bg-beige"
                }`}
              >
                전체 마당
              </button>
              {communityChannels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    channel === c.id ? "bg-forest text-cream" : "text-ink/80 hover:bg-beige"
                  }`}
                >
                  {c.name}
                  <span className={`text-[11px] ${channel === c.id ? "text-cream/70" : "text-muted-foreground"}`}>
                    {fmtMembers(c.members)}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 중앙: 피드 */}
        <section>
          {/* 정렬 탭 */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5">
            {sortTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setSort(t.key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-colors sm:text-sm ${
                    sort === t.key ? "bg-forest text-cream" : "text-ink/70 hover:text-forest"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          {activeChannel && (
            <div className="mt-4 rounded-3xl border border-border bg-beige/50 px-5 py-4">
              <p className="serif-display text-lg font-bold text-ink">{activeChannel.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activeChannel.desc} · 이웃 {fmtMembers(activeChannel.members)}명
              </p>
            </div>
          )}

          {/* 게시글 목록 */}
          <div className="mt-4 flex flex-col gap-3">
            {posts.map((p) => {
              const v = votes[p.id] ?? 0;
              const score = p.votes + v;
              return (
                <article
                  key={p.id}
                  className="flex gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-forest/40 sm:gap-4 sm:p-5"
                >
                  {/* 공감 컬럼 */}
                  <div className="flex w-9 shrink-0 flex-col items-center gap-0.5 pt-1">
                    <button
                      onClick={() => castVote(p.id, 1)}
                      aria-label="공감"
                      aria-pressed={v === 1}
                      className={`rounded-md p-1 transition-colors ${
                        v === 1 ? "text-forest" : "text-muted-foreground hover:text-forest"
                      }`}
                    >
                      <ArrowBigUp className={`h-5 w-5 ${v === 1 ? "fill-forest" : ""}`} />
                    </button>
                    <span
                      className={`text-xs font-black ${
                        v === 1 ? "text-forest" : v === -1 ? "text-coral" : "text-ink/70"
                      }`}
                    >
                      {score}
                    </span>
                    <button
                      onClick={() => castVote(p.id, -1)}
                      aria-label="공감 취소"
                      aria-pressed={v === -1}
                      className={`rounded-md p-1 transition-colors ${
                        v === -1 ? "text-coral" : "text-muted-foreground hover:text-coral"
                      }`}
                    >
                      <ArrowBigDown className={`h-5 w-5 ${v === -1 ? "fill-coral" : ""}`} />
                    </button>
                  </div>

                  {/* 본문 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className={`rounded-full px-2 py-0.5 font-bold ${flairClass[p.flair]}`}>{p.flair}</span>
                      <button
                        onClick={() => setChannel(p.channel)}
                        className="font-semibold text-forest/80 hover:underline"
                      >
                        {channelName(p.channel)}
                      </button>
                      <span>·</span>
                      <span>{p.author}</span>
                      <span>·</span>
                      <span>{p.city}</span>
                      <span>·</span>
                      <span>{p.time}</span>
                    </div>
                    <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-ink sm:text-base">{p.title}</h3>
                    <p className="mt-1 truncate text-[13px] text-ink/65">{p.excerpt}</p>
                    <div className="mt-2.5 flex items-center gap-4">
                      <button
                        onClick={() => toast.info("댓글 스레드는 곧 열립니다.")}
                        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-beige hover:text-forest"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> 댓글 {p.comments}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 우측: 안내 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="folio-label">마당 규칙</p>
              <ol className="mt-4 flex flex-col gap-3 text-[13px] leading-6 text-ink/80">
                <li className="flex gap-2.5">
                  <span className="latin-serif font-semibold text-coral-deep">1</span>
                  타인을 존중합니다. 지역·세대·정치 비하는 없습니다.
                </li>
                <li className="flex gap-2.5">
                  <span className="latin-serif font-semibold text-coral-deep">2</span>
                  광고·구인글은 업소록과 장인 소개를 이용해 주세요.
                </li>
                <li className="flex gap-2.5">
                  <span className="latin-serif font-semibold text-coral-deep">3</span>
                  비자·법률 정보는 참고용입니다. 최종 확인은 전문가와.
                </li>
                <li className="flex gap-2.5">
                  <span className="latin-serif font-semibold text-coral-deep">4</span>
                  나눔·거래는 직거래 우선, 선입금은 늘 주의하세요.
                </li>
              </ol>
            </div>
            <div className="rounded-3xl border border-border bg-forest p-6 text-cream">
              <TrendingUp className="h-5 w-5 text-cream/80" />
              <p className="serif-display mt-3 text-lg font-bold">이번 주 뜨는 마당</p>
              <ul className="mt-3 flex flex-col gap-2 text-[13px]">
                {["중고나눔", "정착팁", "뉴욕마당"].map((n) => (
                  <li key={n} className="flex items-center justify-between border-b border-cream/15 pb-2 last:border-0 last:pb-0">
                    {n}
                    <span className="flex items-center gap-1 text-cream/70">
                      <Users className="h-3 w-3" />
                      {fmtMembers(communityChannels.find((c) => c.name === n)?.members ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* 글쓰기 다이얼로그 */}
      <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
        <DialogContent className="max-w-lg bg-paper">
          <DialogHeader>
            <DialogTitle className="serif-display text-xl font-black text-ink">
              {written ? "글이 접수되었습니다" : "마당에 글 올리기"}
            </DialogTitle>
          </DialogHeader>
          {written ? (
            <div className="py-4">
              <p className="text-sm leading-7 text-ink/80">
                마당지기가 확인한 뒤 게시됩니다. 좋은 이야기를 나눠 주셔서 고맙습니다.
              </p>
              <button
                onClick={() => setWriteOpen(false)}
                className="mt-6 w-full rounded-full bg-forest py-3 text-sm font-bold text-cream transition-opacity hover:opacity-90"
              >
                확인
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="제목을 입력하세요"
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-forest"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.channel} onValueChange={(v) => setForm((f) => ({ ...f, channel: v }))}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-sm">
                    <SelectValue placeholder="마당 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {communityChannels.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.flair} onValueChange={(v) => setForm((f) => ({ ...f, flair: v as PostFlair }))}>
                  <SelectTrigger className="rounded-xl border-border bg-card text-sm">
                    <SelectValue placeholder="말머리" />
                  </SelectTrigger>
                  <SelectContent>
                    {flairs.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="이웃들과 나눌 이야기를 적어 주세요"
                rows={6}
                className="resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 outline-none focus:border-forest"
              />
              <button
                onClick={submitPost}
                className="rounded-full bg-coral py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                글 올리기
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

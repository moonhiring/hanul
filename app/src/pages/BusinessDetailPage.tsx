import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Clock,
  Globe,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Ticket,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ownerPosts } from "@/data";
import { toast } from "sonner";
import { useSite } from "@/context";
import { useBusinesses } from "@/hooks/use-businesses";

const kindStyle: Record<string, string> = {
  소식: "bg-forest/10 text-forest",
  "피드백 응답": "bg-coral/10 text-coral-deep",
  "감사 인사": "bg-ink/8 text-ink",
};

export default function BusinessDetailPage() {
  const { id } = useParams();
  const { businesses } = useBusinesses();
  const biz = businesses.find((b) => b.id === Number(id));
  const { openRegister, requireAuth } = useSite();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [fbName, setFbName] = useState("");
  const [fbText, setFbText] = useState("");
  const [fbError, setFbError] = useState("");

  if (!biz) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="serif-display text-2xl font-black text-ink">업체를 찾을 수 없어요</p>
        <p className="mt-3 text-sm text-muted-foreground">주소가 바뀌었거나 아직 등록되지 않은 업체입니다.</p>
        <Link
          to="/directory"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" /> 업소록으로
        </Link>
      </div>
    );
  }

  const isSeed = biz.source === "overture";
  const posts = ownerPosts.filter((p) => p.businessId === biz.id);
  const similar = businesses.filter((b) => b.category === biz.category && b.id !== biz.id && !b.source).slice(0, 3);

  const sendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbText.trim()) {
      setFbError("전할 말을 적어 주세요.");
      return;
    }
    setFbError("");
    setFeedbackOpen(false);
    setFbText("");
    setFbName("");
    toast.success(`${biz.name} 사장님께 조용히 전달했습니다`, {
      description: "공개되지 않아요. 전해 주셔서 고맙습니다 — 감사 쪽지를 보내드렸어요 💌",
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:py-20">
      <Link
        to="/directory"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" /> 업소록
      </Link>

      {/* header card */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            <span className="serif-display flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-cream text-4xl font-black text-forest">
              {biz.initial}
            </span>
            <div>
              <h1 className="serif-display flex items-center gap-2 break-keep text-3xl font-black leading-snug text-ink">
                {biz.name}
                {biz.verified && <BadgeCheck className="h-6 w-6 shrink-0 text-forest" />}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {biz.category} · {biz.locality ? `${biz.locality}, ` : ""}{biz.city}
              </p>
              {biz.verified && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-2.5 py-1 text-[11px] font-bold text-forest">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-forest" />
                  한울 인증 업체 — 실방문 검증 완료
                </span>
              )}
            </div>
          </div>

          {/* actions */}
          <div className="grid grid-cols-3 gap-2 sm:w-64">
            {[
              { icon: Phone, label: "전화하기" },
              { icon: MessageCircle, label: "문의하기" },
              { icon: CalendarCheck, label: "예약하기" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => toast.success(`${biz.name}에 ${label.replace("하기", "")} 요청을 보냈습니다`)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-paper py-3.5 text-xs font-bold text-ink transition-colors hover:border-forest hover:text-forest"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="my-7 h-px bg-border" />
        {biz.tagline && <p className="serif-display text-lg font-bold capitalize text-ink">{biz.tagline}</p>}
        <p className="mt-3 max-w-2xl text-[15px] leading-8 text-ink/85">
          {biz.about ??
            `${biz.city}${biz.locality ? ` ${biz.locality}` : ""} 지역의 한인 관련 업체입니다. 기본 정보는 공공 POI 데이터(Overture Maps, CDLA-Permissive 2.0)를 바탕으로 하며, 업주가 클레임하면 소개·사진·프로모션이 여기에 표시됩니다.`}
        </p>

        {biz.promo && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-coral/10 p-4">
            <Ticket className="h-5 w-5 shrink-0 text-coral" />
            <p className="text-sm font-bold text-coral-deep">{biz.promo}</p>
          </div>
        )}

        {/* info */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-beige/50 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-forest" /> 주소
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink">{biz.address || "정보 준비 중"}</p>
          </div>
          <div className="rounded-2xl bg-beige/50 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-forest" /> 전화
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink">{biz.phone || "정보 준비 중"}</p>
          </div>
          <div className="rounded-2xl bg-beige/50 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {biz.website ? <Globe className="h-3.5 w-3.5 text-forest" /> : <Clock className="h-3.5 w-3.5 text-forest" />}
              {biz.website ? "웹사이트" : "영업시간"}
            </p>
            {biz.website ? (
              <a
                href={biz.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block truncate text-sm font-semibold leading-6 text-forest underline-offset-2 hover:underline"
              >
                {biz.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">{biz.hours || "정보 준비 중"}</p>
            )}
          </div>
        </div>
      </div>

      {/* 사장님 소식 — 공개 표면은 사업주 발신 글만 */}
      <div className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="serif-display text-2xl font-black text-ink">사장님 소식</h2>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
              한울에는 별점과 리뷰가 없습니다. 대신 사장님이 직접 전하는 소식과, 방문자 피드백에 대한 응답이 여기에 담깁니다.
            </p>
          </div>
          <button
            onClick={() => {
              if (requireAuth()) setFeedbackOpen(true);
            }}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-coral hover:text-coral-deep"
          >
            <HeartHandshake className="h-4 w-4" />
            사장님께 조용히 전하기
          </button>
        </div>

        {posts.length > 0 ? (
          <div className="mt-6 space-y-4">
            {posts.map((p) => (
              <article key={p.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${kindStyle[p.kind]}`}>{p.kind}</span>
                  <span className="text-[11px] text-muted-foreground">{p.date}</span>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-ink/85">{p.text}</p>
                <p className="mt-4 text-xs font-bold text-forest">{biz.name} 사장님</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-beige/40 p-10 text-center">
            <p className="serif-display text-lg font-bold text-ink">아직 사장님 소식이 없어요</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              다녀오셨다면 사장님께 조용히 한마디를 건네보세요. 사장님이 답하면 그 소식이 여기에 처음으로 놓입니다.
            </p>
            <button
              onClick={() => setFeedbackOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-cream transition-opacity hover:opacity-90"
            >
              <HeartHandshake className="h-4 w-4" /> 첫 한마디 건네기
            </button>
          </div>
        )}
      </div>

      {/* similar */}
      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="serif-display text-2xl font-black text-ink">같은 카테고리의 다른 업체</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {similar.map((b) => (
              <Link
                key={b.id}
                to={`/directory/${b.id}`}
                className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="serif-display flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-beige text-xl font-black text-forest">
                  {b.initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="serif-display block truncate text-base font-bold text-ink transition-colors group-hover:text-forest">
                    {b.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {b.city}{b.verified ? " · 인증" : ""}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* claim banner */}
      <div className="mt-14 flex flex-col items-center gap-3 rounded-3xl bg-forest p-8 text-center sm:p-10">
        <p className="serif-display text-xl font-black text-cream">
          {isSeed ? "이 가게의 사장님이신가요?" : "내 업체를 한울에 올리고 싶으신가요?"}
        </p>
        <p className="max-w-md text-sm leading-6 text-cream/75">
          {isSeed
            ? "업체 정보를 직접 관리하고 소식과 프로모션을 올려보세요. 클레임은 무료이며 인증 배지가 부여됩니다."
            : "업체 정보를 직접 관리하고 소식을 올려보세요. 클레임은 무료입니다."}
        </p>
        <button
          onClick={openRegister}
          className="mt-2 rounded-full bg-cream px-6 py-3 text-sm font-bold text-forest transition-opacity hover:opacity-90"
        >
          내 업체로 클레임하기
        </button>
      </div>

      {/* 비공개 피드백 다이얼로그 */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="serif-display text-2xl">사장님께 조용히 전하기</DialogTitle>
            <DialogDescription className="leading-6">
              이곳에 남긴 말은 <b className="text-forest">사장님만</b> 읽습니다. 별점도, 공개 리뷰도 없어요.
              고마웠던 일, 아쉬웠던 일, 바라는 것 — 무엇이든 편하게.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={sendFeedback} className="mt-2 space-y-3">
            <Input
              value={fbName}
              onChange={(e) => setFbName(e.target.value)}
              placeholder="이름 또는 닉네임 (선택)"
              className="bg-paper"
            />
            <Textarea
              value={fbText}
              onChange={(e) => setFbText(e.target.value)}
              placeholder="예) 아이가 알레르기가 있는데 재료를 자세히 알려주셔서 감사했어요"
              className="bg-paper"
              rows={4}
            />
            {fbError && <p className="text-sm font-medium text-coral-deep">{fbError}</p>}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" /> 사장님께만 전달하기
            </button>
            <p className="text-center text-[11px] leading-5 text-muted-foreground">
              전달하면 감사 쪽지가 발송됩니다. 좋은 말은 사장님의 하루가 됩니다.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

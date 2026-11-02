import { useMemo, useState } from "react";
import { Handshake, Quote, ShieldCheck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cities, tradeKinds, tradespeople, type TradeKind } from "@/data";
import IntroduceTradeDialog from "@/components/IntroduceTradeDialog";

const steps = [
  {
    n: "01",
    title: "이웃이 소개 등록",
    body: "직접 써보고 믿을 수 있었던 기술자를 이웃이 대신 등록합니다. 광고가 아니라 경험의 기록입니다.",
  },
  {
    n: "02",
    title: "한울이 본인 확인",
    body: "한울 팀이 기술자 본인에게 연락해 공개 동의, 면허·보험 여부를 확인합니다. 동의 없는 공개는 없습니다.",
  },
  {
    n: "03",
    title: "소문으로 이어지기",
    body: "도움받은 이웃이 '나도 소개'를 누르면 신뢰가 쌓입니다. 소문의 수가 곧 검증입니다.",
  },
];

export default function TradesPage() {
  const [trade, setTrade] = useState<TradeKind | "전체">("전체");
  const [city, setCity] = useState<string>("전체");
  const [introduceOpen, setIntroduceOpen] = useState(false);
  const [vouched, setVouched] = useState<Record<number, boolean>>({});

  const filtered = useMemo(
    () =>
      tradespeople.filter(
        (t) =>
          (trade === "전체" || t.trade === trade) &&
          (city === "전체" || t.city === cities.find((c) => c.id === city)?.ko)
      ),
    [trade, city]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="folio-label">소문난 장인 · Trusted Trades</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="serif-display text-3xl font-black text-ink sm:text-5xl">
          이웃이 보증하는
          <br />
          한인 기술자
        </h1>
        <button
          onClick={() => setIntroduceOpen(true)}
          className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          이런 분, 소개 등록합니다
        </button>
      </div>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
        해외에서 가장 찾기 어려운 사람들입니다. 전기, 배관, 냉난방, 수리 — 실력 있는 한인 기술자 대부분은
        스스로 리스팅하지 않습니다. 그래서 한울은 이웃의 소문으로 연결합니다.
      </p>

      {/* 어떻게 등록되나요 */}
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-3xl border border-border bg-card p-6">
            <p className="latin-serif text-sm font-semibold text-coral-deep">{s.n}</p>
            <p className="serif-display mt-2 text-lg font-bold text-ink">{s.title}</p>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      {/* 필터 */}
      <div className="mt-14 flex flex-wrap items-center gap-2">
        {(["전체", ...tradeKinds] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTrade(k)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              trade === k
                ? "border-forest bg-forest text-cream"
                : "border-border bg-card text-ink/75 hover:border-forest hover:text-forest"
            }`}
          >
            {k}
          </button>
        ))}
        <div className="ml-auto">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-10 w-[140px] rounded-full border-border bg-card text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">모든 도시</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.ko}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-beige/40 p-12 text-center">
          <p className="text-sm font-semibold text-ink">이 조합의 장인은 아직 등록되지 않았습니다.</p>
          <p className="mt-1 text-xs text-muted-foreground">아는 분이 계시다면, 첫 소개의 주인공이 되어 주세요.</p>
          <button
            onClick={() => setIntroduceOpen(true)}
            className="mt-6 rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-cream transition-opacity hover:opacity-90"
          >
            첫 소개 등록하기
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const on = !!vouched[t.id];
            return (
              <article key={t.id} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-[11px] font-bold text-forest">
                    <Wrench className="h-3 w-3" /> {t.trade}
                  </span>
                  {t.licensed && (
                    <span className="flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-bold text-ink/70">
                      <ShieldCheck className="h-3 w-3" /> 면허
                    </span>
                  )}
                  {t.insured && (
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-bold text-ink/70">보험</span>
                  )}
                </div>

                <h3 className="serif-display mt-4 text-lg font-black text-ink">{t.name}</h3>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {t.city} · 경력 {t.years}년{t.korean ? " · 한국어" : ""}
                </p>
                <p className="mt-3 flex-1 text-sm leading-6 text-ink/85">{t.intro}</p>

                {t.voucher && (
                  <figure className="mt-4 border-l-2 border-coral/40 pl-3">
                    <Quote className="h-3 w-3 text-coral/60" />
                    <blockquote className="mt-1 text-xs leading-5 text-ink/70">“{t.voucher.text}”</blockquote>
                    <figcaption className="mt-1 text-[11px] font-semibold text-muted-foreground">
                      — {t.voucher.name}의 소개
                    </figcaption>
                  </figure>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <button
                    onClick={() => setVouched((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      on ? "bg-forest/10 text-forest" : "text-muted-foreground hover:text-forest"
                    }`}
                    aria-pressed={on}
                  >
                    <Handshake className="h-3.5 w-3.5" />
                    이웃 {t.vouches + (on ? 1 : 0)}명이 소개
                  </button>
                  <button
                    onClick={() => toast.success(`${t.name}님께 연결 요청을 보냈습니다. 본인 확인 후 한울이 연락드릴게요.`)}
                    className="rounded-full border border-border bg-paper px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-forest hover:text-forest"
                  >
                    연락 요청
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <IntroduceTradeDialog open={introduceOpen} onOpenChange={setIntroduceOpen} />
    </div>
  );
}

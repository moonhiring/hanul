import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, BadgeCheck, Handshake, Quote, ShieldCheck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { tradespeople } from "@/data";
import IntroduceTradeDialog from "@/components/IntroduceTradeDialog";

export default function Trades() {
  const [introduceOpen, setIntroduceOpen] = useState(false);
  const featured = tradespeople.slice(0, 3);

  const requestContact = (name: string) => {
    toast.success(`${name}님께 연결 요청을 보냈습니다. 본인 확인 후 한울이 연락드릴게요.`);
  };

  return (
    <section id="trades" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <p className="folio-label">소문난 장인 · Trusted Trades — 03</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="serif-display text-3xl font-black text-ink sm:text-5xl">
            광고하지 않는 기술자,
            <br />
            소문으로 찾습니다
          </h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            맛집은 검색되지만, 한국어가 통하는 전기·배관 기술자는 검색되지 않습니다.
            이분들은 리스팅을 하지 않으니 — 이웃이 대신 소개합니다.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {featured.map((t) => (
            <article key={t.id} className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm">
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

              <h3 className="serif-display mt-4 text-xl font-black text-ink">{t.name}</h3>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {t.city} · 경력 {t.years}년{t.korean ? " · 한국어" : ""}
              </p>
              <p className="mt-4 text-sm leading-7 text-ink/85">{t.intro}</p>

              {t.voucher && (
                <figure className="mt-4 border-l-2 border-coral/40 pl-3.5">
                  <Quote className="h-3.5 w-3.5 text-coral/60" />
                  <blockquote className="mt-1.5 text-[13px] leading-6 text-ink/70">
                    “{t.voucher.text}”
                  </blockquote>
                  <figcaption className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
                    — {t.voucher.name}의 소개
                  </figcaption>
                </figure>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-forest">
                  <Handshake className="h-4 w-4" />
                  이웃 {t.vouches}명이 소개
                </span>
                <button
                  onClick={() => requestContact(t.name)}
                  className="rounded-full border border-border bg-paper px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-forest hover:text-forest"
                >
                  연락 요청
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/trades"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:border-forest hover:text-forest"
          >
            장인 전체 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            onClick={() => setIntroduceOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <BadgeCheck className="h-4 w-4" />
            이런 분, 소개 등록합니다
          </button>
        </div>

        <IntroduceTradeDialog open={introduceOpen} onOpenChange={setIntroduceOpen} />
      </div>
    </section>
  );
}

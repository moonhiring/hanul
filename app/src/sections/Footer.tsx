import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useSite } from "@/context";

export default function Footer() {
  const { openRegister } = useSite();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    setError("");
    setEmail("");
    toast.success("구독 완료! 매주 좋은 이야기를 보내드릴게요.");
  };

  return (
    <>
      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-forest grain-deep px-8 py-20 text-center sm:px-12 lg:py-28">
          <div
            aria-hidden
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#f6dece 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cream/70">For business owners</p>
            <h2 className="serif-display mx-auto mt-4 max-w-2xl text-3xl font-black leading-tight text-cream sm:text-5xl">
              당신의 가게를
              <br />
              전 세계 한인에게
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-cream/75">
              사진 중심 프로필, 인증 배지, 리뷰, 프로모션까지. 한울에서 가게는 하나의 이야기가 됩니다.
            </p>
            <button
              onClick={openRegister}
              className="group mx-auto mt-9 flex items-center gap-2 rounded-full bg-coral px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              무료로 업체 등록하기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-ink text-cream/70">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="serif-display text-3xl font-black text-cream">한울</span>
              <span className="latin-serif text-[11px] font-semibold uppercase tracking-[0.3em] text-cream/50">Hanul</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-7">
              세상 모든 한인을 잇는 따뜻한 광장.
              <br />
              <span className="latin-serif italic text-cream/50">Every Korean, everywhere.</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cream/50">바로가기</p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm font-semibold">
              <Link to="/stories" className="transition-colors hover:text-cream">이야기</Link>
              <Link to="/directory" className="transition-colors hover:text-cream">업소록</Link>
              <Link to="/life" className="transition-colors hover:text-cream">일자리·부동산·모임</Link>
              <Link to="/cheer" className="transition-colors hover:text-cream">응원 광장</Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cream/50">한울 레터</p>
            <p className="mt-4 text-sm leading-6">매주 월요일, 세계 각지의 좋은 이야기 5편을 보내드립니다.</p>
            <form onSubmit={subscribe} className="mt-4 flex rounded-full bg-white/10 p-1.5 focus-within:ring-2 focus-within:ring-cream/30">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                className="w-full min-w-0 bg-transparent px-4 text-sm text-cream outline-none placeholder:text-cream/40"
                aria-label="이메일 주소"
              />
              <button type="submit" className="shrink-0 rounded-full bg-cream px-5 py-2.5 text-sm font-bold text-ink transition-opacity hover:opacity-90">
                구독
              </button>
            </form>
            {error && <p className="mt-2 text-xs font-semibold text-coral">{error}</p>}
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-cream/40 sm:flex-row sm:px-6">
            <p>© 2026 HANUL. 디자인 목업 — 실제 서비스 데이터가 아닙니다.</p>
            <p className="latin-serif italic">Made with care, for the diaspora.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

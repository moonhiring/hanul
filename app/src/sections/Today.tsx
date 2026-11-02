import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Radio } from "lucide-react";
import { dispatches } from "@/data";
import DispatchCard from "@/components/DispatchCard";
import CorrespondentDialog from "@/components/CorrespondentDialog";

export default function Today() {
  const [open, setOpen] = useState(false);
  const latest = dispatches.slice(0, 3);

  return (
    <section id="today" className="scroll-mt-20 border-t border-border bg-beige/40">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="flex items-end justify-between">
          <div>
            <p className="folio-label">오늘의 동네 · Today — 04</p>
            <h2 className="serif-display mt-4 text-3xl font-black text-ink sm:text-5xl">
              지금, 각자의
              <br />
              동네에서
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm leading-6 text-muted-foreground md:block">
            동네 통신원이 보내는 오늘의 풍경. 사진 한 장, 10초 영상, 세 문장이면 충분합니다.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-5 md:grid-cols-3">
          {latest.map((d) => (
            <DispatchCard key={d.id} d={d} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/today"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-ink transition-colors hover:border-forest hover:text-forest"
          >
            오늘의 동네 전체 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-cream transition-opacity hover:opacity-90"
          >
            <Radio className="h-4 w-4" />
            동네 통신원 신청
          </button>
        </div>

        <CorrespondentDialog open={open} onOpenChange={setOpen} />
      </div>
    </section>
  );
}

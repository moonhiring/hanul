import { useMemo, useState } from "react";
import { Radio } from "lucide-react";
import { dispatches } from "@/data";
import DispatchCard from "@/components/DispatchCard";
import CorrespondentDialog from "@/components/CorrespondentDialog";

export default function TodayPage() {
  const [city, setCity] = useState("전체");
  const [open, setOpen] = useState(false);

  const cityNames = useMemo(() => ["전체", ...new Set(dispatches.map((d) => d.city))], []);
  const filtered = useMemo(
    () => dispatches.filter((d) => city === "전체" || d.city === city),
    [city]
  );

  const today = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="folio-label">오늘의 동네 · Today in Our Towns</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif-display text-3xl font-black text-ink sm:text-5xl">
            지금, 각자의 동네에서
          </h1>
          <p className="mt-3 text-sm font-semibold text-muted-foreground">{today}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Radio className="h-4 w-4" />
          동네 통신원 신청
        </button>
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
        동네 통신원은 옛날 '특파원'의 우리말 친구입니다. 사진 한 장, 10초 영상, 세 문장 —
        각자가 사는 곳의 오늘이 여기에 모입니다.
      </p>

      {/* 도시 필터 */}
      <div className="mt-10 flex flex-wrap gap-2">
        {cityNames.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              city === c
                ? "border-forest bg-forest text-cream"
                : "border-border bg-card text-ink/75 hover:border-forest hover:text-forest"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold text-muted-foreground">
        오늘 {new Set(filtered.map((d) => d.city)).size}개 도시에서 {filtered.length}개의 소식
      </p>

      {/* 디스패치 피드 — masonry 컬럼 */}
      <div className="mt-4 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {filtered.map((d) => (
          <DispatchCard key={d.id} d={d} />
        ))}
      </div>

      <CorrespondentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

import { useMemo, useState } from "react";
import { Church, Clock3, Heart, Landmark, Languages, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cities, worshipKinds, worshipPlaces, type WorshipKind } from "@/data";

const kindIcon: Record<WorshipKind, typeof Church> = {
  교회: Church,
  성당: Church,
  사찰: Landmark,
};

const kindClass: Record<WorshipKind, string> = {
  교회: "bg-forest/10 text-forest",
  성당: "bg-coral/10 text-coral-deep",
  사찰: "bg-ink/10 text-ink/75",
};

export default function WorshipPage() {
  const [kind, setKind] = useState<WorshipKind | "전체">("전체");
  const [city, setCity] = useState<string>("전체");
  const [visited, setVisited] = useState<Record<number, boolean>>({});

  const filtered = useMemo(
    () =>
      worshipPlaces.filter(
        (w) =>
          (kind === "전체" || w.kind === kind) &&
          (city === "전체" || w.city === cities.find((c) => c.id === city)?.ko)
      ),
    [kind, city]
  );

  const counts = useMemo(
    () => ({
      교회: worshipPlaces.filter((w) => w.kind === "교회").length,
      성당: worshipPlaces.filter((w) => w.kind === "성당").length,
      사찰: worshipPlaces.filter((w) => w.kind === "사찰").length,
    }),
    []
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="folio-label">종교시설 · Worship</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="serif-display text-3xl font-black text-ink sm:text-5xl">
          이역에서 마음
          <br />
          기대는 곳
        </h1>
        <button
          onClick={() =>
            toast.success("제보해 주셔서 고맙습니다. 한울 팀이 확인 후 목록에 올릴게요.")
          }
          className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          우리 동네 예배처 알려주세요
        </button>
      </div>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
        교회, 성당, 사찰 — 해외 한인사회에서 종교시설은 예배처 이상입니다. 언어가 통하는 첫 공동체이자,
        정착 정보와 사람을 만나는 오래된 구심점이지요. 한국어 예배 시간과 첫 방문 정보를 모았습니다.
      </p>

      {/* 요약 띠 */}
      <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
        {(Object.keys(counts) as WorshipKind[]).map((k) => {
          const Icon = kindIcon[k];
          return (
            <button
              key={k}
              onClick={() => setKind(kind === k ? "전체" : k)}
              className={`rounded-3xl border p-5 text-left transition-colors ${
                kind === k ? "border-forest bg-forest text-cream" : "border-border bg-card hover:border-forest/40"
              }`}
            >
              <Icon className={`h-5 w-5 ${kind === k ? "text-cream/80" : "text-forest"}`} />
              <p className="serif-display mt-3 text-2xl font-black">{counts[k]}곳</p>
              <p className={`mt-1 text-xs font-semibold ${kind === k ? "text-cream/70" : "text-muted-foreground"}`}>
                {k}
              </p>
            </button>
          );
        })}
      </div>

      {/* 필터 */}
      <div className="mt-10 flex flex-wrap items-center gap-2">
        {(["전체", ...worshipKinds] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              kind === k
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
          <p className="text-sm font-semibold text-ink">이 조합의 시설은 아직 등록되지 않았습니다.</p>
          <p className="mt-1 text-xs text-muted-foreground">다니시는 곳을 알려주시면 목록에 곧 올리겠습니다.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => {
            const Icon = kindIcon[w.kind];
            const on = !!visited[w.id];
            return (
              <article key={w.id} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${kindClass[w.kind]}`}>
                    <Icon className="h-3 w-3" /> {w.kind}
                  </span>
                  {w.langs.map((l) => (
                    <span key={l} className="flex items-center gap-1 rounded-full bg-beige px-2.5 py-1 text-[11px] font-bold text-ink/70">
                      <Languages className="h-3 w-3" /> {l}
                    </span>
                  ))}
                </div>

                <h3 className="serif-display mt-4 text-lg font-black text-ink">{w.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {w.city} · {w.country}
                </p>
                <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-beige/60 px-3 py-2 text-[13px] font-semibold text-ink/85">
                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-forest" /> {w.service}
                </p>
                <p className="mt-3 flex-1 text-sm leading-6 text-ink/85">{w.intro}</p>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <button
                    onClick={() => setVisited((prev) => ({ ...prev, [w.id]: !prev[w.id] }))}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      on ? "bg-coral/10 text-coral" : "text-muted-foreground hover:text-coral"
                    }`}
                    aria-pressed={on}
                  >
                    <Heart className={`h-3.5 w-3.5 ${on ? "fill-coral" : ""}`} />
                    이웃 {w.visitors + (on ? 1 : 0)}명이 다녀옴
                  </button>
                  <button
                    onClick={() => toast.info("상세 페이지는 곧 열립니다.")}
                    className="rounded-full border border-border bg-paper px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-forest hover:text-forest"
                  >
                    자세히
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

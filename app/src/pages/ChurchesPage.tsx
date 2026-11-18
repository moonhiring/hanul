import { useEffect, useMemo, useState } from "react";
import { Church, Globe2, MapPin, Phone, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChurchItem {
  id: number;
  name: string;
  nameEn: string | null;
  denomination: string | null;
  country: string | null;
  region: string | null;
  locality: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
}

interface Meta {
  countries: { country: string; c: number }[];
  denominations: { d: string; c: number }[];
}

const COUNTRY_KO: Record<string, string> = {
  US: "미국", CA: "캐나다", AU: "호주", NZ: "뉴질랜드", DE: "독일", GB: "영국", FR: "프랑스",
  JP: "일본", ES: "스페인", IT: "이탈리아", NL: "네덜란드", BE: "벨기에", AT: "오스트리아",
  CH: "스위스", CZ: "체코", DK: "덴마크", SE: "스웨덴", VN: "베트남", TH: "태국", SG: "싱가포르",
  PH: "필리핀", ID: "인도네시아", MY: "말레이시아", MX: "멕시코", BR: "브라질", AR: "아르헨티나",
  HK: "홍콩", TW: "대만", CN: "중국", MN: "몽골", TR: "튀르키예", RU: "러시아", PT: "포르투갈",
  IE: "아일랜드", NO: "노르웨이", FI: "핀란드", PL: "폴란드", GR: "그리스", UA: "우크라이나",
};

const PAGE_SIZE = 50;

export default function ChurchesPage() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [country, setCountry] = useState("all");
  const [denomination, setDenomination] = useState("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ChurchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/churches/meta")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMeta(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (country !== "all") params.set("country", country);
    if (denomination !== "all") params.set("denomination", denomination);
    if (q.trim()) params.set("q", q.trim());

    const t = setTimeout(() => {
      fetch(`/api/churches?${params}`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((d) => {
          setItems(d.items);
          setTotal(d.total);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [country, denomination, q, offset]);

  useEffect(() => {
    setOffset(0);
  }, [country, denomination, q]);

  const denomList = useMemo(() => meta?.denominations.slice(0, 9) ?? [], [meta]);
  const countryLabel = (code: string | null) => (code ? (COUNTRY_KO[code] ?? code) : "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="folio-label">한인교회 · Korean Churches</p>
      <h1 className="serif-display mt-2 text-4xl font-black leading-tight text-ink">
        세계 곳곳의 <span className="text-forest">한인교회</span>를 찾습니다
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        해외에 있는 한인교회 {total.toLocaleString()}곳. 교회는 커뮤니티의 오래된 허브입니다.
        정보가 틀린 곳을 발견하면 알려주세요 — 함께 고쳐나가는 목록입니다.
      </p>

      {/* 필터 */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="h-10 w-40 rounded-full bg-card">
            <Globe2 className="mr-1 h-3.5 w-3.5 text-forest" />
            <SelectValue placeholder="전체 국가" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 국가</SelectItem>
            {meta?.countries.map((c) => (
              <SelectItem key={c.country} value={c.country}>
                {countryLabel(c.country)} ({c.c})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="교회명·주소 검색"
            className="h-10 w-56 rounded-full bg-card pl-8"
          />
        </div>
      </div>

      {/* 교단 칩 */}
      {denomList.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setDenomination("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              denomination === "all"
                ? "bg-forest text-cream"
                : "border border-border bg-card text-ink/70 hover:border-forest"
            }`}
          >
            전체 교단
          </button>
          {denomList.map((d) => (
            <button
              key={d.d}
              onClick={() => setDenomination(d.d)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                denomination === d.d
                  ? "bg-forest text-cream"
                  : "border border-border bg-card text-ink/70 hover:border-forest"
              }`}
            >
              {d.d} ({d.c})
            </button>
          ))}
        </div>
      )}

      {/* 목록 */}
      <div className="mt-8">
        {loading && <p className="py-12 text-center text-sm text-muted-foreground">불러오는 중…</p>}
        {error && <p className="py-12 text-center text-sm text-coral-deep">불러오기 실패: {error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">조건에 맞는 교회가 없습니다</p>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-forest/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-bold leading-snug text-ink">
                      <Church className="h-4 w-4 shrink-0 text-forest" strokeWidth={1.75} />
                      <span className="truncate">{c.name}</span>
                    </p>
                    {c.nameEn && c.nameEn !== c.name && (
                      <p className="mt-0.5 truncate pl-6 text-xs text-muted-foreground">{c.nameEn}</p>
                    )}
                  </div>
                  {c.denomination && (
                    <span className="shrink-0 rounded-full bg-forest/10 px-2.5 py-1 text-[10px] font-bold text-forest">
                      {c.denomination}
                    </span>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1 pl-6 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {[c.locality, c.region, countryLabel(c.country)].filter(Boolean).join(", ") || "주소 없음"}
                </p>
                {(c.phone || c.website) && (
                  <div className="mt-3 flex gap-2 pl-6">
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-ink/70 transition-colors hover:border-forest hover:text-forest"
                      >
                        <Phone className="h-3 w-3" /> 전화
                      </a>
                    )}
                    {c.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-ink/70 transition-colors hover:border-forest hover:text-forest"
                      >
                        <ExternalLink className="h-3 w-3" /> 웹사이트
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 */}
        {total > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-ink/70 disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-xs text-muted-foreground">
              {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} / {total.toLocaleString()}
            </span>
            <button
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-ink/70 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

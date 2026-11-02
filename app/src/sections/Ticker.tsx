import { tickerItems } from "@/data";

export default function Ticker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="overflow-hidden bg-forest py-3" aria-label="실시간 커뮤니티 소식">
      <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap px-5">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-2.5 text-sm text-cream/90">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-cream" />
            <span className="font-bold text-cream">{t.city}</span>
            {t.text}
          </span>
        ))}
      </div>
    </div>
  );
}

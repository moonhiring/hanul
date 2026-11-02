import { useEffect, useState } from "react";
import { Check, RotateCcw, Type, X } from "lucide-react";
import {
  FONT_CATEGORIES,
  FONT_CATEGORY_LABEL,
  fonts,
  getFont,
  loadAllFonts,
  type FontCategory,
  type KrFont,
} from "@/lib/fonts";
import { getTexture, textures, type TexturePreset } from "@/lib/textures";
import { useSite } from "@/context";

type Mode = "display" | "body" | "texture";

const PREVIEW = {
  display: "한울, 여백의 미",
  body: "여백은 비어 있는 것이 아니라, 숨 쉬는 공간입니다. 흩어진 한인의 하루를 한 곳에.",
};

function FontRow({
  font,
  selected,
  mode,
  onSelect,
}: {
  font: KrFont;
  selected: boolean;
  mode: Exclude<Mode, "texture">;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
        selected
          ? "border-forest bg-forest/5"
          : "border-transparent hover:border-border hover:bg-paper"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span
          className="block truncate leading-snug text-ink"
          style={{
            fontFamily: font.family,
            fontSize: mode === "display" ? "1.25rem" : "0.95rem",
            fontWeight: mode === "display" ? 700 : 400,
          }}
        >
          {PREVIEW[mode]}
        </span>
        <span className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-ink/80">{font.name}</span>
          <span className="text-[10px] text-muted-foreground">{font.en}</span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground/80">
          {font.desc}
        </span>
      </span>
      {selected && <Check className="h-4 w-4 shrink-0 text-forest" />}
    </button>
  );
}

function TextureRow({
  preset,
  selected,
  onSelect,
}: {
  preset: TexturePreset;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group flex w-full items-center gap-3.5 rounded-xl border px-3.5 py-3 text-left transition-colors ${
        selected
          ? "border-forest bg-forest/5"
          : "border-transparent hover:border-border hover:bg-paper"
      }`}
    >
      {/* 스와치 — 프리셋 바탕색 */}
      <span
        className="h-11 w-11 shrink-0 rounded-lg border border-border shadow-inner"
        style={{ backgroundColor: preset.paper }}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-ink">{preset.name}</span>
          <span className="text-[10px] text-muted-foreground">{preset.en}</span>
        </span>
        <span className="mt-0.5 block text-[11px] leading-5 text-muted-foreground">
          {preset.mood}
        </span>
      </span>
      {selected && <Check className="h-4 w-4 shrink-0 text-forest" />}
    </button>
  );
}

export default function FontSwitcher() {
  const {
    fontDisplay,
    setFontDisplay,
    fontBody,
    setFontBody,
    texture,
    setTexture,
    texLevel,
    setTexLevel,
    resetFonts,
  } = useSite();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("display");

  // 패널을 처음 열 때 모든 폰트를 로드해 미리보기가 실제 서체로 보이게 함
  useEffect(() => {
    if (open) loadAllFonts();
  }, [open]);

  const currentFont = mode === "display" ? fontDisplay : fontBody;
  const setCurrentFont = mode === "display" ? setFontDisplay : setFontBody;

  const grouped = FONT_CATEGORIES.map((cat: FontCategory) => ({
    cat,
    items: fonts.filter((f) => f.category === cat),
  }));

  const tabs = [
    { id: "display", label: "제목 폰트" },
    { id: "body", label: "본문 폰트" },
    { id: "texture", label: "질감·정서" },
  ] as const;

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 flex h-12 items-center gap-2 rounded-full border border-border bg-ink px-4 text-cream shadow-lg transition-transform hover:-translate-y-0.5"
        aria-label="디자인 미리보기 열기"
        aria-expanded={open}
      >
        <Type className="h-4 w-4" />
        <span className="text-xs font-bold">스타일</span>
        <span className="serif-display text-sm font-black">가</span>
      </button>

      {/* 패널 */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex max-h-[72vh] w-[min(92vw,360px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:right-5">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-bold text-ink">디자인 미리보기</p>
              <p className="text-[11px] text-muted-foreground">
                폰트 {fonts.length}종 · 질감 {textures.length}종 · 사이트 전체에 즉시 적용
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-beige hover:text-ink"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 현재 조합 */}
          <div className="border-b border-border bg-paper/60 px-4 py-2.5 text-[11px] text-muted-foreground">
            제목 <span className="font-bold text-ink">{getFont(fontDisplay).name}</span>
            <span className="mx-1.5 text-border">|</span>
            본문 <span className="font-bold text-ink">{getFont(fontBody).name}</span>
            <span className="mx-1.5 text-border">|</span>
            질감 <span className="font-bold text-ink">{getTexture(texture).name}</span>
            <button
              onClick={resetFonts}
              className="ml-2 inline-flex items-center gap-1 font-semibold text-coral-deep transition-opacity hover:opacity-80"
            >
              <RotateCcw className="h-3 w-3" /> 기본값
            </button>
          </div>

          {/* 모드 탭 */}
          <div className="flex gap-2 border-b border-border px-4 py-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`flex-1 rounded-full border px-2 py-2 text-xs font-bold transition-colors ${
                  mode === t.id
                    ? "border-forest bg-forest text-cream"
                    : "border-border bg-card text-ink/70 hover:border-forest hover:text-forest"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 목록 */}
          <div className="flex-1 overflow-y-auto px-2.5 py-3">
            {mode === "texture" ? (
              <div className="flex flex-col gap-1">
                <p className="folio-label px-2 pb-2 pt-1">질감 강도</p>
                <div className="mb-3 grid grid-cols-4 gap-1.5 px-2">
                  {(
                    [
                      { id: "off", label: "없음" },
                      { id: "soft", label: "은은" },
                      { id: "base", label: "기본" },
                      { id: "strong", label: "진하게" },
                    ] as const
                  ).map((lv) => (
                    <button
                      key={lv.id}
                      onClick={() => setTexLevel(lv.id)}
                      className={`rounded-full border px-2 py-1.5 text-[11px] font-bold transition-colors ${
                        texLevel === lv.id
                          ? "border-forest bg-forest text-cream"
                          : "border-border bg-card text-ink/70 hover:border-forest hover:text-forest"
                      }`}
                    >
                      {lv.label}
                    </button>
                  ))}
                </div>
                <p className="folio-label px-2 pb-2 pt-1">바탕 질감 · 소재의 정서</p>
                {textures.map((t) => (
                  <TextureRow
                    key={t.id}
                    preset={t}
                    selected={texture === t.id}
                    onSelect={() => setTexture(t.id)}
                  />
                ))}
                <p className="px-3 pb-1 pt-2 text-[11px] leading-5 text-muted-foreground">
                  링크로 공유할 때는 주소 뒤에 <code className="rounded bg-beige px-1">?texture=sumuk</code>처럼
                  프리셋 id를 붙이면 바로 적용된 상태로 열립니다.
                </p>
              </div>
            ) : (
              grouped.map(({ cat, items }) => (
                <div key={cat} className="mb-4 last:mb-0">
                  <p className="folio-label px-2 pb-2 pt-1">{FONT_CATEGORY_LABEL[cat]}</p>
                  <div className="flex flex-col gap-1">
                    {items.map((f) => (
                      <FontRow
                        key={f.id}
                        font={f}
                        mode={mode}
                        selected={currentFont === f.id}
                        onSelect={() => setCurrentFont(f.id)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

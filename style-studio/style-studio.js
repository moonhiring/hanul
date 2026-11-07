/**
 * Style Studio — drop-in theme & style editor (custom element, zero dependencies)
 *
 * Usage:
 *   <script src="./style-studio.js" defer></script>
 *   <style-studio></style-studio>            <!-- floating launcher + slide-over panel -->
 *   <style-studio inline></style-studio>     <!-- inline panel for settings pages -->
 *
 * The element writes design tokens to :root (document.documentElement) as CSS
 * variables and data-* attributes — your app styles consume them. See README.md
 * for the full token contract.
 *
 * Events (bubbles, composed):
 *   style-studio:change   {detail: config}  — every live edit
 *   style-studio:draft    {detail: config}  — "Save draft" pressed
 *   style-studio:publish  {detail: config}  — "Publish" pressed (persist + hook here)
 */

/* ------------------------------------------------------------------ *
 * 1. Registries — extend freely; everything renders from these lists
 * ------------------------------------------------------------------ */

const gf = (family, weights) =>
  `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weights}&display=swap`;

const FONT_GROUPS = [
  {
    label: "Latin",
    fonts: [
      { id: "inter", name: "Inter", family: "'Inter', sans-serif", url: gf("Inter", "300;400;500;600;700;800;900") },
      { id: "dm-sans", name: "DM Sans", family: "'DM Sans', sans-serif", url: gf("DM Sans", "300;400;500;700") },
      { id: "eb-garamond", name: "EB Garamond", family: "'EB Garamond', serif", url: gf("EB Garamond", "400;500;600;700;800") },
      { id: "fraunces", name: "Fraunces", family: "'Fraunces', serif", url: gf("Fraunces", "300;400;600;700;900") },
      { id: "space-grotesk", name: "Space Grotesk", family: "'Space Grotesk', sans-serif", url: gf("Space Grotesk", "300;400;500;700") },
      { id: "playfair", name: "Playfair Display", family: "'Playfair Display', serif", url: gf("Playfair+Display".replace(/\+/g, " "), "400;600;700;900") },
    ],
  },
  {
    label: "한글 고딕",
    fonts: [
      { id: "pretendard", name: "프리텐다드", family: "'Pretendard Variable', Pretendard, sans-serif", url: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" },
      { id: "noto-sans-kr", name: "노토 산스 KR", family: "'Noto Sans KR', sans-serif", url: gf("Noto Sans KR", "300;400;500;700;900") },
      { id: "ibm-plex-sans-kr", name: "IBM Plex Sans KR", family: "'IBM Plex Sans KR', sans-serif", url: gf("IBM Plex Sans KR", "300;400;500;600;700") },
      { id: "nanum-gothic", name: "나눔고딕", family: "'Nanum Gothic', sans-serif", url: gf("Nanum Gothic", "400;700;800") },
      { id: "spoqa-han-sans", name: "스포카 한 산스", family: "'Spoqa Han Sans Neo', sans-serif", url: "https://spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css" },
      { id: "gowun-dodum", name: "고운돋움", family: "'Gowun Dodum', sans-serif", url: gf("Gowun Dodum", "400") },
    ],
  },
  {
    label: "한글 명조",
    fonts: [
      { id: "noto-serif-kr", name: "노토 세리프 KR", family: "'Noto Serif KR', serif", url: gf("Noto Serif KR", "300;400;500;600;700;900"), display: true },
      { id: "nanum-myeongjo", name: "나눔명조", family: "'Nanum Myeongjo', serif", url: gf("Nanum Myeongjo", "400;700;800") },
      { id: "gowun-batang", name: "고운바탕", family: "'Gowun Batang', serif", url: gf("Gowun Batang", "400;700"), display: true },
      { id: "maru-buri", name: "마루 부리", family: "'Maru Buri', serif", url: gf("Maru Buri", "300;400;500;700"), display: true },
      { id: "hahmlet", name: "함렛", family: "'Hahmlet', serif", url: gf("Hahmlet", "300;400;500;700;900"), display: true },
    ],
  },
  {
    label: "손글씨 · 디스플레이",
    fonts: [
      { id: "nanum-brush", name: "나눔손글씨 붓", family: "'Nanum Brush Script', cursive", url: gf("Nanum Brush Script", "400"), display: true },
      { id: "nanum-pen", name: "나눔손글씨 펜", family: "'Nanum Pen Script', cursive", url: gf("Nanum Pen Script", "400") },
      { id: "gamja-flower", name: "감자꽃", family: "'Gamja Flower', cursive", url: gf("Gamja Flower", "400") },
      { id: "dongle", name: "동글", family: "'Dongle', sans-serif", url: gf("Dongle", "300;400;700"), display: true },
      { id: "gugi", name: "구기", family: "'Gugi', cursive", url: gf("Gugi", "400"), display: true },
      { id: "dokdo", name: "독도", family: "'Dokdo', cursive", url: gf("Dokdo", "400"), display: true },
    ],
  },
];
const ALL_FONTS = FONT_GROUPS.flatMap((g) => g.fonts);

/** Themes — each with a light and a dark surface set. */
const THEMES = [
  {
    id: "hanji", name: "Korea · Hanji", desc: "Ink, paper, celadon and gentle motion",
    light: { bg: "#f8f5ef", card: "#fffdf8", fg: "#211f1b", muted: "#6f6a5e", border: "#d9d2c2", accent: "#2f4a3b" },
    dark:  { bg: "#171b18", card: "#1f2521", fg: "#e9e6dc", muted: "#9a958a", border: "#333b35", accent: "#7fae97" },
  },
  {
    id: "witty", name: "Default Witty", desc: "Clear, neutral workspace",
    light: { bg: "#f7f7fb", card: "#ffffff", fg: "#1c1c24", muted: "#63637a", border: "#e2e2ec", accent: "#4d4db6" },
    dark:  { bg: "#14141c", card: "#1d1d28", fg: "#e8e8f0", muted: "#9c9cb0", border: "#2e2e3e", accent: "#8f8fe8" },
  },
  {
    id: "midnight", name: "Midnight Focus", desc: "Low-glare deep work",
    light: { bg: "#f4f6f8", card: "#ffffff", fg: "#182230", muted: "#5d6b7a", border: "#dde4ea", accent: "#2563eb" },
    dark:  { bg: "#0d1117", card: "#161c24", fg: "#e2e8f0", muted: "#8b98a8", border: "#28313c", accent: "#5b9dff" },
  },
  {
    id: "nordic", name: "Nordic Calm", desc: "Fog, birch and quiet blue",
    light: { bg: "#f3f5f4", card: "#fbfcfc", fg: "#22302e", muted: "#61716e", border: "#dfe6e3", accent: "#3d7a6e" },
    dark:  { bg: "#151c1b", card: "#1d2625", fg: "#e3eae8", muted: "#93a3a0", border: "#2c3836", accent: "#74b8aa" },
  },
  {
    id: "botanical", name: "Botanical", desc: "Leaf green on warm paper",
    light: { bg: "#f5f7f0", card: "#fdfff9", fg: "#232d1e", muted: "#687257", border: "#dde3d0", accent: "#4a7c2f" },
    dark:  { bg: "#161a12", card: "#1e2417", fg: "#e6ebdd", muted: "#9aa58c", border: "#313a28", accent: "#93c66e" },
  },
  {
    id: "solar", name: "Solar Paper", desc: "Warm cream and amber",
    light: { bg: "#faf6ec", card: "#fffdf6", fg: "#2e2517", muted: "#7a6c52", border: "#e7dcc4", accent: "#b45309" },
    dark:  { bg: "#1b160e", card: "#251e13", fg: "#f0e7d6", muted: "#a8987c", border: "#3c3222", accent: "#e5a04c" },
  },
  {
    id: "ocean", name: "Quiet Ocean", desc: "Sea mist and slate blue",
    light: { bg: "#f2f6f8", card: "#fbfdfe", fg: "#1c2b33", muted: "#5e7078", border: "#dbe5e9", accent: "#0e7490" },
    dark:  { bg: "#101a20", card: "#182429", fg: "#e1eaee", muted: "#8ea2ab", border: "#293943", accent: "#5cc3dd" },
  },
  {
    id: "rose", name: "Rose Clay", desc: "Terracotta and soft blush",
    light: { bg: "#faf4f1", card: "#fffcfa", fg: "#332321", muted: "#7d6763", border: "#ecdcd7", accent: "#c0432b" },
    dark:  { bg: "#1d1512", card: "#271c18", fg: "#f0e4df", muted: "#ab968f", border: "#3f2f29", accent: "#e0846f" },
  },
];

/** Universal accent overrides (work on both light and dark). */
const ACCENTS = [
  { id: "theme", name: "Theme default", color: null },
  { id: "indigo", name: "Indigo", color: "#4d4db6", dark: "#8f8fe8" },
  { id: "forest", name: "Forest", color: "#2f4a3b", dark: "#7fae97" },
  { id: "coral", name: "Coral", color: "#c0432b", dark: "#e0846f" },
  { id: "cyan", name: "Cyan", color: "#0e7490", dark: "#5cc3dd" },
  { id: "amber", name: "Amber", color: "#b45309", dark: "#e5a04c" },
  { id: "plum", name: "Plum", color: "#7c3a6d", dark: "#c987bd" },
];

/** Surface texture presets (the Hanul set) — layered CSS backgrounds. */
const noise = (freq, oct, alpha, type = "fractalNoise") =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='${type}' baseFrequency='${freq}' numOctaves='${oct}' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${alpha} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const fiber = (alpha) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='480'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.012 0.14' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${alpha} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`;
const lightGrain = (alpha) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='l'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${alpha} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23l)'/%3E%3C/svg%3E")`;

const TEXTURES = [
  { id: "none", name: "None", en: "Flat", paper: null,
    layers: { grain: "none", fiber: "none", extra: "none" }, darkGrain: "none" },
  { id: "hanji", name: "한지", en: "Hanji", paper: "#f8f5ef",
    layers: { grain: noise(0.85, 2, 0.035), fiber: fiber(0.03), extra: "none" }, darkGrain: lightGrain(0.05) },
  { id: "sumuk", name: "수묵 화선지", en: "Ink Wash", paper: "#efede8",
    layers: { grain: noise(0.85, 2, 0.055), fiber: "none",
      extra: "radial-gradient(ellipse 75% 50% at 88% 4%, rgba(35,40,46,0.08), transparent 62%), radial-gradient(ellipse 55% 40% at 6% 92%, rgba(35,40,46,0.05), transparent 60%)" },
    darkGrain: lightGrain(0.07) },
  { id: "baekja", name: "백자", en: "Porcelain", paper: "#faf9f6",
    layers: { grain: noise(0.85, 2, 0.018), fiber: "none",
      extra: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.9), transparent 70%)" },
    darkGrain: lightGrain(0.03) },
  { id: "cheongja", name: "청자", en: "Celadon", paper: "#eef2ee",
    layers: { grain: noise(0.85, 2, 0.035), fiber: fiber(0.03),
      extra: "radial-gradient(ellipse 70% 50% at 12% 6%, rgba(127,160,143,0.1), transparent 65%)" },
    darkGrain: lightGrain(0.05) },
  { id: "sambe", name: "삼베", en: "Ramie", paper: "#f4efe3",
    layers: { grain: "none", fiber: "none",
      extra: "repeating-linear-gradient(0deg, rgba(60,50,30,0.028) 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, rgba(60,50,30,0.028) 0 1px, transparent 1px 6px)" },
    darkGrain: "none" },
  { id: "changhoji", name: "창호지", en: "Lattice", paper: "#f7f3e9",
    layers: { grain: noise(0.85, 2, 0.035), fiber: "none",
      extra: "repeating-linear-gradient(0deg, rgba(74,60,34,0.05) 0 2px, transparent 2px 96px), repeating-linear-gradient(90deg, rgba(74,60,34,0.05) 0 2px, transparent 2px 128px), radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,244,214,0.5), transparent 70%)" },
    darkGrain: lightGrain(0.05) },

  /* ---- 판화 · 인쇄 (Printmaking) ---- */
  { id: "etching", name: "에칭", en: "Etching", paper: "#f2e9d8",
    layers: { grain: noise(0.9, 2, 0.02), fiber: "none",
      /* 렘브란트 에칭의 크로스해칭 — 두 방향의 가는 세선 */
      extra: "repeating-linear-gradient(35deg, rgba(58,44,30,0.05) 0 1px, transparent 1px 5px), repeating-linear-gradient(-55deg, rgba(58,44,30,0.04) 0 1px, transparent 1px 7px), radial-gradient(ellipse 90% 70% at 50% 40%, transparent 55%, rgba(80,60,35,0.06))" },
    darkGrain: lightGrain(0.04) },
  { id: "laid", name: "동판 세선", en: "Laid Lines", paper: "#f5efe2",
    layers: { grain: noise(0.85, 2, 0.02), fiber: "none",
      /* 구리판 인쇄의 가늘고 촘촘한 가로선 */
      extra: "repeating-linear-gradient(0deg, rgba(50,40,25,0.045) 0 1px, transparent 1px 4px)" },
    darkGrain: lightGrain(0.04) },
  { id: "woodcut", name: "목판", en: "Woodcut", paper: "#f0e8d8",
    layers: { grain: noise(0.02, 2, 0.06, "turbulence"), fiber: "none",
      /* 나무결을 따라 거칠게 파인 판각의 흔적 */
      extra: "repeating-linear-gradient(92deg, rgba(40,30,20,0.05) 0 2px, transparent 2px 13px), repeating-linear-gradient(88deg, rgba(40,30,20,0.03) 0 1px, transparent 1px 29px)" },
    darkGrain: lightGrain(0.06) },

  /* ---- 종이 · 염색 (Paper & dye) ---- */
  { id: "parchment", name: "양피지", en: "Parchment", paper: "#f0e6cf",
    layers: { grain: noise(0.7, 3, 0.04), fiber: "none",
      /* 세월의 얼룩과 가장자리 그을음 */
      extra: "radial-gradient(ellipse 40% 30% at 85% 12%, rgba(139,105,20,0.08), transparent 60%), radial-gradient(ellipse 32% 26% at 8% 82%, rgba(139,105,20,0.07), transparent 60%), radial-gradient(ellipse 120% 100% at 50% 50%, transparent 62%, rgba(120,88,40,0.09))" },
    darkGrain: lightGrain(0.05) },
  { id: "cloud", name: "운용지", en: "Cloud Paper", paper: "#f6f2e9",
    layers: { grain: noise(0.85, 2, 0.02), fiber: "none",
      /* 구름처럼 번진 옅은 얼룩 */
      extra: "radial-gradient(ellipse 50% 35% at 18% 28%, rgba(255,255,255,0.55), transparent 70%), radial-gradient(ellipse 45% 40% at 82% 72%, rgba(198,186,160,0.2), transparent 70%), radial-gradient(ellipse 30% 22% at 55% 10%, rgba(198,186,160,0.14), transparent 70%)" },
    darkGrain: lightGrain(0.04) },
  { id: "indigo", name: "쪽빛", en: "Indigo Dye", paper: "#edf1f4",
    layers: { grain: noise(0.85, 2, 0.03), fiber: fiber(0.025),
      /* 천연 쪽염이 스민 푸른 기운 */
      extra: "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(52,84,120,0.08), transparent 65%), radial-gradient(ellipse 60% 45% at 90% 95%, rgba(52,84,120,0.06), transparent 65%)" },
    darkGrain: lightGrain(0.05) },
];

const CORNERS = [
  { id: "sharp", name: "Sharp", radius: "4px" },
  { id: "round", name: "Round", radius: "12px" },
  { id: "soft", name: "Softer", radius: "20px" },
  { id: "blob", name: "Blob", radius: "28px" },
];
const SPACINGS = [
  { id: "compact", name: "Compact", value: "0.8" },
  { id: "cozy", name: "Cozy", value: "1" },
  { id: "airy", name: "Airy", value: "1.35" },
];
const SHADOWS = [
  { id: "flat", name: "Flat", sm: "none", lg: "none" },
  { id: "soft", name: "Soft", sm: "0 1px 3px rgba(20,20,20,0.07)", lg: "0 8px 30px rgba(20,20,20,0.09)" },
  { id: "deep", name: "Deep", sm: "0 2px 8px rgba(15,15,15,0.14)", lg: "0 18px 50px rgba(15,15,15,0.2)" },
];
const HEAD_WEIGHTS = [
  { id: "600", name: "SemiBold" },
  { id: "700", name: "Bold" },
  { id: "800", name: "ExtraBold" },
  { id: "900", name: "Black" },
];
const TEX_LEVELS = [
  { id: "off", name: "Off" },
  { id: "soft", name: "은은" },
  { id: "medium", name: "보통" },
  { id: "strong", name: "진하게" },
];

const DEFAULTS = {
  theme: "hanji", mode: "light", accent: "theme",
  headFont: "noto-serif-kr", bodyFont: "noto-sans-kr",
  typeScale: 100, headWeight: "700",
  corners: "round", spacing: "cozy", shadows: "soft",
  texture: "hanji", texLevel: "medium",
  motion: "full", contrast: "normal",
};

const DRAFT_KEY = "style-studio:draft";
const PUB_KEY = "style-studio:published";

/* ------------------------------------------------------------------ *
 * 2. Font loader
 * ------------------------------------------------------------------ */
const loadedFonts = new Set();
function loadFont(f) {
  if (!f || loadedFonts.has(f.id)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = f.url;
  document.head.appendChild(link);
  loadedFonts.add(f.id);
}

/* ------------------------------------------------------------------ *
 * 3. The element
 * ------------------------------------------------------------------ */
const css = `
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
  :host {
    --panel-bg: #ffffff; --panel-fg: #1c1c24; --panel-muted: #6a6a7c;
    --panel-border: #e3e3ec; --panel-accent: #4d4db6; --panel-field: #f5f5f9;
    font-family: 'Inter', system-ui, sans-serif; font-size: 14px; color: var(--panel-fg);
  }
  .launcher {
    position: fixed; right: 20px; bottom: 20px; z-index: 99990;
    display: flex; align-items: center; gap: 8px;
    background: var(--panel-fg); color: var(--panel-bg);
    border: none; border-radius: 999px; padding: 11px 18px;
    font: 600 13px/1 inherit; font-family: inherit; cursor: pointer;
    box-shadow: 0 6px 24px rgba(0,0,0,0.22); transition: transform .15s ease;
  }
  .launcher:hover { transform: translateY(-2px); }
  .scrim {
    position: fixed; inset: 0; z-index: 99998; background: rgba(15,15,20,0.35);
    opacity: 0; pointer-events: none; transition: opacity .25s ease;
  }
  .scrim.open { opacity: 1; pointer-events: auto; }
  .panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 99999;
    width: min(400px, 100vw); background: var(--panel-bg);
    border-left: 1px solid var(--panel-border);
    box-shadow: -12px 0 40px rgba(0,0,0,0.14);
    transform: translateX(102%); transition: transform .3s cubic-bezier(.22,1,.36,1);
    display: flex; flex-direction: column;
  }
  .panel.open { transform: none; }
  :host([inline]) .panel {
    position: static; transform: none; width: 100%; border: 1px solid var(--panel-border);
    border-radius: 16px; box-shadow: none;
  }
  :host([inline]) .launcher, :host([inline]) .scrim { display: none; }

  .head { padding: 18px 20px 14px; border-bottom: 1px solid var(--panel-border); }
  .eyebrow { font-size: 10px; font-weight: 800; letter-spacing: .22em; color: var(--panel-muted); text-transform: uppercase; }
  .title { font-size: 20px; font-weight: 800; margin-top: 4px; display: flex; justify-content: space-between; align-items: center; }
  .close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--panel-muted); line-height: 1; padding: 4px; }
  .body { flex: 1; overflow-y: auto; padding: 6px 20px 20px; }
  section { margin-top: 22px; }
  h3 { font-size: 13px; font-weight: 800; margin: 0 0 10px; }
  .note { font-size: 11.5px; color: var(--panel-muted); margin: -6px 0 10px; line-height: 1.5; }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  label.fl { display: block; font-size: 11px; font-weight: 700; color: var(--panel-muted); margin-bottom: 5px; }
  select, input[type="range"] { width: 100%; }
  select {
    appearance: none; background: var(--panel-field) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' fill='none' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 12px center;
    border: 1px solid var(--panel-border); border-radius: 10px;
    padding: 9px 30px 9px 12px; font: 600 13px inherit; color: inherit; cursor: pointer;
  }
  select:focus { outline: 2px solid var(--panel-accent); outline-offset: 1px; }

  .themes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .theme {
    border: 2px solid var(--panel-border); border-radius: 12px; padding: 8px;
    cursor: pointer; background: none; font: inherit; text-align: left; transition: border-color .15s;
  }
  .theme.sel { border-color: var(--panel-accent); }
  .theme .duo { display: flex; height: 44px; border-radius: 8px; overflow: hidden; margin-bottom: 7px; }
  .theme .duo > div { flex: 1; position: relative; }
  .theme .duo i { position: absolute; left: 6px; top: 8px; right: 10px; height: 8px; border-radius: 4px; display: block; }
  .theme .duo em { position: absolute; left: 6px; top: 22px; width: 40%; height: 14px; border-radius: 4px; display: block; }
  .theme b { font-size: 12px; display: block; }
  .theme span { font-size: 10.5px; color: var(--panel-muted); display: block; margin-top: 1px; }

  .seg { display: flex; background: var(--panel-field); border: 1px solid var(--panel-border); border-radius: 10px; padding: 3px; gap: 3px; }
  .seg button {
    flex: 1; border: none; background: none; border-radius: 8px; padding: 7px 4px;
    font: 700 12px inherit; color: var(--panel-muted); cursor: pointer;
  }
  .seg button.sel { background: var(--panel-bg); color: var(--panel-fg); box-shadow: 0 1px 4px rgba(0,0,0,0.12); }

  .swatches { display: flex; gap: 8px; flex-wrap: wrap; }
  .sw {
    width: 34px; height: 34px; border-radius: 10px; cursor: pointer; border: 2px solid transparent;
    display: flex; align-items: center; justify-content: center; background: var(--panel-field);
  }
  .sw.sel { border-color: var(--panel-accent); }
  .sw i { width: 18px; height: 18px; border-radius: 50%; display: block; }
  .sw.auto i { background: linear-gradient(135deg, #888 50%, #ccc 50%); }

  .texs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .tex {
    border: 2px solid var(--panel-border); border-radius: 10px; padding: 6px;
    cursor: pointer; background: none; font: inherit; transition: border-color .15s;
  }
  .tex.sel { border-color: var(--panel-accent); }
  .tex .chip { height: 34px; border-radius: 7px; margin-bottom: 5px; border: 1px solid rgba(0,0,0,0.06); }
  .tex b { font-size: 11px; display: block; text-align: center; }
  .tex span { font-size: 9.5px; color: var(--panel-muted); display: block; text-align: center; }

  .slider-row { display: flex; align-items: center; gap: 10px; }
  .slider-row output { font: 800 12px inherit; color: var(--panel-accent); min-width: 42px; text-align: right; }
  input[type="range"] { accent-color: var(--panel-accent); }

  .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; }
  .toggle-row + .toggle-row { border-top: 1px dashed var(--panel-border); }
  .toggle-row b { font-size: 12.5px; display: block; }
  .toggle-row span { font-size: 11px; color: var(--panel-muted); display: block; margin-top: 2px; }
  .tgl { width: 40px; height: 22px; border-radius: 999px; border: none; cursor: pointer; position: relative; background: #d5d5de; transition: background .2s; flex: none; }
  .tgl::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left .2s; }
  .tgl.on { background: var(--panel-accent); }
  .tgl.on::after { left: 21px; }

  .preview { border: 1px solid var(--panel-border); border-radius: 14px; padding: 14px; background: var(--ss-bg, #fafafa); }
  .pv-card {
    background: var(--ss-card, #fff); border: 1px solid var(--ss-border, #ddd);
    border-radius: var(--ss-radius, 12px); padding: 14px;
    box-shadow: var(--ss-shadow-lg, none);
  }
  .pv-card h4 { font-family: var(--ss-font-head); font-weight: var(--ss-head-weight); font-size: 15px; margin: 0 0 4px; color: var(--ss-fg); }
  .pv-card p { font-family: var(--ss-font-body); font-size: 12px; color: var(--ss-muted); margin: 0 0 10px; line-height: 1.55; }
  .pv-btn { background: var(--ss-accent); color: #fff; border: none; border-radius: var(--ss-radius, 12px); padding: 7px 14px; font: 700 12px var(--ss-font-body); cursor: default; }
  .pv-tag { font: 700 10px var(--ss-font-body); color: var(--ss-accent); border: 1px solid currentColor; border-radius: 999px; padding: 2px 8px; margin-left: 8px; }

  .foot { border-top: 1px solid var(--panel-border); padding: 12px 20px 16px; }
  .stamp { font-size: 10.5px; color: var(--panel-muted); margin-bottom: 10px; }
  .actions { display: flex; gap: 8px; }
  .btn { flex: 1; border-radius: 10px; padding: 10px; font: 700 13px inherit; cursor: pointer; border: 1px solid var(--panel-border); background: var(--panel-bg); color: var(--panel-fg); }
  .btn.primary { background: var(--panel-accent); border-color: var(--panel-accent); color: #fff; flex: 1.4; }
  .btn.ghost { flex: 0.9; }
  .copy { width: 100%; margin-top: 8px; background: none; border: none; color: var(--panel-accent); font: 700 11.5px inherit; cursor: pointer; padding: 4px; }
`;

class StyleStudio extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.config = { ...DEFAULTS };
    this.open = false;
    this._media = window.matchMedia("(prefers-color-scheme: dark)");
    this._onMedia = () => { if (this.config.mode === "system") this.apply(); };
  }

  connectedCallback() {
    const draft = this._read(DRAFT_KEY);
    const published = this._read(PUB_KEY);
    this.publishedAt = published?.at ?? null;
    this.config = { ...DEFAULTS, ...(draft?.config ?? published?.config ?? {}) };
    this.render();
    this.apply();
    this._media.addEventListener("change", this._onMedia);
    ALL_FONTS.forEach(loadFont); // warm up select previews
  }
  disconnectedCallback() { this._media.removeEventListener("change", this._onMedia); }

  _read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  _write(key, config) {
    const payload = { config, at: new Date().toISOString() };
    try { localStorage.setItem(key, JSON.stringify(payload)); } catch {}
    return payload;
  }
  _emit(type) {
    this.dispatchEvent(new CustomEvent(type, {
      detail: structuredClone(this.config), bubbles: true, composed: true,
    }));
  }

  get effectiveMode() {
    return this.config.mode === "system" ? (this._media.matches ? "dark" : "light") : this.config.mode;
  }

  /* -------- apply config to the host document (:root) -------- */
  apply() {
    const c = this.config;
    const theme = THEMES.find((t) => t.id === c.theme) ?? THEMES[0];
    const mode = this.effectiveMode;
    const pal = theme[mode];
    const root = document.documentElement;
    const set = (k, v) => root.style.setProperty(k, v);

    const accent = ACCENTS.find((a) => a.id === c.accent) ?? ACCENTS[0];
    const accentColor = accent.color ? (mode === "dark" ? accent.dark : accent.color) : pal.accent;

    set("--ss-bg", pal.bg);
    set("--ss-card", pal.card);
    set("--ss-fg", pal.fg);
    set("--ss-muted", pal.muted);
    set("--ss-border", pal.border);
    set("--ss-accent", accentColor);

    const head = ALL_FONTS.find((f) => f.id === c.headFont);
    const body = ALL_FONTS.find((f) => f.id === c.bodyFont);
    loadFont(head); loadFont(body);
    set("--ss-font-head", head?.family ?? "serif");
    set("--ss-font-body", body?.family ?? "sans-serif");
    set("--ss-head-weight", c.headWeight);
    set("--ss-type-scale", String(c.typeScale / 100));
    root.style.fontSize = `${(c.typeScale / 100) * 16}px`;

    set("--ss-radius", CORNERS.find((x) => x.id === c.corners)?.radius ?? "12px");
    set("--ss-space", SPACINGS.find((x) => x.id === c.spacing)?.value ?? "1");
    const sh = SHADOWS.find((x) => x.id === c.shadows) ?? SHADOWS[1];
    set("--ss-shadow-sm", sh.sm);
    set("--ss-shadow-lg", sh.lg);

    // texture layers (in dark mode: only a subtle light grain survives)
    const tex = TEXTURES.find((t) => t.id === c.texture) ?? TEXTURES[0];
    const lvl = c.texLevel;
    const on = tex.id !== "none" && lvl !== "off";
    const dim = lvl === "soft" ? 0.55 : lvl === "strong" ? 1 : 0.8;
    if (on && mode === "light") {
      set("--ss-tex-grain", tex.layers.grain);
      set("--ss-tex-fiber", tex.layers.fiber);
      set("--ss-tex-extra", tex.layers.extra);
      set("--ss-tex-soften", lvl === "soft" ? "linear-gradient(rgba(252,250,246,0.55), rgba(252,250,246,0.55))" : "none");
    } else if (on && mode === "dark") {
      set("--ss-tex-grain", tex.darkGrain);
      set("--ss-tex-fiber", "none");
      set("--ss-tex-extra", "none");
      set("--ss-tex-soften", "none");
    } else {
      ["--ss-tex-grain", "--ss-tex-fiber", "--ss-tex-extra", "--ss-tex-soften"].forEach((k) => set(k, "none"));
    }
    set("--ss-tex-dim", String(dim));

    root.dataset.theme = theme.id;
    root.dataset.mode = mode;
    root.dataset.texture = tex.id;
    root.dataset.texLevel = lvl;
    root.dataset.motion = c.motion === "reduced" ? "reduced" : "full";
    root.dataset.contrast = c.contrast;
    set("--ss-motion", c.motion === "reduced" ? "0" : "1");
    if (c.contrast === "high") set("--ss-border", mode === "dark" ? "#5a6470" : "#8a8a96");
    else set("--ss-border", pal.border);

    this._emit("style-studio:change");
    this._syncPreview();
  }

  set(patch) {
    Object.assign(this.config, patch);
    this.apply();
    this._syncControls();
  }

  /* ---------------- UI ---------------- */
  render() {
    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <button class="launcher" part="launcher" aria-haspopup="dialog">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18"/></svg>
        스타일
      </button>
      <div class="scrim"></div>
      <div class="panel" role="dialog" aria-label="Style Studio">
        <div class="head">
          <div class="eyebrow">Style Studio</div>
          <div class="title">테마 &amp; 스타일 <button class="close" aria-label="닫기">×</button></div>
        </div>
        <div class="body">
          <section>
            <h3>Theme</h3>
            <div class="themes" data-f="theme"></div>
          </section>
          <section>
            <h3>Color mode</h3>
            <div class="seg" data-f="mode">
              <button data-v="system">System</button><button data-v="light">Light</button><button data-v="dark">Dark</button>
            </div>
          </section>
          <section>
            <h3>Accent</h3>
            <div class="swatches" data-f="accent"></div>
          </section>
          <section>
            <h3>Typography</h3>
            <div class="grid2">
              <div><label class="fl">Heading font</label><select data-f="headFont"></select></div>
              <div><label class="fl">Body font</label><select data-f="bodyFont"></select></div>
              <div><label class="fl">Type size</label>
                <div class="slider-row"><input type="range" min="90" max="115" step="5" data-f="typeScale"><output></output></div>
              </div>
              <div><label class="fl">Heading weight</label><select data-f="headWeight"></select></div>
            </div>
          </section>
          <section>
            <h3>Surface &amp; rhythm</h3>
            <div class="grid2">
              <div><label class="fl">Corners</label><select data-f="corners"></select></div>
              <div><label class="fl">Spacing</label><select data-f="spacing"></select></div>
              <div><label class="fl">Shadows</label><select data-f="shadows"></select></div>
            </div>
          </section>
          <section>
            <h3>Texture · 질감</h3>
            <p class="note">한지·수묵·백자 같은 종이 결. 다크 모드에서는 은은한 밝은 입자만 남습니다.</p>
            <div class="texs" data-f="texture"></div>
            <div style="margin-top:10px"><label class="fl">Intensity</label><div class="seg" data-f="texLevel"></div></div>
          </section>
          <section>
            <h3>Motion &amp; accessibility</h3>
            <div class="toggle-row">
              <div><b>Reduce motion</b><span>자동 재생·전환 애니메이션을 최소화합니다</span></div>
              <button class="tgl" data-f="motion" role="switch" aria-label="Reduce motion"></button>
            </div>
            <div class="toggle-row">
              <div><b>Increase contrast</b><span>경계선과 텍스트 대비를 강화합니다</span></div>
              <button class="tgl" data-f="contrast" role="switch" aria-label="Increase contrast"></button>
            </div>
          </section>
          <section>
            <h3>Preview</h3>
            <div class="preview"><div class="pv-card">
              <h4>여백의 미, The Quiet Space</h4>
              <p>종이의 결 위로 먹이 스미듯, 선택한 스타일이 즉시 반영됩니다. 한글과 Latin 조합도 함께 확인하세요.</p>
              <span class="pv-btn">가입하기</span><span class="pv-tag">NEW</span>
            </div></div>
          </section>
        </div>
        <div class="foot">
          <div class="stamp" data-stamp>Draft — not visible to visitors</div>
          <div class="actions">
            <button class="btn ghost" data-act="reset">Reset</button>
            <button class="btn" data-act="draft">Save draft</button>
            <button class="btn primary" data-act="publish">Publish</button>
          </div>
          <button class="copy" data-act="copy">Copy config JSON</button>
        </div>
      </div>
    `;

    const $ = (s) => this.shadowRoot.querySelector(s);
    this.$panel = $(".panel"); this.$scrim = $(".scrim");

    $(".launcher").addEventListener("click", () => this.toggle(true));
    $(".close").addEventListener("click", () => this.toggle(false));
    this.$scrim.addEventListener("click", () => this.toggle(false));

    // theme cards
    const themeBox = $('[data-f="theme"]');
    THEMES.forEach((t) => {
      const b = document.createElement("button");
      b.className = "theme"; b.dataset.v = t.id;
      b.innerHTML = `
        <div class="duo">
          <div style="background:${t.light.bg}"><i style="background:${t.light.accent}"></i><em style="background:${t.light.card};border:1px solid ${t.light.border}"></em></div>
          <div style="background:${t.dark.bg}"><i style="background:${t.dark.accent}"></i><em style="background:${t.dark.card}"></em></div>
        </div><b>${t.name}</b><span>${t.desc}</span>`;
      b.addEventListener("click", () => this.set({ theme: t.id }));
      themeBox.appendChild(b);
    });

    // accent swatches
    const accBox = $('[data-f="accent"]');
    ACCENTS.forEach((a) => {
      const b = document.createElement("button");
      b.className = `sw${a.color ? "" : " auto"}`; b.dataset.v = a.id; b.title = a.name;
      b.innerHTML = `<i style="background:${a.color ?? ""}"></i>`;
      b.addEventListener("click", () => this.set({ accent: a.id }));
      accBox.appendChild(b);
    });

    // texture cards
    const texBox = $('[data-f="texture"]');
    TEXTURES.forEach((t) => {
      const b = document.createElement("button");
      b.className = "tex"; b.dataset.v = t.id;
      const chipBg = t.paper ?? "linear-gradient(135deg,#fff 50%,#eee 50%)";
      b.innerHTML = `<div class="chip" style="background:${chipBg};background-image:${t.layers.grain === "none" && t.layers.extra === "none" ? "none" : `${t.layers.extra}, ${t.layers.grain}`}"></div><b>${t.name}</b><span>${t.en}</span>`;
      b.addEventListener("click", () => this.set({ texture: t.id }));
      texBox.appendChild(b);
    });

    // texture level seg
    const lvlBox = $('[data-f="texLevel"]');
    TEX_LEVELS.forEach((l) => {
      const b = document.createElement("button");
      b.dataset.v = l.id; b.textContent = l.name;
      b.addEventListener("click", () => this.set({ texLevel: l.id }));
      lvlBox.appendChild(b);
    });

    // selects
    const fill = (sel, items) => {
      const el = $(`select[data-f="${sel}"]`);
      items.forEach((it) => {
        const o = document.createElement("option");
        o.value = it.id; o.textContent = it.name;
        el.appendChild(o);
      });
      el.addEventListener("change", () => this.set({ [sel]: el.value }));
    };
    const fillFonts = (sel) => {
      const el = $(`select[data-f="${sel}"]`);
      FONT_GROUPS.forEach((g) => {
        const og = document.createElement("optgroup");
        og.label = g.label;
        g.fonts.forEach((f) => {
          const o = document.createElement("option");
          o.value = f.id; o.textContent = f.name;
          o.style.fontFamily = f.family;
          og.appendChild(o);
        });
        el.appendChild(og);
      });
      el.addEventListener("change", () => this.set({ [sel]: el.value }));
    };
    fillFonts("headFont"); fillFonts("bodyFont");
    fill("headWeight", HEAD_WEIGHTS);
    fill("corners", CORNERS);
    fill("spacing", SPACINGS);
    fill("shadows", SHADOWS);

    // mode seg
    $('[data-f="mode"]').addEventListener("click", (e) => {
      const v = e.target?.dataset?.v;
      if (v) this.set({ mode: v });
    });

    // slider
    const range = $('input[data-f="typeScale"]');
    const out = $("output");
    range.addEventListener("input", () => { out.textContent = `${range.value}%`; });
    range.addEventListener("change", () => this.set({ typeScale: Number(range.value) }));

    // toggles
    $('[data-f="motion"]').addEventListener("click", (e) =>
      this.set({ motion: this.config.motion === "reduced" ? "full" : "reduced" }));
    $('[data-f="contrast"]').addEventListener("click", () =>
      this.set({ contrast: this.config.contrast === "high" ? "normal" : "high" }));

    // actions
    $('[data-act="reset"]').addEventListener("click", () => {
      const published = this._read(PUB_KEY);
      this.config = { ...DEFAULTS, ...(published?.config ?? {}) };
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      this.apply(); this._syncControls();
    });
    $('[data-act="draft"]').addEventListener("click", () => {
      const p = this._write(DRAFT_KEY, this.config);
      this._stamp(`Draft saved · ${this._fmt(p.at)}`);
      this._emit("style-studio:draft");
    });
    $('[data-act="publish"]').addEventListener("click", () => {
      const p = this._write(PUB_KEY, this.config);
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      this.publishedAt = p.at;
      this._stamp(`Published · ${this._fmt(p.at)}`);
      this._emit("style-studio:publish");
    });
    $('[data-act="copy"]').addEventListener("click", async (e) => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(this.config, null, 2));
        e.target.textContent = "Copied ✓";
      } catch { e.target.textContent = "Copy failed — select console JSON"; }
      setTimeout(() => (e.target.textContent = "Copy config JSON"), 1500);
    });

    this._syncControls();
    if (this.publishedAt) this._stamp(`Published · ${this._fmt(this.publishedAt)}`);
  }

  toggle(open) {
    this.open = open ?? !this.open;
    this.$panel.classList.toggle("open", this.open);
    this.$scrim.classList.toggle("open", this.open);
  }

  _fmt(iso) {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  }
  _stamp(text) { this.shadowRoot.querySelector("[data-stamp]").textContent = text; }

  _syncControls() {
    const c = this.config;
    const $$ = (s) => [...this.shadowRoot.querySelectorAll(s)];
    $$(".theme").forEach((b) => b.classList.toggle("sel", b.dataset.v === c.theme));
    $$(".sw").forEach((b) => b.classList.toggle("sel", b.dataset.v === c.accent));
    $$(".tex").forEach((b) => b.classList.toggle("sel", b.dataset.v === c.texture));
    $$('[data-f="mode"] button').forEach((b) => b.classList.toggle("sel", b.dataset.v === c.mode));
    $$('[data-f="texLevel"] button').forEach((b) => b.classList.toggle("sel", b.dataset.v === c.texLevel));
    $$("select").forEach((el) => { el.value = c[el.dataset.f] ?? el.value; });
    const range = this.shadowRoot.querySelector('input[data-f="typeScale"]');
    range.value = c.typeScale;
    this.shadowRoot.querySelector("output").textContent = `${c.typeScale}%`;
    this.shadowRoot.querySelector('[data-f="motion"]').classList.toggle("on", c.motion === "reduced");
    this.shadowRoot.querySelector('[data-f="contrast"]').classList.toggle("on", c.contrast === "high");
  }

  /* panel preview mirrors applied tokens (vars pierce shadow DOM) */
  _syncPreview() {
    const pv = this.shadowRoot.querySelector(".preview");
    if (!pv) return;
    const cs = getComputedStyle(document.documentElement);
    const copy = ["--ss-bg", "--ss-card", "--ss-fg", "--ss-muted", "--ss-border", "--ss-accent", "--ss-radius", "--ss-font-head", "--ss-font-body", "--ss-head-weight", "--ss-shadow-lg"];
    copy.forEach((k) => pv.style.setProperty(k, cs.getPropertyValue(k)));
  }
}

customElements.define("style-studio", StyleStudio);

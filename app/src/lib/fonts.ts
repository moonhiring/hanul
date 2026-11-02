/**
 * 한국어 웹폰트 레지스트리 (23종)
 * - Google Fonts는 필요 시 <link>를 동적 주입해 로드합니다.
 * - Pretendard / Spoqa Han Sans Neo는 각 배포 CDN을 사용합니다.
 */

export type FontCategory = "gothic" | "myeongjo" | "hand" | "display";

export interface KrFont {
  id: string;
  /** 표시 이름 (한글) */
  name: string;
  /** 영문/패밀리 이름 */
  en: string;
  /** CSS font-family 값 */
  family: string;
  /** 스타일시트 URL */
  url: string;
  category: FontCategory;
  /** 한 줄 설명 */
  desc: string;
  /** 제목(디스플레이)으로 어울리는지 */
  goodForDisplay?: boolean;
}

const gf = (family: string, weights: string) =>
  `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weights}&display=swap`;

export const FONT_CATEGORY_LABEL: Record<FontCategory, string> = {
  gothic: "고딕 · 산세리프",
  myeongjo: "명조 · 바탕",
  hand: "손글씨",
  display: "개성 · 디스플레이",
};

export const FONT_CATEGORIES: FontCategory[] = ["gothic", "myeongjo", "hand", "display"];

export const fonts: KrFont[] = [
  /* ---------------- 고딕 · 산세리프 ---------------- */
  {
    id: "pretendard",
    name: "프리텐다드",
    en: "Pretendard",
    family: "'Pretendard Variable', Pretendard, sans-serif",
    url: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css",
    category: "gothic",
    desc: "국내 서비스 표준급 본문 고딕. 어떤 국문 UI에도 무난합니다.",
  },
  {
    id: "noto-sans-kr",
    name: "노토 산스 KR (본고딕)",
    en: "Noto Sans KR",
    family: "'Noto Sans KR', sans-serif",
    url: gf("Noto Sans KR", "300;400;500;700;900"),
    category: "gothic",
    desc: "구글·어도비 공동 개발. 가장 안정적인 국문 산세리프.",
  },
  {
    id: "ibm-plex-sans-kr",
    name: "IBM Plex Sans KR",
    en: "IBM Plex Sans KR",
    family: "'IBM Plex Sans KR', sans-serif",
    url: gf("IBM Plex Sans KR", "300;400;500;600;700"),
    category: "gothic",
    desc: "기하학적이면서 사람 냄새 나는 고딕. 기술 브랜드에 강함.",
  },
  {
    id: "nanum-gothic",
    name: "나눔고딕",
    en: "Nanum Gothic",
    family: "'Nanum Gothic', sans-serif",
    url: gf("Nanum Gothic", "400;700;800"),
    category: "gothic",
    desc: "한국 웹의 클래식. 익숙하고 친근한 인상.",
  },
  {
    id: "gothic-a1",
    name: "고딕 A1",
    en: "Gothic A1",
    family: "'Gothic A1', sans-serif",
    url: gf("Gothic A1", "300;400;500;700"),
    category: "gothic",
    desc: "가는 웨이트가 세련된 모던 고딕.",
  },
  {
    id: "sunflower",
    name: "해바라기",
    en: "Sunflower",
    family: "'Sunflower', sans-serif",
    url: gf("Sunflower", "300;500;700"),
    category: "gothic",
    desc: "획 끝이 둥글게 마무리된 부드러운 고딕.",
  },
  {
    id: "gowun-dodum",
    name: "고운돋움",
    en: "Gowun Dodum",
    family: "'Gowun Dodum', sans-serif",
    url: gf("Gowun Dodum", "400"),
    category: "gothic",
    desc: "돋움 계열의 깔끔한 화면용 글꼴.",
  },
  {
    id: "spoqa-han-sans",
    name: "스포카 한 산스",
    en: "Spoqa Han Sans Neo",
    family: "'Spoqa Han Sans Neo', sans-serif",
    url: "https://spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css",
    category: "gothic",
    desc: "스포카가 만든 실무형 고딕. 숫자·라틴 조합이 깔끔.",
  },

  /* ---------------- 명조 · 바탕 ---------------- */
  {
    id: "noto-serif-kr",
    name: "노토 세리프 KR (본명조)",
    en: "Noto Serif KR",
    family: "'Noto Serif KR', serif",
    url: gf("Noto Serif KR", "300;400;500;600;700;900"),
    category: "myeongjo",
    desc: "여백의 미와 가장 잘 어울리는 현대 명조. 제목용 추천.",
    goodForDisplay: true,
  },
  {
    id: "nanum-myeongjo",
    name: "나눔명조",
    en: "Nanum Myeongjo",
    family: "'Nanum Myeongjo', serif",
    url: gf("Nanum Myeongjo", "400;700;800"),
    category: "myeongjo",
    desc: "책과 신문의 기운. 오래 읽어도 편한 바탕체.",
  },
  {
    id: "gowun-batang",
    name: "고운바탕",
    en: "Gowun Batang",
    family: "'Gowun Batang', serif",
    url: gf("Gowun Batang", "400;700"),
    category: "myeongjo",
    desc: "획이 가늘고 단정한 바탕체. 시집 같은 분위기.",
    goodForDisplay: true,
  },
  {
    id: "song-myung",
    name: "송명",
    en: "Song Myung",
    family: "'Song Myung', serif",
    url: gf("Song Myung", "400"),
    category: "myeongjo",
    desc: "옛 인쇄 명조의 결을 살린 레트로 명조.",
    goodForDisplay: true,
  },
  {
    id: "hahmlet",
    name: "함렛",
    en: "Hahmlet",
    family: "'Hahmlet', serif",
    url: gf("Hahmlet", "300;400;500;700;900"),
    category: "myeongjo",
    desc: "한글 자소의 기하학을 강조한 실험적 명조.",
    goodForDisplay: true,
  },
  {
    id: "maru-buri",
    name: "마루 부리",
    en: "Maru Buri",
    family: "'Maru Buri', serif",
    url: gf("Maru Buri", "300;400;500;700"),
    category: "myeongjo",
    desc: "부리(세리프)가 살아 있는 단정한 명조. 최근 주목받는 글꼴.",
    goodForDisplay: true,
  },

  /* ---------------- 손글씨 ---------------- */
  {
    id: "nanum-brush",
    name: "나눔손글씨 붓",
    en: "Nanum Brush Script",
    family: "'Nanum Brush Script', cursive",
    url: gf("Nanum Brush Script", "400"),
    category: "hand",
    desc: "붓글씨의 획. 먹의 번짐이 살아 있어 서예 느낌.",
    goodForDisplay: true,
  },
  {
    id: "nanum-pen",
    name: "나눔손글씨 펜",
    en: "Nanum Pen Script",
    family: "'Nanum Pen Script', cursive",
    url: gf("Nanum Pen Script", "400"),
    category: "hand",
    desc: "또박또박한 펜글씨. 일기·메모 감성.",
  },
  {
    id: "gaegu",
    name: "개구",
    en: "Gaegu",
    family: "'Gaegu', cursive",
    url: gf("Gaegu", "300;400;700"),
    category: "hand",
    desc: "삐뚤빼뚤 귀여운 손글씨. 캐주얼 콘텐츠용.",
  },
  {
    id: "gamja-flower",
    name: "감자꽃",
    en: "Gamja Flower",
    family: "'Gamja Flower', cursive",
    url: gf("Gamja Flower", "400"),
    category: "hand",
    desc: "통통 튀는 손글씨. 밝고 친근한 인상.",
  },
  {
    id: "hi-melody",
    name: "하이멜로디",
    en: "Hi Melody",
    family: "'Hi Melody', cursive",
    url: gf("Hi Melody", "400"),
    category: "hand",
    desc: "흘려 쓴 듯 리듬감 있는 손글씨.",
  },

  /* ---------------- 개성 · 디스플레이 ---------------- */
  {
    id: "dongle",
    name: "동글",
    en: "Dongle",
    family: "'Dongle', sans-serif",
    url: gf("Dongle", "300;400;700"),
    category: "display",
    desc: "동글동글 얇은 획. 포스터·배너용 개성체.",
    goodForDisplay: true,
  },
  {
    id: "poor-story",
    name: "서툰이야기",
    en: "Poor Story",
    family: "'Poor Story', cursive",
    url: gf("Poor Story", "400"),
    category: "display",
    desc: "어설퍼서 더 정겨운 손글씨 디스플레이.",
  },
  {
    id: "single-day",
    name: "싱글데이",
    en: "Single Day",
    family: "'Single Day', cursive",
    url: gf("Single Day", "400"),
    category: "display",
    desc: "서예 붓의 강약이 느껴지는 디스플레이체.",
    goodForDisplay: true,
  },
  {
    id: "gugi",
    name: "구기",
    en: "Gugi",
    family: "'Gugi', cursive",
    url: gf("Gugi", "400"),
    category: "display",
    desc: "고전 간판체 느낌의 레트로 디스플레이.",
    goodForDisplay: true,
  },
  {
    id: "dokdo",
    name: "독도",
    en: "Dokdo",
    family: "'Dokdo', cursive",
    url: gf("Dokdo", "400"),
    category: "display",
    desc: "거친 붓질의 강렬한 서예 디스플레이.",
    goodForDisplay: true,
  },
];

export const DEFAULT_DISPLAY_FONT = "noto-serif-kr";
export const DEFAULT_BODY_FONT = "noto-sans-kr";

export function getFont(id: string): KrFont {
  return fonts.find((f) => f.id === id) ?? fonts.find((f) => f.id === DEFAULT_BODY_FONT)!;
}

/* ---- 동적 로더: 같은 폰트는 한 번만 주입 ---- */
const loaded = new Set<string>();

export function loadFont(f: KrFont) {
  if (loaded.has(f.id)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = f.url;
  link.dataset.krfont = f.id;
  document.head.appendChild(link);
  loaded.add(f.id);
}

export function loadAllFonts() {
  fonts.forEach(loadFont);
}

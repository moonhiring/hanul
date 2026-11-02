/**
 * 질감·정서 프리셋 — 한국의 전통 소재에서 온 배경 재질
 * 실제 적용은 index.css의 html[data-texture="..."] 규칙이 담당하고,
 * 이 파일은 UI 목록과 스와치 색상만 제공합니다.
 */

export interface TexturePreset {
  id: string;
  name: string;
  en: string;
  /** 스와치용 바탕색 (CSS --paper와 동일하게 유지) */
  paper: string;
  /** 정서 한 줄 설명 */
  mood: string;
}

export const DEFAULT_TEXTURE = "hanji";

export const textures: TexturePreset[] = [
  {
    id: "hanji",
    name: "한지",
    en: "Hanji",
    paper: "#f8f5ef",
    mood: "기본. 닥나무 섬유가 살아 있는 따뜻한 종이 — 포근한 서재의 정서.",
  },
  {
    id: "sumuk",
    name: "수묵 화선지",
    en: "Ink Wash",
    paper: "#efede8",
    mood: "먹이 번진 화선지. 차분하고 사색적인 선비의 방.",
  },
  {
    id: "baekja",
    name: "백자 · 달항아리",
    en: "White Porcelain",
    paper: "#faf9f6",
    mood: "조선 백자처럼 맑게 비워 낸 흰색. 여백의 미를 극대화.",
  },
  {
    id: "cheongja",
    name: "청자 · 비취",
    en: "Celadon",
    paper: "#eef2ee",
    mood: "고려청자의 옥빛 안개. 맑고 서늘한 고요함.",
  },
  {
    id: "sambe",
    name: "삼베 · 마포",
    en: "Ramie Cloth",
    paper: "#f4efe3",
    mood: "거칠게 짜인 베 직물의 촉감 — 소박한 민예의 정서.",
  },
  {
    id: "changhoji",
    name: "창호지 격자",
    en: "Lattice Door",
    paper: "#f7f3e9",
    mood: "격자창 너머 아침 빛이 스미는 한옥의 온기.",
  },
];

export function getTexture(id: string): TexturePreset {
  return textures.find((t) => t.id === id) ?? textures[0];
}

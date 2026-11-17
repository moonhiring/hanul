/**
 * 방문자 기본 스타일 — 운영자가 지정하는 사이트 기본 폰트·질감 조합
 *
 * 우선순위: 사용자 로컬 저장값 > 운영자 지정 기본값 > 빌트인 기본값
 *
 * 서버에 GET/POST /api/site-style 이 붙으면 전역 전파되고,
 * 아직 없으면 localStorage(hanul:site-style)에 임시 저장해 같은 브라우저에서 동작합니다.
 */

export interface SiteStyle {
  fontDisplay: string;
  fontBody: string;
  texture: string;
  texLevel: string;
  updatedAt?: string;
}

const LS_SITE_STYLE = "hanul:site-style";

function normalize(raw: unknown): SiteStyle | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.fontDisplay !== "string" || typeof s.fontBody !== "string") return null;
  return {
    fontDisplay: s.fontDisplay,
    fontBody: s.fontBody,
    texture: typeof s.texture === "string" ? s.texture : "hanji",
    texLevel: typeof s.texLevel === "string" ? s.texLevel : "base",
    updatedAt: typeof s.updatedAt === "string" ? s.updatedAt : undefined,
  };
}

function readLocal(): SiteStyle | null {
  try {
    const raw = localStorage.getItem(LS_SITE_STYLE);
    return raw ? normalize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** 지정된 기본 스타일 조회 — 서버 우선, 없으면 로컬 임시 저장분 */
export async function fetchSiteStyle(): Promise<SiteStyle | null> {
  try {
    const r = await fetch("/api/site-style", { credentials: "include" });
    if (r.ok) {
      const d = await r.json();
      const s = normalize(d?.style ?? d);
      if (s) return s;
    }
  } catch {
    /* 서버 미연결 — 로컬 폴백으로 */
  }
  return readLocal();
}

export type SaveResult = "server" | "local";

/** 기본 스타일 지정 — 서버 저장을 시도하고 실패하면 로컬에 임시 저장 */
export async function saveSiteStyle(style: SiteStyle): Promise<SaveResult> {
  const stamped = { ...style, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(LS_SITE_STYLE, JSON.stringify(stamped));
  } catch {
    /* 저장 공간 문제는 무시 */
  }
  try {
    const r = await fetch("/api/site-style", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stamped),
    });
    if (r.ok) return "server";
  } catch {
    /* 서버 미연결 */
  }
  return "local";
}

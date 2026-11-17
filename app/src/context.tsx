import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "@/data";
import {
  getFont,
  loadFont,
  DEFAULT_DISPLAY_FONT,
  DEFAULT_BODY_FONT,
} from "@/lib/fonts";
import { DEFAULT_TEXTURE } from "@/lib/textures";
import { fetchSiteStyle } from "@/lib/site-style";

interface AuthUser {
  id: number;
  email: string | null;
  name: string | null;
  picture: string | null;
  role: "member" | "admin";
}

interface SiteState {
  lang: Lang;
  setLang: (l: Lang) => void;
  city: string;
  setCity: (c: string) => void;
  registerOpen: boolean;
  setRegisterOpen: (o: boolean) => void;
  openRegister: () => void;
  /** 로그인 사용자 (없으면 null) */
  user: AuthUser | null;
  /** /api/auth/me 확인 완료 여부 */
  authReady: boolean;
  signIn: (u: AuthUser) => void;
  signOut: () => Promise<void>;
  loginOpen: boolean;
  setLoginOpen: (o: boolean) => void;
  /** 쓰기 동작 전 게이트 — 로그인 상태면 true, 아니면 로그인 다이얼로그를 띄우고 false */
  requireAuth: () => boolean;
  /** 제목(디스플레이) 폰트 id */
  fontDisplay: string;
  setFontDisplay: (id: string) => void;
  /** 본문 폰트 id */
  fontBody: string;
  setFontBody: (id: string) => void;
  /** 질감·정서 프리셋 id */
  texture: string;
  setTexture: (id: string) => void;
  /** 질감 강도: off | soft | base | strong */
  texLevel: string;
  setTexLevel: (lv: string) => void;
  resetFonts: () => void;
}

const SiteContext = createContext<SiteState | null>(null);

const LS_DISPLAY = "hanul:font-display";
const LS_BODY = "hanul:font-body";
const LS_TEXTURE = "hanul:texture";
const LS_TEX_LEVEL = "hanul:tex-level";

function applyFont(id: string, cssVar: "--font-display" | "--font-body") {
  const font = getFont(id);
  loadFont(font);
  document.documentElement.style.setProperty(cssVar, font.family);
}

function applyTexture(id: string) {
  document.documentElement.dataset.texture = id;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ko");
  const [city, setCity] = useState("nyc");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [fontDisplay, setFontDisplayState] = useState<string>(DEFAULT_DISPLAY_FONT);
  const [fontBody, setFontBodyState] = useState<string>(DEFAULT_BODY_FONT);
  const [texture, setTextureState] = useState<string>(DEFAULT_TEXTURE);
  const [texLevel, setTexLevelState] = useState<string>("base");

  // 세션 복원 — httpOnly 쿠키 기반
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  const requireAuth = () => {
    if (user) return true;
    setLoginOpen(true);
    return false;
  };

  const signIn = (u: AuthUser) => setUser(u);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setUser(null);
  };

  // 초기 로드: 저장된 선택 복원. ?texture=... 쿼리로 프리셋 링크 공유 가능
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const savedD = localStorage.getItem(LS_DISPLAY);
    const savedB = localStorage.getItem(LS_BODY);
    const savedT = localStorage.getItem(LS_TEXTURE);
    const savedLv = localStorage.getItem(LS_TEX_LEVEL);
    const d = savedD ?? DEFAULT_DISPLAY_FONT;
    const b = savedB ?? DEFAULT_BODY_FONT;
    const t = q.get("texture") ?? savedT ?? DEFAULT_TEXTURE;
    setFontDisplayState(d);
    setFontBodyState(b);
    setTextureState(t);
    applyFont(d, "--font-display");
    applyFont(b, "--font-body");
    applyTexture(t);
    const lv = savedLv ?? "base";
    setTexLevelState(lv);
    document.documentElement.dataset.texLevel = lv;

    // 운영자 지정 기본값 — 사용자가 직접 저장한 항목이 없을 때만 적용
    // (우선순위: 사용자 로컬 저장 > 운영자 지정 > 빌트인 기본값)
    fetchSiteStyle()
      .then((s) => {
        if (!s) return;
        if (!savedD && s.fontDisplay) {
          setFontDisplayState(s.fontDisplay);
          applyFont(s.fontDisplay, "--font-display");
        }
        if (!savedB && s.fontBody) {
          setFontBodyState(s.fontBody);
          applyFont(s.fontBody, "--font-body");
        }
        if (!savedT && !q.get("texture") && s.texture) {
          setTextureState(s.texture);
          applyTexture(s.texture);
        }
        if (!savedLv && s.texLevel) {
          setTexLevelState(s.texLevel);
          document.documentElement.dataset.texLevel = s.texLevel;
        }
      })
      .catch(() => {});
  }, []);

  const setFontDisplay = (id: string) => {
    setFontDisplayState(id);
    applyFont(id, "--font-display");
    localStorage.setItem(LS_DISPLAY, id);
  };

  const setFontBody = (id: string) => {
    setFontBodyState(id);
    applyFont(id, "--font-body");
    localStorage.setItem(LS_BODY, id);
  };

  const setTexture = (id: string) => {
    setTextureState(id);
    applyTexture(id);
    localStorage.setItem(LS_TEXTURE, id);
  };

  const setTexLevel = (lv: string) => {
    setTexLevelState(lv);
    document.documentElement.dataset.texLevel = lv;
    localStorage.setItem(LS_TEX_LEVEL, lv);
  };

  // 기본값으로 되돌리기 — 내 저장을 지우고 운영자 지정 기본값(없으면 빌트인)을 따름
  const resetFonts = () => {
    localStorage.removeItem(LS_DISPLAY);
    localStorage.removeItem(LS_BODY);
    localStorage.removeItem(LS_TEXTURE);
    localStorage.removeItem(LS_TEX_LEVEL);
    const apply = (d: string, b: string, t: string, lv: string) => {
      setFontDisplayState(d);
      setFontBodyState(b);
      setTextureState(t);
      setTexLevelState(lv);
      applyFont(d, "--font-display");
      applyFont(b, "--font-body");
      applyTexture(t);
      document.documentElement.dataset.texLevel = lv;
    };
    apply(DEFAULT_DISPLAY_FONT, DEFAULT_BODY_FONT, DEFAULT_TEXTURE, "base");
    fetchSiteStyle()
      .then((s) => {
        if (s) apply(s.fontDisplay, s.fontBody, s.texture, s.texLevel);
      })
      .catch(() => {});
  };

  return (
    <SiteContext.Provider
      value={{
        lang,
        setLang,
        city,
        setCity,
        registerOpen,
        setRegisterOpen,
        openRegister: () => {
          if (requireAuth()) setRegisterOpen(true);
        },
        user,
        authReady,
        signIn,
        signOut,
        loginOpen,
        setLoginOpen,
        requireAuth,
        fontDisplay,
        setFontDisplay,
        fontBody,
        setFontBody,
        texture,
        setTexture,
        texLevel,
        setTexLevel,
        resetFonts,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

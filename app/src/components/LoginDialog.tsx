import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSite } from "@/context";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

let gsiPromise: Promise<void> | null = null;
/** Google Identity Services 스크립트를 한 번만 로드 */
function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        gsiPromise = null;
        reject(new Error("gsi_load_failed"));
      };
      document.head.appendChild(s);
    });
  }
  return gsiPromise;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: Props) {
  const { signIn, lang } = useSite();
  const btnRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "unconfigured" | "error">("loading");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState("loading");

    (async () => {
      try {
        const cfg = await fetch("/api/auth/config", { credentials: "include" }).then((r) =>
          r.ok ? r.json() : null,
        );
        if (!cfg?.googleClientId) {
          if (!cancelled) setState("unconfigured");
          return;
        }
        await loadGsi();
        if (cancelled || !btnRef.current) return;

        window.google.accounts.id.initialize({
          client_id: cfg.googleClientId,
          callback: async (resp: { credential?: string }) => {
            if (!resp.credential) {
              setState("error");
              return;
            }
            const r = await fetch("/api/auth/google", {
              method: "POST",
              credentials: "include",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ credential: resp.credential }),
            }).catch(() => null);
            if (!r?.ok) {
              setState("error");
              return;
            }
            const { user } = await r.json();
            signIn(user);
            onOpenChange(false);
          },
        });
        btnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 280,
          text: "signin_with",
          locale: lang === "ko" ? "ko" : "en",
        });
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
    // lang은 버튼 로케일에만 쓰이므로 다이얼로그를 열 때의 값으로 충분
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="serif-display text-2xl">
            {lang === "ko" ? "로그인이 필요합니다" : "Sign in required"}
          </DialogTitle>
          <DialogDescription className="leading-6">
            {lang === "ko"
              ? "업체 등록과 글쓰기는 로그인 후 이용할 수 있어요. Google 계정으로 10초면 충분합니다."
              : "Listing a business and posting require sign-in. It takes 10 seconds with your Google account."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-[44px] flex-col items-center justify-center py-4">
          {state === "loading" && (
            <p className="text-sm text-muted-foreground">
              {lang === "ko" ? "불러오는 중…" : "Loading…"}
            </p>
          )}
          {state === "unconfigured" && (
            <p className="text-center text-sm text-muted-foreground">
              {lang === "ko"
                ? "로그인 설정이 아직 완료되지 않았습니다. (관리자: GOOGLE_CLIENT_ID 설정 필요)"
                : "Sign-in is not configured yet. (Admin: set GOOGLE_CLIENT_ID)"}
            </p>
          )}
          {state === "error" && (
            <p className="text-sm font-medium text-coral-deep">
              {lang === "ko"
                ? "로그인에 실패했습니다. 다시 시도해주세요."
                : "Sign-in failed. Please try again."}
            </p>
          )}
          {/* GIS 버튼이 렌더링되는 자리 */}
          <div ref={btnRef} />
        </div>
        <p className="text-center text-[11px] leading-5 text-muted-foreground">
          {lang === "ko"
            ? "로그인은 본인 확인에만 쓰이며, 이름과 이메일 외의 정보는 받지 않습니다."
            : "Sign-in is used only to verify you. We only receive your name and email."}
        </p>
      </DialogContent>
    </Dialog>
  );
}

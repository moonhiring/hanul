import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, Search, Globe } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cities, i18n } from "@/data";
import { useSite } from "@/context";

const navItems = [
  { key: "stories" as const, to: "/stories" },
  { key: "directory" as const, to: "/directory" },
  { key: "life" as const, to: "/life" },
  { key: "community" as const, to: "/cheer" },
];

export default function Header() {
  const { lang, setLang, city, setCity, openRegister, user, setLoginOpen, signOut } = useSite();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors hover:text-forest ${
      isActive ? "text-forest" : "text-ink/80"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur-md">
      {/* 단청 띠 — 오방색 헤어라인 */}
      <div className="dancheong-band" aria-hidden />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="serif-display text-2xl font-black text-forest">한울</span>
          <span className="latin-serif text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/70">Hanul</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((n) => (
            <NavLink key={n.key} to={n.to} className={linkClass}>
              {i18n.nav[n.key][lang]}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="hidden h-9 w-[130px] rounded-full border-border bg-card text-xs font-semibold sm:flex">
              <Globe className="mr-1 h-3.5 w-3.5 text-forest" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.ko}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => setLang(lang === "ko" ? "en" : "ko")}
            className="hidden h-9 items-center rounded-full border border-border bg-card px-3 text-xs font-bold text-ink/80 transition-colors hover:border-forest hover:text-forest sm:flex"
            aria-label="언어 전환"
          >
            {lang === "ko" ? "KO" : "EN"}
          </button>

          <button
            onClick={openRegister}
            className="hidden h-9 items-center rounded-full bg-coral px-4 text-xs font-bold text-white transition-opacity hover:opacity-90 md:flex"
          >
            {i18n.nav.register[lang]}
          </button>

          {/* 로그인 / 사용자 메뉴 */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="hidden h-9 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 text-xs font-bold text-ink/80 transition-colors hover:border-forest md:flex"
                  aria-label="계정 메뉴"
                >
                  {user.picture ? (
                    <img src={user.picture} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-cream">
                      {(user.name ?? user.email ?? "?").slice(0, 1)}
                    </span>
                  )}
                  <span className="max-w-[80px] truncate">{user.name ?? user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">관리자</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => void signOut()}>
                  {i18n.nav.logout[lang]}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="hidden h-9 items-center rounded-full border border-border bg-card px-4 text-xs font-bold text-ink/80 transition-colors hover:border-forest hover:text-forest md:flex"
            >
              {i18n.nav.login[lang]}
            </button>
          )}

          {/* mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card lg:hidden" aria-label="메뉴 열기">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-paper">
              <div className="mt-8 flex flex-col gap-1">
                {navItems.map((n) => (
                  <SheetClose asChild key={n.key}>
                    <Link
                      to={n.to}
                      className="rounded-lg px-3 py-3 text-lg font-bold text-ink transition-colors hover:bg-beige hover:text-forest"
                    >
                      {i18n.nav[n.key][lang]}
                    </Link>
                  </SheetClose>
                ))}
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center gap-2 px-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">도시 선택</span>
                  </div>
                  <div className="mt-2 px-3">
                    <Select
                      value={city}
                      onValueChange={(v) => {
                        setCity(v);
                        setOpen(false);
                      }}
                    >
                      <SelectTrigger className="w-full rounded-full bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.ko} · {c.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4 flex gap-2 px-3">
                    <button
                      onClick={() => setLang(lang === "ko" ? "en" : "ko")}
                      className="flex-1 rounded-full border border-border bg-card py-2.5 text-sm font-bold"
                    >
                      {lang === "ko" ? "English" : "한국어"}
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        openRegister();
                      }}
                      className="flex-1 rounded-full bg-coral py-2.5 text-sm font-bold text-white"
                    >
                      {i18n.nav.register[lang]}
                    </button>
                  </div>
                  <div className="mt-2 px-3">
                    {user ? (
                      <button
                        onClick={() => void signOut()}
                        className="w-full rounded-full border border-border bg-card py-2.5 text-sm font-bold"
                      >
                        {user.name ?? user.email} · {i18n.nav.logout[lang]}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setOpen(false);
                          setLoginOpen(true);
                        }}
                        className="w-full rounded-full border border-border bg-card py-2.5 text-sm font-bold"
                      >
                        {i18n.nav.login[lang]}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

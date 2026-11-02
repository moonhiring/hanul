import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import RegisterDialog from "@/components/RegisterDialog";
import LoginDialog from "@/components/LoginDialog";
import FontSwitcher from "@/components/FontSwitcher";
import { Toaster } from "@/components/ui/sonner";
import { SiteProvider, useSite } from "@/context";

function Shell() {
  const { registerOpen, setRegisterOpen, loginOpen, setLoginOpen } = useSite();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <FontSwitcher />
      <Toaster position="bottom-center" />
    </div>
  );
}

export default function SiteLayout() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  );
}

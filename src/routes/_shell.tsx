import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot, FileText, FolderOpen, LayoutDashboard, Menu, MapPin, Search, Settings, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DemoBadge, LanguageSelect, Logo, TourButton, useLanguage } from "@/components/moya";

export const Route = createFileRoute("/_shell")({ component: Shell });

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/report", label: "Report an Issue", icon: FileText },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/services", label: "Community Services", icon: MapPin },
  { to: "/information", label: "Information Hub", icon: Search },
  { to: "/reports", label: "My Reports", icon: FolderOpen },
  { to: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          activeProps={{ className: "!bg-primary !text-primary-foreground shadow-soft" }}
        >
          <n.icon className="h-5 w-5" aria-hidden="true" /> {n.label}
        </Link>
      ))}
    </nav>
  );
}

function Shell() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();
  useEffect(() => { document.documentElement.classList.toggle("large-text", localStorage.getItem("moya-large") === "1"); }, []);
  return (
    <div className="min-h-screen bg-muted/40">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <div className="stripe-band h-1" />
        <div className="p-5"><Logo /></div>
        <div className="flex-1 overflow-y-auto px-3"><NavList /></div>
        <div className="m-3 rounded-xl bg-navy p-4 text-navy-foreground">
          <p className="text-sm font-semibold">Not an emergency service</p>
          <p className="mt-1 text-xs opacity-80">For immediate danger, contact the appropriate emergency service directly.</p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mb-6 mt-2"><Logo /></div>
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="lg:hidden"><Logo /></div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex"><DemoBadge /></span>
            <TourButton className="hidden md:inline-flex" />
            <LanguageSelect />
          </div>
        </header>
        {lang !== "English" && (
          <div role="status" className="border-b bg-brand-gold-soft px-6 py-2 text-sm font-medium">
            {lang} translation coming soon — showing English for now.
          </div>
        )}
        <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

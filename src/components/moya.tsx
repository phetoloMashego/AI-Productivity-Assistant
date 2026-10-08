import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bot, Compass, FileText, FlaskConical, Globe, MapPin, Search, TrendingUp, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 font-display font-bold text-navy", className)} aria-label="MoyaAssist SA home">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M4 15c3-6 6 2 8-4s5 2 8-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="12" cy="19" r="1.6" fill="currentColor" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-brand-gold" />
      </span>
      <span className="text-lg leading-none">
        MoyaAssist <span className="text-primary">SA</span>
      </span>
    </Link>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/40 bg-brand-gold-soft px-2.5 py-1 text-xs font-semibold text-foreground">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> Demo Mode
    </span>
  );
}

export function DemoDataLabel({ text = "Demonstration data" }: { text?: string }) {
  return <span className="inline-flex items-center rounded-md bg-brand-gold-soft px-2 py-0.5 text-xs font-semibold text-foreground">{text}</span>;
}

export function AiSource({ source }: { source: "ai" | "demo" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold", source === "ai" ? "bg-brand-blue-soft text-brand-blue" : "bg-muted text-muted-foreground")}>
      <Bot className="h-3 w-3" aria-hidden="true" /> {source === "ai" ? "AI-generated" : "Offline demo AI"}
    </span>
  );
}

export function Thinking({ label = "MoyaAssist is thinking" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border bg-brand-blue-soft/60 px-4 py-3 text-sm font-medium text-brand-blue">
      <span className="flex gap-1" aria-hidden="true">
        <span className="thinking-dot h-2 w-2 rounded-full bg-brand-blue" />
        <span className="thinking-dot h-2 w-2 rounded-full bg-primary" />
        <span className="thinking-dot h-2 w-2 rounded-full bg-brand-gold" />
      </span>
      {label}…
    </div>
  );
}

export function EmergencyNotice() {
  return (
    <div role="alert" className="flex gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 text-sm">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
      <p className="font-semibold text-foreground">
        This platform is not an emergency service. For immediate danger or emergencies, contact the appropriate emergency service directly.
      </p>
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      MoyaAssist SA is an independent community-support prototype and is not affiliated with any South African government department or municipality.
    </p>
  );
}

const LANGS = ["English", "isiXhosa", "isiZulu", "Sesotho", "Setswana", "Afrikaans"];
export function useLanguage() {
  const [lang, setLang] = useState("English");
  useEffect(() => {
    setLang(localStorage.getItem("moya-lang") || "English");
    const h = () => setLang(localStorage.getItem("moya-lang") || "English");
    window.addEventListener("moya-lang", h);
    return () => window.removeEventListener("moya-lang", h);
  }, []);
  const change = (l: string) => {
    localStorage.setItem("moya-lang", l);
    window.dispatchEvent(new Event("moya-lang"));
    if (l !== "English") toast.info(`${l} translation coming soon`, { description: "The prototype is currently available in English." });
  };
  return { lang, change, LANGS };
}

export function LanguageSelect({ className }: { className?: string }) {
  const { lang, change, LANGS } = useLanguage();
  return (
    <Select value={lang} onValueChange={change}>
      <SelectTrigger className={cn("h-9 w-[140px] gap-1.5", className)} aria-label="Choose language">
        <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l} value={l}>
            {l}
            {l !== "English" && <span className="ml-1 text-xs text-muted-foreground">(soon)</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const TOUR = [
  { icon: FileText, title: "Report a community issue", body: "Describe a problem in your own words — a suburb or landmark is enough for location.", to: "/report" },
  { icon: Wand2, title: "Let AI classify it", body: "MoyaAssist identifies the category, urgency, key facts and what information is missing.", to: "/report" },
  { icon: Bot, title: "Generate a structured report", body: "One click turns informal language into a clear report you can edit, copy and save.", to: "/report" },
  { icon: MapPin, title: "Find relevant services", body: "Tell the AI Service Finder what you need and it recommends entries from the directory.", to: "/services" },
  { icon: Search, title: "Understand public information", body: "Paste a confusing notice and get a plain-language summary, dates, actions and questions.", to: "/information" },
  { icon: TrendingUp, title: "Track community issues", body: "Follow your saved reports and see community impact on the dashboard.", to: "/reports" },
] as const;

export function TourButton({ variant = "outline", className }: { variant?: "outline" | "default" | "secondary"; className?: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const s = TOUR[step] ?? TOUR[0];
  return (
    <>
      <Button variant={variant} className={className} onClick={() => { setStep(0); setOpen(true); }}>
        <Compass className="h-4 w-4" aria-hidden="true" /> Take a Tour
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Step {step + 1} of {TOUR.length}</p>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <s.icon className="h-5 w-5 text-primary" aria-hidden="true" /> {s.title}
            </DialogTitle>
            <DialogDescription className="text-base">{s.body}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-1.5" aria-hidden="true">
            {TOUR.map((_, i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />)}
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            <div className="flex gap-2">
              <Button variant="outline" asChild onClick={() => setOpen(false)}><Link to={s.to}>Try it</Link></Button>
              {step < TOUR.length - 1 ? (
                <Button onClick={() => setStep(step + 1)}>Next</Button>
              ) : (
                <Button onClick={() => { setOpen(false); toast.success("Tour complete — you're ready to present!"); }}>Finish</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export const STATUS_STYLE: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Ready to Submit": "bg-brand-gold-soft text-foreground",
  Submitted: "bg-brand-blue-soft text-brand-blue",
  "In Progress": "bg-warning-soft text-foreground",
  Resolved: "bg-secondary text-secondary-foreground",
};

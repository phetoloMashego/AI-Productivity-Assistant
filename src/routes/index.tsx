import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CheckCircle2, ClipboardList, Droplets, FileSearch, Lightbulb, MapPin, MessageSquare, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBadge, Disclaimer, LanguageSelect, Logo, TourButton } from "@/components/moya";

const TITLE = "MoyaAssist SA — Making it easier for communities to be heard";
const DESC = "MoyaAssist SA uses AI to help South Africans report community problems, understand public-service information, and find useful resources.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: MessageSquare, title: "Tell us what's happening", body: "Describe your community problem in normal language." },
  { icon: Wand2, title: "AI understands the problem", body: "MoyaAssist identifies the issue type and extracts important information." },
  { icon: ClipboardList, title: "Create a structured report", body: "AI converts the description into a clear, professional report." },
  { icon: CheckCircle2, title: "Track and manage the issue", body: "Save and monitor your reports in one place." },
];

const FEATURES = [
  { icon: Wand2, title: "AI Issue Classification", body: "Category, urgency and missing details — instantly.", to: "/report" },
  { icon: ClipboardList, title: "AI Report Generator", body: "Informal words become a clear, editable report.", to: "/report" },
  { icon: Bot, title: "AI Community Assistant", body: "Plain-language answers to everyday questions.", to: "/assistant" },
  { icon: FileSearch, title: "Understand This", body: "Complicated notices explained simply.", to: "/information" },
  { icon: MapPin, title: "AI Service Finder", body: "Find relevant help from the directory.", to: "/services" },
] as const;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="stripe-band h-1" />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex"><DemoBadge /></span>
          <LanguageSelect className="hidden sm:flex" />
          <Button asChild><Link to="/dashboard">Open app</Link></Button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pattern-weave absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Making it easier for communities to be heard.
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
              Your AI Assistant for a <span className="text-primary">Better Community</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Report local problems, understand public-service information, and find community resources with help from AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="h-12 px-6 text-base"><Link to="/assistant">Get Community Help <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base"><Link to="/report">Report a Problem</Link></Button>
              <TourButton variant="secondary" className="h-12 px-5 text-base" />
            </div>
            <Disclaimer className="mt-6 max-w-lg" />
          </div>
          <HeroMockup />
        </div>
      </section>

      <section className="border-y bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-navy">Making it easier for communities to be heard.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted-foreground">
            MoyaAssist SA uses AI to help South Africans report community problems, understand public-service information, and find useful resources — all from one simple platform.
          </p>
          <h3 className="mt-14 text-center text-sm font-bold uppercase tracking-widest text-primary">How it works</h3>
          <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary"><s.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="font-display text-3xl font-extrabold text-border">0{i + 1}</span>
                </div>
                <h4 className="mt-4 text-lg font-bold text-navy">{s.title}</h4>
                <p className="mt-1 text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold text-navy">Five AI tools, one simple place</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.to} className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <f.icon className="h-6 w-6 text-brand-blue" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-navy">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </Link>
          ))}
        </div>
        <div className="mt-12 grid gap-4 rounded-3xl bg-navy p-8 text-navy-foreground md:grid-cols-[auto_1fr_auto] md:items-center">
          <ShieldCheck className="h-10 w-10 text-brand-gold" aria-hidden="true" />
          <div>
            <h3 className="text-xl font-bold">Built responsibly</h3>
            <p className="mt-1 opacity-85">AI can make mistakes. MoyaAssist never invents facts, isn't an emergency service, and isn't a government platform.</p>
          </div>
          <Button variant="secondary" asChild><Link to="/responsible-ai">Our Responsible AI approach</Link></Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6">
          <Logo />
          <Disclaimer />
          <p className="text-sm text-muted-foreground">Not an emergency service. For immediate danger, contact the appropriate emergency service directly.</p>
        </div>
      </footer>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative animate-rise [animation-delay:120ms]" aria-label="Preview of the MoyaAssist dashboard" role="img">
      <div className="rounded-3xl border bg-card p-4 shadow-lift">
        <div className="flex items-center justify-between border-b pb-3">
          <p className="font-display font-bold text-navy">Good afternoon 👋</p>
          <DemoBadge />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[["248", "Reported"], ["173", "Resolved"], ["75", "Active"]].map(([n, l]) => (
            <div key={l} className="rounded-xl bg-muted p-3"><p className="font-display text-xl font-bold text-navy">{n}</p><p className="text-xs text-muted-foreground">{l}</p></div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent reports</p>
          {[["Pothole near school", "Draft", "bg-muted"], ["Water leak near shops", "Submitted", "bg-brand-blue-soft"], ["Missed waste collection", "Resolved", "bg-secondary"]].map(([t, s, c]) => (
            <div key={t} className="mt-2 flex items-center justify-between text-sm"><span className="text-foreground">{t}</span><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${c}`}>{s}</span></div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-brand-blue-soft p-3 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-brand-blue"><Bot className="h-4 w-4" /> MoyaAssist</p>
            <p className="mt-1 text-foreground">Category: <b>Road/Pothole</b><br />Urgency: <b>High</b></p>
          </div>
          <div className="rounded-xl bg-secondary p-3 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-secondary-foreground"><MapPin className="h-4 w-4" /> Nearby services</p>
            <p className="mt-1 text-foreground">Clinic · Library · Youth hub</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-2xl border bg-card px-4 py-3 shadow-lift sm:flex">
        <Droplets className="h-5 w-5 text-brand-blue" /><span className="text-sm font-semibold">Water leak report generated</span>
      </div>
      <div className="absolute -right-3 -top-4 hidden items-center gap-2 rounded-2xl border bg-card px-4 py-3 shadow-lift sm:flex">
        <Lightbulb className="h-5 w-5 text-brand-gold" /><span className="text-sm font-semibold">Streetlight: In progress</span>
      </div>
    </div>
  );
}

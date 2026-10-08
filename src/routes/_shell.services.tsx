import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Clock, Globe, MapPin, Phone, Search, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiSource, DemoDataLabel, PageHeader, Thinking } from "@/components/moya";
import { recommendServices } from "@/lib/ai.functions";
import { AREAS, SERVICE_CATEGORIES, SERVICES, type Service } from "@/lib/data";

export const Route = createFileRoute("/_shell/services")({
  head: () => ({
    meta: [
      { title: "Community Services — MoyaAssist SA" },
      { name: "description", content: "Search a directory of community services and let AI recommend the right help." },
      { property: "og:title", content: "Community Services — MoyaAssist SA" },
      { property: "og:description", content: "Community services directory with an AI Service Finder." },
    ],
  }),
  component: Services,
});

const byId = new Map(SERVICES.map((s) => [s.id, s]));

function Services() {
  const recommend = useServerFn(recommendServices);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [area, setArea] = useState("all");
  const [need, setNeed] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ need: string; matches: { id: string; reason: string }[]; source: "ai" | "demo" } | null>(null);
  const list = useMemo(() => SERVICES.filter((s) => (cat === "all" || s.category === cat) && (area === "all" || s.area === area) && (s.name + s.description + s.category).toLowerCase().includes(q.toLowerCase())), [q, cat, area]);

  async function find() {
    if (need.trim().length < 3) { toast.error("Tell us what kind of help you need."); return; }
    setBusy(true);
    try { setResult(await recommend({ data: { query: need.slice(0, 1000) } })); }
    catch { toast.error("Couldn't search right now. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader title="Community Services" subtitle="Find useful community resources near you."><DemoDataLabel text="Demo directory — fictional organisations" /></PageHeader>

      <section className="mb-8 rounded-2xl border bg-gradient-to-br from-secondary to-brand-blue-soft p-5 shadow-soft sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy"><Wand2 className="h-5 w-5 text-primary" /> AI Service Finder</h2>
        <p className="mt-1 text-sm text-muted-foreground">Describe what you need. AI only recommends services that exist in this directory.</p>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); void find(); }}>
          <Input value={need} onChange={(e) => setNeed(e.target.value)} placeholder="e.g. I need help finding a place that provides food support." className="h-12 bg-card text-base" aria-label="Describe what help you need" maxLength={1000} />
          <Button type="submit" size="lg" className="h-12" disabled={busy}>Find help</Button>
        </form>
        <div className="mt-2 flex flex-wrap gap-2">
          {["I need food support in Cape Town", "Career guidance for young people", "Free legal advice"].map((x) => <button key={x} onClick={() => setNeed(x)} className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground hover:text-foreground">{x}</button>)}
        </div>
        {busy && <div className="mt-4"><Thinking label="Matching your need to the directory" /></div>}
        {result && !busy && (
          <div className="mt-5 animate-rise">
            <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">Need identified: <span className="text-primary">{result.need}</span></p><AiSource source={result.source} /></div>
            {result.matches.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No matching services in the directory. Try different words or browse below.</p> : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {result.matches.map((m) => { const s = byId.get(m.id)!; return <ServiceCard key={m.id} s={s} reason={m.reason} />; })}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services" className="pl-9" aria-label="Search services" />
        </div>
        <Select value={cat} onValueChange={setCat}><SelectTrigger className="md:w-56" aria-label="Category"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{SERVICE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={area} onValueChange={setArea}><SelectTrigger className="md:w-44" aria-label="Area"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All areas</SelectItem>{AREAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">No services match your filters.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
      )}
    </div>
  );
}

function ServiceCard({ s, reason }: { s: Service; reason?: string }) {
  return (
    <article className="flex flex-col rounded-2xl border bg-card p-5 shadow-soft">
      <span className="w-fit rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{s.category}</span>
      <h3 className="mt-2 font-bold text-navy">{s.name}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.description}</p>
      {reason && <p className="mt-2 rounded-lg bg-brand-blue-soft px-3 py-2 text-sm text-brand-blue"><b>Why:</b> {reason}</p>}
      <ul className="mt-3 space-y-1 text-sm">
        <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {s.area}</li>
        <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {s.contact}</li>
        {s.website && <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /> {s.website} (demo)</li>}
        {s.hours && <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> {s.hours}</li>}
      </ul>
    </article>
  );
}

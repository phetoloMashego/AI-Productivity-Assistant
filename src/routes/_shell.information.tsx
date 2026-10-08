import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CalendarDays, CheckSquare, FileSearch, HelpCircle, Lightbulb, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiSource, PageHeader, Thinking } from "@/components/moya";
import { simplifyInformation } from "@/lib/ai.functions";
import type { Simplified } from "@/lib/ai-mock";

export const Route = createFileRoute("/_shell/information")({
  head: () => ({
    meta: [
      { title: "Understand This — MoyaAssist SA" },
      { name: "description", content: "Paste a complicated public notice and get a simple explanation, key dates, actions and questions to ask." },
      { property: "og:title", content: "Understand This — MoyaAssist SA" },
      { property: "og:description", content: "AI that explains public notices in plain language." },
    ],
  }),
  component: Info,
});

const SAMPLE = `NOTICE OF PLANNED WATER SUPPLY INTERRUPTION. Residents of Ward 12 are hereby notified that, owing to essential maintenance on the bulk supply pipeline, water supply will be interrupted from 08:00 on 14 October 2026 until 18:00 on 15 October 2026. Consumers are advised to store sufficient water for drinking and cooking purposes prior to the commencement of the interruption. Low pressure or discoloured water may be experienced upon restoration. Water tankers will be stationed at the community hall. For enquiries, contact the service desk on 021 000 0000 or email ward12@example.org.`;

function Info() {
  const simplify = useServerFn(simplifyInformation);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [r, setR] = useState<(Simplified & { source: "ai" | "demo" }) | null>(null);

  async function go() {
    if (text.trim().length < 20) { toast.error("Please paste a bit more text (at least a sentence or two)."); return; }
    setBusy(true);
    try { setR(await simplify({ data: { text: text.slice(0, 12000) } })); toast.success("Explanation ready"); }
    catch { toast.error("Couldn't explain this right now. Please try again."); }
    finally { setBusy(false); }
  }

  const blocks = r ? [
    { icon: Lightbulb, title: "What does this mean?", items: r.meaning },
    { icon: CheckSquare, title: "What do I need to do?", items: r.actions },
    { icon: CalendarDays, title: "Important dates", items: r.dates },
    { icon: Phone, title: "Important contacts", items: r.contacts.length ? r.contacts : ["No contact details found."] },
    { icon: HelpCircle, title: "Questions to ask", items: r.questions },
  ] : [];

  return (
    <div>
      <PageHeader title="Understand This" subtitle="Information Hub — paste a notice, announcement or document and get a simple explanation." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <label htmlFor="notice" className="text-base font-semibold">Paste the text here</label>
          <Textarea id="notice" rows={14} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a municipal notice, public announcement or official letter…" className="mt-2 text-base" maxLength={12000} />
          <p className="mt-1 text-xs text-muted-foreground">{text.length}/12000 · Avoid pasting personal ID or account numbers.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="lg" onClick={go} disabled={busy}><FileSearch className="h-4 w-4" /> Explain simply</Button>
            <Button size="lg" variant="outline" onClick={() => setText(SAMPLE)}>Use sample notice</Button>
            {text && <Button size="lg" variant="ghost" onClick={() => { setText(""); setR(null); }}>Clear</Button>}
          </div>
        </div>
        <div className="space-y-4">
          {busy && <Thinking label="Reading and simplifying" />}
          {!busy && !r && (
            <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">
              <FileSearch className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 font-semibold text-foreground">Your plain-language explanation will appear here</p>
            </div>
          )}
          {r && !busy && (
            <div className="animate-rise space-y-4">
              <section className="rounded-2xl bg-navy p-5 text-navy-foreground shadow-soft">
                <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-bold">Simple summary</h2><AiSource source={r.source} /></div>
                <p className="mt-2 text-base opacity-90">{r.summary}</p>
              </section>
              {blocks.map((b) => (
                <section key={b.title} className="rounded-2xl border bg-card p-5 shadow-soft">
                  <h3 className="flex items-center gap-2 font-bold text-navy"><b.icon className="h-5 w-5 text-primary" /> {b.title}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground">{b.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </section>
              ))}
              <p className="flex items-center gap-2 rounded-xl bg-brand-gold-soft px-4 py-3 text-sm font-semibold"><AlertCircle className="h-4 w-4" /> AI-generated summary — verify important information against the original source.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

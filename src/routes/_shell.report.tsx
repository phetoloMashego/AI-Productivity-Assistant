import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Copy, ImagePlus, Pencil, RefreshCw, Save, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiSource, EmergencyNotice, PageHeader, Thinking } from "@/components/moya";
import { classifyIssue, generateReport } from "@/lib/ai.functions";
import type { Classification } from "@/lib/ai-mock";
import { contactFor, ISSUE_CATEGORIES, looksLikeEmergency, URGENCY } from "@/lib/data";
import { useReports } from "@/lib/reports-store";

export const Route = createFileRoute("/_shell/report")({
  head: () => ({
    meta: [
      { title: "Report an Issue — MoyaAssist SA" },
      { name: "description", content: "Describe a community problem in your own words and let AI classify it and write a clear report." },
      { property: "og:title", content: "Report an Issue — MoyaAssist SA" },
      { property: "og:description", content: "AI-powered community issue reporting." },
    ],
  }),
  component: ReportPage,
});

const EXAMPLES = [
  "There is a huge pothole near the school entrance and cars are struggling to drive around it.",
  "There is a big water leak by the shops. It's been running for two days.",
  "Our street's bins weren't collected on Tuesday and it's starting to smell.",
];

function ReportPage() {
  const classify = useServerFn(classifyIssue);
  const gen = useServerFn(generateReport);
  const { add } = useReports();
  const navigate = useNavigate();
  const [f, setF] = useState({ description: "", category: "", area: "", address: "", date: new Date().toISOString().slice(0, 10), urgency: "", contact: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<(Classification & { source: "ai" | "demo" }) | null>(null);
  const [report, setReport] = useState<{ text: string; source: "ai" | "demo" } | null>(null);
  const [busy, setBusy] = useState<"classify" | "report" | null>(null);
  const [editing, setEditing] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const emergency = looksLikeEmergency(f.description) || analysis?.isEmergency;

  function validate() {
    const e: Record<string, string> = {};
    if (f.description.trim().length < 10) e["description"] = "Please describe the problem in at least a few words.";
    if (f.description.length > 4000) e["description"] = "Please keep the description under 4000 characters.";
    if (!f.area.trim()) e["area"] = "Please add an area, suburb or landmark — approximate is fine.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function runClassify() {
    if (f.description.trim().length < 10) { setErrors({ description: "Please describe the problem first." }); return; }
    setBusy("classify");
    try {
      const r = await classify({ data: { description: f.description, area: f.area || undefined } });
      setAnalysis(r);
      if (!f.category) { const match = ISSUE_CATEGORIES.find((c) => c.toLowerCase() === r.category.toLowerCase()); if (match) set("category", match); }
      if (!f.urgency) { const u = URGENCY.find((x) => r.urgency.startsWith(x)); if (u) set("urgency", u); }
      toast.success("AI analysis ready");
    } catch { toast.error("Couldn't analyse the issue. Please try again."); }
    finally { setBusy(null); }
  }

  async function runReport() {
    if (!validate()) { toast.error("Please fix the highlighted fields."); return; }
    setBusy("report");
    try {
      if (!analysis) void runClassify();
      const r = await gen({ data: { description: f.description, category: f.category || undefined, area: f.area, address: f.address || undefined, date: f.date || undefined, urgency: f.urgency || undefined } });
      setReport({ text: r.report, source: r.source });
      setEditing(false);
      toast.success("Report generated — review it before saving.");
    } catch { toast.error("Couldn't generate the report. Please try again."); }
    finally { setBusy(null); }
  }

  function save() {
    if (!report) return;
    const category = f.category || analysis?.category || "Other";
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    add({
      id, title: (analysis?.summary || f.description).slice(0, 60).replace(/\.$/, ""), category, status: "Draft", area: f.area, address: f.address, urgency: f.urgency || analysis?.urgency || "Medium",
      description: f.description, report: report.text, createdAt: now, history: [{ status: "Draft", at: now, note: "Report saved" }],
    });
    toast.success("Report saved to My Reports", { action: { label: "View", onClick: () => navigate({ to: "/reports", search: { open: id } }) } });
  }

  const contact = (f.category || analysis?.category) && f.area ? contactFor(f.category || analysis!.category, f.area) : null;

  return (
    <div>
      <PageHeader title="Report an Issue" subtitle="Describe the problem in your own words. A suburb or landmark is enough — no exact address needed." />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form className="space-y-5 rounded-2xl border bg-card p-5 shadow-soft sm:p-6" onSubmit={(e) => { e.preventDefault(); void runReport(); }} noValidate>
          <div>
            <Label htmlFor="desc" className="text-base">What's happening? *</Label>
            <Textarea id="desc" rows={5} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. There's a big water leak by the shops…" className="mt-2 text-base" aria-invalid={!!errors["description"]} aria-describedby="desc-err" maxLength={4000} />
            {errors["description"] && <p id="desc-err" className="mt-1 text-sm font-medium text-destructive">{errors["description"]}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button type="button" key={ex} onClick={() => set("description", ex)} className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  {ex.slice(0, 38)}…
                </button>
              ))}
            </div>
          </div>
          {emergency && <EmergencyNotice />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-base">Problem type</Label>
              <Select value={f.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="mt-2" aria-label="Problem type"><SelectValue placeholder="Let AI suggest" /></SelectTrigger>
                <SelectContent>{ISSUE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-base">Urgency</Label>
              <Select value={f.urgency} onValueChange={(v) => set("urgency", v)}>
                <SelectTrigger className="mt-2" aria-label="Urgency"><SelectValue placeholder="Let AI suggest" /></SelectTrigger>
                <SelectContent>{URGENCY.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="area" className="text-base">Area / suburb *</Label>
              <Input id="area" value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Bellville, Cape Town" className="mt-2" aria-invalid={!!errors["area"]} maxLength={200} />
              {errors["area"] && <p className="mt-1 text-sm font-medium text-destructive">{errors["area"]}</p>}
            </div>
            <div>
              <Label htmlFor="addr" className="text-base">Address or landmark <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="addr" value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Near the local shopping centre" className="mt-2" maxLength={300} />
            </div>
            <div>
              <Label htmlFor="date" className="text-base">Date noticed</Label>
              <Input id="date" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="contact" className="text-base">Contact <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="contact" value={f.contact} onChange={(e) => set("contact", e.target.value)} placeholder="Phone or email" className="mt-2" maxLength={120} />
            </div>
          </div>
          <div>
            <Label className="text-base">Photo <span className="text-muted-foreground">(optional)</span></Label>
            {photo ? (
              <div className="relative mt-2 w-40">
                <img src={photo} alt="Uploaded problem" className="h-28 w-40 rounded-xl object-cover" />
                <button type="button" aria-label="Remove photo" onClick={() => setPhoto(null)} className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background"><X className="h-3 w-3" /></button>
              </div>
            ) : (
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed p-4 text-sm text-muted-foreground hover:bg-muted">
                <ImagePlus className="h-5 w-5" /> Add a photo (only if safe to take one)
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  if (file.size > 5_000_000) { toast.error("Photo must be under 5 MB"); return; }
                  setPhoto(URL.createObjectURL(file)); toast.success("Photo added");
                }} />
              </label>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" size="lg" onClick={runClassify} disabled={!!busy}><Wand2 className="h-4 w-4" /> Analyse with AI</Button>
            <Button type="submit" size="lg" disabled={!!busy}><Wand2 className="h-4 w-4" /> Generate Report with AI</Button>
          </div>
        </form>

        <div className="space-y-5">
          {busy === "classify" && <Thinking label="Analysing your description" />}
          {analysis && (
            <section className="animate-rise rounded-2xl border bg-card p-5 shadow-soft" aria-live="polite">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-navy">AI Issue Analysis</h2><AiSource source={analysis.source} /></div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted p-3"><dt className="text-muted-foreground">Category</dt><dd className="font-bold text-navy">{analysis.category}</dd></div>
                <div className="rounded-xl bg-muted p-3"><dt className="text-muted-foreground">Urgency</dt><dd className="font-bold text-navy">{analysis.urgency}</dd></div>
                <div className="col-span-2 rounded-xl bg-muted p-3"><dt className="text-muted-foreground">Affected area</dt><dd className="font-semibold">{analysis.affectedArea}</dd></div>
              </dl>
              <p className="mt-3 text-sm"><b>Summary:</b> {analysis.summary}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><p className="text-sm font-semibold">Information found</p><ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{analysis.extracted.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div><p className="text-sm font-semibold text-warning">Recommended to add</p><ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{analysis.missing.map((x) => <li key={x}>{x}</li>)}</ul></div>
              </div>
            </section>
          )}
          {busy === "report" && <Thinking label="Writing your structured report" />}
          {report ? (
            <section className="animate-rise rounded-2xl border bg-card p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-navy">Generated report</h2><AiSource source={report.source} /></div>
              {editing ? (
                <Textarea rows={16} value={report.text} onChange={(e) => setReport({ ...report, text: e.target.value })} className="font-mono text-sm" aria-label="Edit report" />
              ) : (
                <div className="prose prose-sm max-w-none rounded-xl bg-muted/60 p-4 text-foreground [&_h3]:mt-0 [&_h3]:text-navy [&_p]:my-2"><ReactMarkdown>{report.text}</ReactMarkdown></div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Review carefully — AI can make mistakes. Missing details are marked "Not provided".</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setEditing(!editing)}><Pencil className="h-4 w-4" /> {editing ? "Preview" : "Edit"}</Button>
                <Button variant="outline" onClick={runReport} disabled={!!busy}><RefreshCw className="h-4 w-4" /> Regenerate</Button>
                <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(report.text); toast.success("Copied to clipboard"); }}><Copy className="h-4 w-4" /> Copy</Button>
                <Button onClick={save}><Save className="h-4 w-4" /> Save Report</Button>
              </div>
            </section>
          ) : !busy && !analysis && (
            <div className="rounded-2xl border-2 border-dashed p-8 text-center text-muted-foreground">
              <Wand2 className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 font-semibold text-foreground">Your AI analysis and report will appear here</p>
              <p className="mt-1 text-sm">Try one of the example descriptions to see how it works.</p>
            </div>
          )}
          {contact && (
            <section className="rounded-2xl border bg-brand-blue-soft/50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-blue">Relevant municipal contact · demo data</p>
              <p className="mt-1 font-bold text-navy">{contact.department} — {contact.municipality}</p>
              <p className="text-sm text-muted-foreground">{contact.phone} · {contact.email}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

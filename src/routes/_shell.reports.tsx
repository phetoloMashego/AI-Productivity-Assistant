import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { z } from "zod";
import { Building2, Check, FolderOpen, Mail, Phone, Plus, Search, Send, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PageHeader, STATUS_STYLE } from "@/components/moya";
import { contactFor, STATUSES, type Report, type ReportStatus } from "@/lib/data";
import { timeAgo, useReports } from "@/lib/reports-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/reports")({
  validateSearch: z.object({ open: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "My Reports — MoyaAssist SA" },
      { name: "description", content: "Track your community service requests, their status and the relevant municipal contact." },
      { property: "og:title", content: "My Reports — MoyaAssist SA" },
      { property: "og:description", content: "Track community service requests." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { reports, update, remove } = useReports();
  const { open } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [confirm, setConfirm] = useState<null | { type: "submit" | "delete"; id: string }>(null);
  const filtered = useMemo(() => reports.filter((r) => (status === "all" || r.status === status) && (r.title + r.category + r.area).toLowerCase().includes(q.toLowerCase())), [reports, q, status]);
  const selected = reports.find((r) => r.id === open);

  function advance(r: Report, to: ReportStatus, note: string, extra: Partial<Report> = {}) {
    const history = [...(r.history ?? [{ status: r.status, at: r.createdAt }]), { status: to, at: new Date().toISOString(), note }];
    update(r.id, { status: to, history, ...extra });
  }

  function doSubmit(r: Report) {
    const reference = `MA-${Math.floor(100000 + Math.random() * 900000)}`;
    advance(r, "Submitted", "Marked as submitted (prototype — not sent to any municipality)", { reference });
    toast.success(`Request marked as submitted · ${reference}`, { description: "Prototype status only. Use the municipal contact to log it officially." });
  }

  return (
    <div>
      <PageHeader title="My Reports" subtitle="Your saved service requests and their prototype status.">
        <Button asChild><Link to="/report"><Plus className="h-4 w-4" /> New report</Link></Button>
      </PageHeader>
      <div className="mb-5 rounded-xl border border-brand-gold/40 bg-brand-gold-soft px-4 py-3 text-sm">
        <b>Prototype status:</b> MoyaAssist is not connected to any municipal system. Statuses here are for demonstration and personal tracking only.
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reports" className="pl-9" aria-label="Search reports" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-10 text-center">
          <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No reports found</p>
          <p className="text-sm text-muted-foreground">Try a different filter or create a new report.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => navigate({ search: { open: r.id } })} className="rounded-2xl border bg-card p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-navy">{r.title}</h2>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>{r.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Category: {r.category} · {r.area}</p>
              <p className="text-sm text-muted-foreground">Created: {timeAgo(r.createdAt)} {r.reference && `· Ref ${r.reference}`}</p>
              <StatusTrack status={r.status} compact />
              {r.demo && <span className="mt-3 inline-block rounded bg-brand-gold-soft px-2 py-0.5 text-xs font-semibold">Demo report</span>}
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && navigate({ search: {} })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (() => {
            const c = contactFor(selected.category, selected.area);
            const idx = STATUSES.indexOf(selected.status);
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="text-xl text-navy">{selected.title}</SheetTitle>
                  <SheetDescription>{selected.category} · {selected.area} · Urgency {selected.urgency}{selected.reference && ` · Ref ${selected.reference}`}</SheetDescription>
                </SheetHeader>
                <div className="space-y-5 px-4 pb-6">
                  <section>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Status · prototype</h3>
                    <StatusTrack status={selected.status} />
                    <ol className="mt-4 space-y-2 border-l-2 pl-4">
                      {(selected.history ?? [{ status: selected.status, at: selected.createdAt }]).map((h, i) => (
                        <li key={i} className="text-sm"><span className="font-semibold">{h.status}</span> <span className="text-muted-foreground">· {new Date(h.at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</span>{h.note && <p className="text-muted-foreground">{h.note}</p>}</li>
                      ))}
                    </ol>
                  </section>
                  <section className="rounded-xl border bg-brand-blue-soft/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-blue">Relevant municipal contact · demo data</p>
                    <p className="mt-2 flex items-center gap-2 font-bold text-navy"><Building2 className="h-4 w-4" /> {c.department}</p>
                    <p className="text-sm text-muted-foreground">{c.municipality}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {c.phone}</p>
                    <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> {c.email}</p>
                    <p className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4" /> {c.hours}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Fictional contact for demonstration. Check your municipality's official website for real details.</p>
                  </section>
                  <div className="flex flex-wrap gap-2">
                    {idx < 2 && (
                      <>
                        {selected.status === "Draft" && <Button variant="outline" onClick={() => { advance(selected, "Ready to Submit", "Reviewed by resident"); toast.success("Marked ready to submit"); }}><Check className="h-4 w-4" /> Mark ready</Button>}
                        <Button onClick={() => setConfirm({ type: "submit", id: selected.id })}><Send className="h-4 w-4" /> Submit request</Button>
                      </>
                    )}
                    {idx >= 2 && idx < 4 && (
                      <Button variant="outline" onClick={() => { const next = STATUSES[idx + 1]; advance(selected, next, "Demo status update"); toast.success(`Status updated to ${next} (demo)`); }}>Simulate next status</Button>
                    )}
                    <Button variant="ghost" className="text-destructive" onClick={() => setConfirm({ type: "delete", id: selected.id })}><Trash2 className="h-4 w-4" /> Delete</Button>
                  </div>
                  <section>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Report</h3>
                    <div className="prose prose-sm max-w-none rounded-xl bg-muted/60 p-4 [&_h3]:mt-0 [&_p]:my-2"><ReactMarkdown>{selected.report}</ReactMarkdown></div>
                  </section>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.type === "delete" ? "Delete this report?" : "Submit this service request?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.type === "delete"
                ? "This removes the report from this device. It can't be undone."
                : "This is a prototype: the request will be marked as submitted and given a tracking reference, but it is NOT sent to any municipality. Use the municipal contact shown to log it officially."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              const r = reports.find((x) => x.id === confirm?.id); if (!r) return;
              if (confirm?.type === "delete") { remove(r.id); navigate({ search: {} }); toast.success("Report deleted"); } else doSubmit(r);
            }}>{confirm?.type === "delete" ? "Delete" : "Submit (prototype)"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusTrack({ status, compact }: { status: ReportStatus; compact?: boolean }) {
  const idx = STATUSES.indexOf(status);
  return (
    <div className={cn("mt-3", compact && "mt-4")} aria-label={`Status: ${status}`}>
      <div className="flex gap-1">{STATUSES.map((s, i) => <span key={s} className={cn("h-1.5 flex-1 rounded-full", i <= idx ? "bg-primary" : "bg-muted")} />)}</div>
      {!compact && <div className="mt-1.5 grid grid-cols-5 gap-1 text-[0.7rem] text-muted-foreground">{STATUSES.map((s, i) => <span key={s} className={cn(i === idx && "font-bold text-primary")}>{s}</span>)}</div>}
    </div>
  );
}

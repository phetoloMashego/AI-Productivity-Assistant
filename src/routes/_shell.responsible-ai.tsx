import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Brain, Building2, CheckCircle, Lock, Scale, UserCheck } from "lucide-react";
import { EmergencyNotice, PageHeader } from "@/components/moya";

export const Route = createFileRoute("/_shell/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — MoyaAssist SA" },
      { name: "description", content: "How MoyaAssist SA uses AI responsibly: limitations, verification, privacy, bias and human responsibility." },
      { property: "og:title", content: "Responsible AI — MoyaAssist SA" },
      { property: "og:description", content: "Our approach to safe, honest AI for communities." },
    ],
  }),
  component: RAI,
});

const ITEMS = [
  { icon: Brain, title: "AI Limitations", body: "AI can misunderstand information or produce inaccurate recommendations." },
  { icon: CheckCircle, title: "Verification", body: "Users should verify important information using official sources." },
  { icon: Building2, title: "No Government Affiliation", body: "MoyaAssist SA is an independent prototype and does not represent any government department or municipality." },
  { icon: Lock, title: "Privacy", body: "Users should avoid entering unnecessary sensitive personal information." },
  { icon: Scale, title: "AI Bias", body: "AI recommendations may contain biases depending on the information used to train AI systems." },
  { icon: UserCheck, title: "Human Responsibility", body: "Users remain responsible for reviewing AI-generated reports and information." },
];

const RULES = [
  "Never invent names, dates, locations, contacts or events — missing details are marked as missing.",
  "Only recommend services that exist in the app's directory.",
  "Never claim a report was officially submitted — all statuses are prototype statuses.",
  "Never pretend to be a government official or emergency service.",
  "If the AI service is unavailable, a clearly labelled offline demo mode is used.",
];

function RAI() {
  return (
    <div className="space-y-8">
      <PageHeader title="Responsible AI" subtitle="How we keep AI helpful, honest and safe for communities." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((i) => (
          <section key={i.title} className="rounded-2xl border bg-card p-6 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary"><i.icon className="h-5 w-5" /></span>
            <h2 className="mt-4 text-lg font-bold text-navy">{i.title}</h2>
            <p className="mt-1 text-muted-foreground">{i.body}</p>
          </section>
        ))}
      </div>
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="text-xl font-bold text-navy">Rules our AI follows</h2>
        <ul className="mt-3 space-y-2">{RULES.map((r) => <li key={r} className="flex gap-2"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> {r}</li>)}</ul>
      </section>
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-navy"><AlertTriangle className="h-5 w-5 text-destructive" /> Emergency safety</h2>
        <p className="mb-3 text-muted-foreground">MoyaAssist is NOT an emergency response service and cannot dispatch help.</p>
        <EmergencyNotice />
      </section>
    </div>
  );
}

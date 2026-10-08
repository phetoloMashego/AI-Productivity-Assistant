import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, CheckCircle2, FileSearch, FileText, MapPin, Users, Activity, ClipboardList } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoDataLabel, Disclaimer, STATUS_STYLE, TourButton } from "@/components/moya";
import { IMPACT_STATS, ISSUES_BY_CATEGORY, ISSUES_OVER_TIME, RESOLUTION_STATUS } from "@/lib/data";
import { timeAgo, useReports } from "@/lib/reports-store";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MoyaAssist SA" },
      { name: "description", content: "Your community help dashboard: quick actions, recent reports and community impact." },
      { property: "og:title", content: "Dashboard — MoyaAssist SA" },
      { property: "og:description", content: "Quick actions, recent reports and community impact." },
    ],
  }),
  component: Dashboard,
});

const ACTIONS = [
  { to: "/report", icon: FileText, title: "Report a Problem", body: "Report potholes, water problems, electricity issues, waste problems and more.", tone: "bg-primary text-primary-foreground" },
  { to: "/assistant", icon: Bot, title: "Ask AI", body: "Ask questions about community services and public information.", tone: "bg-brand-blue text-primary-foreground" },
  { to: "/services", icon: MapPin, title: "Find Services", body: "Find useful community resources and services.", tone: "bg-brand-gold text-navy" },
  { to: "/information", icon: FileSearch, title: "Understand a Notice", body: "Paste complicated public information and let AI explain it simply.", tone: "bg-navy text-navy-foreground" },
] as const;

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const { reports } = useReports();
  const [hello, setHello] = useState("Good afternoon");
  useEffect(() => setHello(greeting()), []);
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">{hello} 👋</h1>
          <p className="mt-1 text-lg text-muted-foreground">How can we help your community today?</p>
        </div>
        <TourButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ACTIONS.map((a, i) => (
          <Link key={a.to} to={a.to} className="group animate-rise rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift" style={{ animationDelay: `${i * 60}ms` }}>
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${a.tone}`}><a.icon className="h-6 w-6" aria-hidden="true" /></span>
            <h2 className="mt-4 text-lg font-bold text-navy">{a.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Start <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">Recent reports</h2>
          <Link to="/reports" className="text-sm font-semibold text-primary">View all</Link>
        </div>
        <ul className="divide-y">
          {reports.slice(0, 4).map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-semibold text-foreground">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.category} · {r.area} · {timeAgo(r.createdAt)}</p>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="impact">
        <div className="mb-4 flex items-center gap-3">
          <h2 id="impact" className="text-2xl font-bold text-navy">Community impact</h2>
          <DemoDataLabel />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Issues Reported", value: IMPACT_STATS.reported, icon: ClipboardList },
            { label: "Issues Resolved", value: IMPACT_STATS.resolved, icon: CheckCircle2 },
            { label: "Active Reports", value: IMPACT_STATS.active, icon: Activity },
            { label: "Community Members", value: IMPACT_STATS.members.toLocaleString("en-ZA"), icon: Users },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-soft">
              <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-3xl font-bold text-navy">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Issues by category / most common problems">
            <BarChart data={ISSUES_BY_CATEGORY} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={90} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>{ISSUES_BY_CATEGORY.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar>
            </BarChart>
          </ChartCard>
          <ChartCard title="Issues over time">
            <LineChart data={ISSUES_OVER_TIME}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="reported" stroke="var(--chart-2)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="resolved" stroke="var(--chart-1)" strokeWidth={2.5} />
            </LineChart>
          </ChartCard>
          <ChartCard title="Resolution status">
            <PieChart>
              <Pie data={RESOLUTION_STATUS} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} label={(e) => e.name}>
                {RESOLUTION_STATUS.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartCard>
          <div className="flex flex-col justify-center rounded-2xl border bg-navy p-6 text-navy-foreground shadow-soft">
            <p className="font-display text-5xl font-extrabold text-brand-gold">70%</p>
            <p className="mt-2 text-lg font-semibold">of demo issues reached "Resolved"</p>
            <p className="mt-2 text-sm opacity-80">Clearer reports mean less back-and-forth. All figures on this page are demonstration data.</p>
          </div>
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-bold text-navy">{title}</h3>
        <DemoDataLabel text="Demo" />
      </div>
      <div className="h-64"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </div>
  );
}

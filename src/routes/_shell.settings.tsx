import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Disclaimer, LanguageSelect, PageHeader } from "@/components/moya";
import { useReports } from "@/lib/reports-store";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MoyaAssist SA" },
      { name: "description", content: "Language, text size and demo data settings for MoyaAssist SA." },
      { property: "og:title", content: "Settings — MoyaAssist SA" },
      { property: "og:description", content: "Personalise MoyaAssist SA." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { reset } = useReports();
  const [large, setLarge] = useState(false);
  useEffect(() => setLarge(localStorage.getItem("moya-large") === "1"), []);
  useEffect(() => { document.documentElement.classList.toggle("large-text", large); }, [large]);

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Settings" />
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="font-bold text-navy">Language</h2>
        <p className="mb-3 text-sm text-muted-foreground">English is fully available. Other languages are coming soon.</p>
        <LanguageSelect className="w-56" />
      </section>
      <section className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-soft">
        <div><Label htmlFor="large" className="font-bold text-navy">Larger text</Label><p className="text-sm text-muted-foreground">Make all text easier to read.</p></div>
        <Switch id="large" checked={large} onCheckedChange={(v) => { setLarge(v); localStorage.setItem("moya-large", v ? "1" : "0"); toast.success(v ? "Larger text on" : "Larger text off"); }} />
      </section>
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="font-bold text-navy">Demo data</h2>
        <p className="mb-3 text-sm text-muted-foreground">Restore the sample reports used for presentations. Your own saved reports on this device will be removed.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="outline">Reset demo data</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Reset to demo data?</AlertDialogTitle><AlertDialogDescription>This replaces all reports on this device with the original demo reports.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { reset(); toast.success("Demo data restored"); }}>Reset</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
      <Disclaimer />
    </div>
  );
}

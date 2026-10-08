import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { ArrowUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiSource, EmergencyNotice, PageHeader, Thinking } from "@/components/moya";
import { communityAssistant } from "@/lib/ai.functions";
import { looksLikeEmergency } from "@/lib/data";

export const Route = createFileRoute("/_shell/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — MoyaAssist SA" },
      { name: "description", content: "Ask MoyaAssist simple questions about reporting problems, public notices and community services." },
      { property: "og:title", content: "AI Assistant — MoyaAssist SA" },
      { property: "og:description", content: "Plain-language community help from AI." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string; source?: "ai" | "demo" };
const PROMPTS = ["Help me report a community problem", "Explain this notice", "Help me write a complaint", "Find community resources", "What should I do if my waste collection was missed?"];

function Assistant() {
  const ask = useServerFn(communityAssistant);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [msgs, busy]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: t.slice(0, 4000) }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await ask({ data: { messages: next.slice(-20).map(({ role, content }) => ({ role, content })) } });
      setMsgs([...next, { role: "assistant", content: r.reply, source: r.source }]);
    } catch { toast.error("MoyaAssist couldn't reply. Please try again."); }
    finally { setBusy(false); }
  }

  const lastUser = [...msgs].reverse().find((m) => m.role === "user");

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader title="MoyaAssist" subtitle="Your AI community assistant. I give general guidance — I'm not a government official.">
        {msgs.length > 0 && <Button variant="outline" onClick={() => setMsgs([])}><RotateCcw className="h-4 w-4" /> New chat</Button>}
      </PageHeader>
      <div className="flex-1 overflow-y-auto rounded-2xl border bg-card p-4 shadow-soft sm:p-6" aria-live="polite">
        {msgs.length === 0 ? (
          <div className="mx-auto max-w-lg py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-2xl text-primary-foreground">M</div>
            <h2 className="mt-4 text-xl font-bold text-navy">Sawubona! How can I help?</h2>
            <p className="mt-1 text-muted-foreground">Pick a suggestion or type your own question.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {PROMPTS.map((p) => <button key={p} onClick={() => send(p)} className="rounded-full border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent">{p}</button>)}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {msgs.map((m, i) => m.role === "user" ? (
              <div key={i} className="flex justify-end"><p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-navy px-4 py-2.5 text-navy-foreground">{m.content}</p></div>
            ) : (
              <div key={i} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary font-display font-bold text-primary-foreground">M</span>
                <div className="min-w-0 flex-1">
                  <div className="prose prose-sm max-w-none text-foreground [&_p]:my-2 [&_ol]:my-2 [&_ul]:my-2"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  {m.source && <div className="mt-1"><AiSource source={m.source} /></div>}
                </div>
              </div>
            ))}
            {busy && <Thinking />}
            <div ref={end} />
          </div>
        )}
      </div>
      {lastUser && looksLikeEmergency(lastUser.content) && <div className="mt-3"><EmergencyNotice /></div>}
      <form className="mt-3 flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-soft" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
          rows={1} placeholder="Ask MoyaAssist a question…" className="max-h-40 min-h-11 resize-none border-0 text-base shadow-none focus-visible:ring-0" aria-label="Message MoyaAssist" maxLength={4000} />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={!input.trim() || busy} aria-label="Send"><ArrowUp className="h-5 w-5" /></Button>
      </form>
    </div>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SERVICES } from "./data";
import { mockAssistant, mockClassify, mockRecommend, mockReport, mockSimplify, type Classification, type Simplified } from "./ai-mock";

const MODEL = "openai/gpt-6-astra";
const BASE_RULES =
  "You are MoyaAssist, an AI helper inside an independent South African community-support prototype. You are NOT a government official and nothing is officially submitted anywhere. Use simple, plain English. Never invent names, dates, locations, contacts, organisations or events. If something is missing, say it is missing.";

type JsonSchema = { name: string; schema: Record<string, unknown> };

/** Streams a Responses API call server-side and returns the final text. Throws on failure. */
async function callAI(instructions: string, input: { role: "user" | "assistant"; content: string }[], json?: JsonSchema) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      ...(json ? { text: { format: { type: "json_schema", name: json.name, schema: json.schema, strict: true } } } : {}),
    }),
  });
  if (!res.ok || !res.body) throw new Error(`AI error ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const ev = JSON.parse(data);
        if (ev.type === "response.output_text.delta") out += ev.delta;
        if (ev.type === "error" || ev.type === "response.failed") throw new Error("AI stream failed");
      } catch (e) {
        if (e instanceof Error && e.message === "AI stream failed") throw e;
      }
    }
  }
  if (!out.trim()) throw new Error("Empty AI response");
  return out;
}

const obj = (props: Record<string, unknown>) => ({ type: "object", properties: props, required: Object.keys(props), additionalProperties: false });
const str = { type: "string" };
const strArr = { type: "array", items: str };

export const classifyIssue = createServerFn({ method: "POST" })
  .validator(z.object({ description: z.string().min(1).max(4000), area: z.string().max(200).optional() }))
  .handler(async ({ data }): Promise<Classification & { source: "ai" | "demo" }> => {
    try {
      const text = await callAI(
        `${BASE_RULES}\nTask: classify a community issue. Read the description, choose the single best category from: Pothole, Water outage, Water leak, Electricity problem, Streetlight problem, Waste collection problem, Illegal dumping, Damaged public infrastructure, Road problem, Other. Estimate urgency as Low, Medium, High or "Medium/High". affectedArea is the kind of impact (e.g. "Road safety"). extracted lists only facts actually stated. missing lists useful information not provided (location, photo, date observed, whether it is getting worse, etc.). isEmergency is true only if there is immediate danger to life or property.`,
        [{ role: "user", content: `Area: ${data.area || "not given"}\nDescription: ${data.description}` }],
        { name: "classification", schema: obj({ category: str, urgency: str, affectedArea: str, summary: str, extracted: strArr, missing: strArr, isEmergency: { type: "boolean" } }) },
      );
      return { ...(JSON.parse(text) as Classification), source: "ai" };
    } catch (e) {
      console.error("classifyIssue fallback", e);
      return { ...mockClassify(data.description, data.area), source: "demo" };
    }
  });

const reportInput = z.object({
  description: z.string().min(1).max(4000),
  category: z.string().max(100).optional(),
  area: z.string().max(200).optional(),
  address: z.string().max(300).optional(),
  date: z.string().max(40).optional(),
  urgency: z.string().max(20).optional(),
});

export const generateReport = createServerFn({ method: "POST" })
  .validator(reportInput)
  .handler(async ({ data }) => {
    try {
      const text = await callAI(
        `${BASE_RULES}\nTask: turn an informal resident description into a concise, professional community issue report in Markdown. Preserve the user's facts exactly; improve clarity only. Use this structure:\n### Community Issue Report\n**Issue Type:** ...\n**Location:** ...\n**Date Observed:** ...\n**Urgency (resident's view):** ...\n**Description:** ...\n**Potential Impact:** (cautious, general, phrased as "possible")\n**Recommended Action:** (which kind of service authority should look into it)\n**Missing Information:** bullet list\nWrite "Not provided" for any field the user did not supply. Keep it under 200 words.`,
        [{ role: "user", content: JSON.stringify(data) }],
      );
      return { report: text, source: "ai" as const };
    } catch (e) {
      console.error("generateReport fallback", e);
      return { report: mockReport(data), source: "demo" as const };
    }
  });

export const simplifyInformation = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().min(1).max(12000) }))
  .handler(async ({ data }): Promise<Simplified & { source: "ai" | "demo" }> => {
    try {
      const text = await callAI(
        `${BASE_RULES}\nTask: simplify public information for a resident. summary: 1-3 short plain sentences. meaning: key points explained simply. actions: things the reader may need to do (say "No action stated" if none). dates: dates/times exactly as written. contacts: contact details exactly as written (empty list if none). questions: 3 useful questions the resident could ask. Preserve meaning; never add facts; state uncertainty when unclear.`,
        [{ role: "user", content: data.text }],
        { name: "simplified", schema: obj({ summary: str, meaning: strArr, actions: strArr, dates: strArr, contacts: strArr, questions: strArr }) },
      );
      return { ...(JSON.parse(text) as Simplified), source: "ai" };
    } catch (e) {
      console.error("simplify fallback", e);
      return { ...mockSimplify(data.text), source: "demo" };
    }
  });

export const recommendServices = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string().min(1).max(1000) }))
  .handler(async ({ data }) => {
    const valid = new Set(SERVICES.map((s) => s.id));
    try {
      const catalog = SERVICES.map((s) => `${s.id} | ${s.name} | ${s.category} | ${s.area} | ${s.description}`).join("\n");
      const text = await callAI(
        `${BASE_RULES}\nTask: identify the type of help the user needs and recommend services ONLY from this dataset (id | name | category | area | description):\n${catalog}\nReturn need (short label) and matches (id + one-sentence reason). If the user mentions a city, prefer services there but you may include others. Return an empty matches list if nothing fits. Never invent ids.`,
        [{ role: "user", content: data.query }],
        { name: "recommendation", schema: obj({ need: str, matches: { type: "array", items: obj({ id: str, reason: str }) } }) },
      );
      const parsed = JSON.parse(text) as { need: string; matches: { id: string; reason: string }[] };
      return { need: parsed.need, matches: parsed.matches.filter((m) => valid.has(m.id)), source: "ai" as const };
    } catch (e) {
      console.error("recommend fallback", e);
      return { ...mockRecommend(data.query), source: "demo" as const };
    }
  });

export const communityAssistant = createServerFn({ method: "POST" })
  .validator(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) })).min(1).max(40) }))
  .handler(async ({ data }) => {
    try {
      const text = await callAI(
        `${BASE_RULES}\nYou answer general community-support questions for South African residents (reporting problems, understanding notices, writing complaints, finding services). Give short, clear answers with simple steps. Ask for clarification when needed. Explain your limitations. Never claim a report was submitted. If the user describes immediate danger, first say: "This platform is not an emergency service. For immediate danger or emergencies, contact the appropriate emergency service directly." You can point users to the app's pages: Report an Issue, Information Hub ("Understand This"), Community Services, My Reports.`,
        data.messages,
      );
      return { reply: text, source: "ai" as const };
    } catch (e) {
      console.error("assistant fallback", e);
      return { reply: mockAssistant(data.messages[data.messages.length - 1]?.content ?? ""), source: "demo" as const };
    }
  });

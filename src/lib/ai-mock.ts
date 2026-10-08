// Realistic fallback responses used when the AI service is unavailable. Never invent facts.
import { SERVICES, looksLikeEmergency, type Service } from "./data";

export type Classification = {
  category: string;
  urgency: string;
  affectedArea: string;
  summary: string;
  extracted: string[];
  missing: string[];
  isEmergency: boolean;
};

const RULES: [RegExp, string, string][] = [
  [/pothole/i, "Pothole", "Road safety"],
  [/no water|water (is )?off|outage/i, "Water outage", "Water supply"],
  [/leak|burst|pipe/i, "Water leak", "Water supply & infrastructure"],
  [/streetlight|street light|lamp/i, "Streetlight problem", "Public lighting & safety"],
  [/electric|power|outage|cable|transformer/i, "Electricity problem", "Electricity supply"],
  [/dump/i, "Illegal dumping", "Environment & health"],
  [/bin|rubbish|waste|refuse|garbage/i, "Waste collection problem", "Sanitation"],
  [/road|tar|crack/i, "Road problem", "Road safety"],
  [/bridge|sign|bench|park|damaged/i, "Damaged public infrastructure", "Public infrastructure"],
];

export function mockClassify(description: string, area?: string): Classification {
  const rule = RULES.find(([r]) => r.test(description));
  const category = rule?.[1] ?? "Other";
  const high = /school|child|danger|huge|big|days|week|flood|hazard|struggl/i.test(description);
  const extracted: string[] = [];
  const loc = description.match(/(near|by|at|outside|opposite) (the )?[^,.]+/i);
  if (loc) extracted.push(`Location hint: "${loc[0]}"`);
  const dur = description.match(/(\d+|two|three|four|a few|several) (day|week|hour|month)s?/i);
  if (dur) extracted.push(`Duration: "${dur[0]}"`);
  if (area) extracted.push(`Area provided: ${area}`);
  const missing = ["Exact or approximate location", "Photo of the problem", "Date first observed", "Whether the problem is getting worse"].filter(
    (m) => !(m.startsWith("Exact") && (loc || area)) && !(m.startsWith("Date") && dur),
  );
  return {
    category,
    urgency: high ? "High" : "Medium",
    affectedArea: rule?.[2] ?? "General community",
    summary: `${category} reported${loc ? " " + loc[0].toLowerCase() : ""}${high ? ", with a possible safety or service impact" : ""}.`,
    extracted: extracted.length ? extracted : ["Problem description only"],
    missing,
    isEmergency: looksLikeEmergency(description),
  };
}

export function mockReport(input: { description: string; category?: string | undefined; area?: string | undefined; address?: string | undefined; date?: string | undefined; urgency?: string | undefined }) {
  const c = mockClassify(input.description, input.area);
  const type = input.category && input.category !== "Other" ? input.category : c.category;
  const location = [input.address, input.area].filter(Boolean).join(", ") || "Not provided — please add an approximate location";
  return `### Community Issue Report

**Issue Type:** ${type}

**Location:** ${location}

**Date Observed:** ${input.date || "Not provided"}

**Urgency (resident's view):** ${input.urgency || c.urgency}

**Description:**
${input.description.trim().replace(/^./, (s) => s.toUpperCase())}

**Potential Impact:**
${c.affectedArea} may be affected if this is not addressed.

**Recommended Action:**
The relevant service authority should inspect the reported location and take appropriate action.

**Missing Information:**
${c.missing.length ? c.missing.map((m) => `- ${m}`).join("\n") : "- None identified"}

*Generated with offline demo AI — review before using.*`;
}

export type Simplified = {
  summary: string;
  meaning: string[];
  actions: string[];
  dates: string[];
  contacts: string[];
  questions: string[];
};

export function mockSimplify(text: string): Simplified {
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
  const dates = Array.from(new Set(text.match(/\b(\d{1,2}(st|nd|rd|th)? (January|February|March|April|May|June|July|August|September|October|November|December)( \d{4})?|\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[:h]\d{2})\b/gi) ?? []));
  const contacts = Array.from(new Set(text.match(/(\b0\d{2}[\s-]?\d{3}[\s-]?\d{4}\b|[\w.]+@[\w.]+\.\w+|www\.[\w./-]+)/g) ?? []));
  const actions = sentences.filter((s) => /must|should|please|required|ensure|submit|apply|store|avoid/i.test(s)).slice(0, 4);
  return {
    summary: sentences.slice(0, 2).join(" ") || "No text was provided.",
    meaning: sentences.slice(0, 4).map((s) => s.trim()),
    actions: actions.length ? actions : ["No specific action was clearly stated in the text."],
    dates: dates.length ? dates : ["No dates found in the text."],
    contacts: contacts.length ? contacts : ["No contact details found in the text."],
    questions: ["How long will this affect my area?", "Who can I contact if I need help during this period?", "Is there anything I must do before the stated date?"],
  };
}

const NEEDS: [RegExp, string, Service["category"][]][] = [
  [/food|hungry|meal|parcel|groceries/i, "Food support", ["Food support"]],
  [/career|youth|young|bursary|mentor/i, "Youth career support", ["Youth services", "Employment support"]],
  [/job|work|cv|employ|interview/i, "Employment support", ["Employment support"]],
  [/clinic|sick|medic|health|hiv|vaccin/i, "Healthcare", ["Clinics", "Hospitals"]],
  [/legal|lawyer|evict|rights|court/i, "Legal assistance", ["Legal assistance"]],
  [/library|study|internet|print/i, "Study & internet access", ["Libraries"]],
  [/bus|taxi|transport|train/i, "Public transport information", ["Public transport information"]],
  [/school|learner|grade/i, "Schooling", ["Schools"]],
  [/municipal|account|rates|fault/i, "Municipal services", ["Municipal services"]],
  [/elderly|child|vulnerable|ngo|clothing/i, "Community support (NGO)", ["NGOs", "Community centres"]],
];

export function mockRecommend(query: string) {
  const hit = NEEDS.find(([r]) => r.test(query));
  if (!hit) return { need: "Unclear — please describe what help you need", matches: [] as { id: string; reason: string }[] };
  const matches = SERVICES.filter((s) => hit[2].includes(s.category)).map((s) => ({ id: s.id, reason: `Offers ${s.category.toLowerCase()} in ${s.area}.` }));
  return { need: hit[1], matches };
}

export function mockAssistant(last: string) {
  if (looksLikeEmergency(last))
    return "⚠️ **This platform is not an emergency service.** For immediate danger or emergencies, contact the appropriate emergency service directly.";
  if (/pothole|report/i.test(last))
    return "Here's how to report a community problem clearly:\n\n1. **Describe what you see** — e.g. \"large pothole\".\n2. **Give an approximate location** — a suburb or landmark is fine.\n3. **Say when you noticed it** and whether it's getting worse.\n4. **Add a photo** if it is safe to take one.\n\nYou can use the **Report an Issue** page and I'll turn your words into a structured report. Note: MoyaAssist does not submit reports to any municipality.";
  if (/notice|mean|explain/i.test(last))
    return "Paste the notice into **Understand This** (Information Hub) and I'll explain it in plain language, list any dates and actions, and suggest questions to ask. Always check important details against the original notice.";
  if (/complaint|clear/i.test(last))
    return "To make a complaint clearer:\n\n- Stick to **facts**: what, where, when.\n- Mention **how it affects people** (safety, health, access).\n- Say **what you'd like to happen**.\n- Keep it short and polite.\n\nWould you like to tell me the problem so I can help draft it?";
  if (/waste|bin|collection/i.test(last))
    return "If your waste collection was missed:\n\n1. Check whether there was a public holiday or announced schedule change.\n2. Note the date it was missed and your street/area.\n3. Contact your local municipality's service line or ward office to log it.\n4. Keep any reference number you're given.\n\nI can help you write the report on the **Report an Issue** page.";
  if (/service|resource|find|help/i.test(last))
    return "Try the **Community Services** page — tell the AI Service Finder what you need (e.g. \"food support in Cape Town\") and it will recommend entries from our demo directory.";
  return "I can help you report community problems, explain public notices, write clearer complaints, or find community services. What would you like help with? (I'm an AI assistant, not a government official.)";
}

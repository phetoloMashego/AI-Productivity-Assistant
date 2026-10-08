// All data in this file is DEMONSTRATION DATA. Organisations and contacts are fictional.

export const ISSUE_CATEGORIES = [
  "Pothole",
  "Water outage",
  "Water leak",
  "Electricity problem",
  "Streetlight problem",
  "Waste collection problem",
  "Illegal dumping",
  "Damaged public infrastructure",
  "Road problem",
  "Other",
] as const;

export const URGENCY = ["Low", "Medium", "High"] as const;

export const STATUSES = ["Draft", "Ready to Submit", "Submitted", "In Progress", "Resolved"] as const;
export type ReportStatus = (typeof STATUSES)[number];

export const AREAS = ["Cape Town", "Gqeberha", "Johannesburg", "Durban", "Pretoria", "Bloemfontein"];

export const SERVICE_CATEGORIES = [
  "Clinics",
  "Hospitals",
  "Schools",
  "Libraries",
  "Community centres",
  "Food support",
  "Youth services",
  "Employment support",
  "Legal assistance",
  "NGOs",
  "Public transport information",
  "Municipal services",
] as const;

export type Service = {
  id: string;
  name: string;
  category: (typeof SERVICE_CATEGORIES)[number];
  description: string;
  area: string;
  contact: string;
  website?: string;
  hours?: string;
};

export const SERVICES: Service[] = [
  { id: "s1", name: "Ubuntu Community Clinic (Demo)", category: "Clinics", description: "Primary healthcare, immunisations, chronic medication collection and family planning.", area: "Gqeberha", contact: "041 000 0101 (demo)", hours: "Mon–Fri 07:30–16:00" },
  { id: "s2", name: "Riverside Day Hospital (Demo)", category: "Hospitals", description: "Outpatient care, minor procedures and referrals to larger hospitals.", area: "Durban", contact: "031 000 0102 (demo)", hours: "24 hours (emergency unit)" },
  { id: "s3", name: "Khanya Public Library (Demo)", category: "Libraries", description: "Free internet, study spaces, CV printing and children's reading programmes.", area: "Johannesburg", contact: "011 000 0103 (demo)", website: "example.org/khanya-library", hours: "Mon–Sat 09:00–17:00" },
  { id: "s4", name: "Siyakhana Food Garden & Soup Kitchen (Demo)", category: "Food support", description: "Daily cooked meals and weekly food parcels for families in need.", area: "Cape Town", contact: "021 000 0104 (demo)", hours: "Mon–Fri 11:00–14:00" },
  { id: "s5", name: "Thrive Youth Hub (Demo)", category: "Youth services", description: "Career guidance, mentorship, digital skills training and bursary application help for ages 16–30.", area: "Pretoria", contact: "012 000 0105 (demo)", website: "example.org/thrive-youth", hours: "Mon–Fri 09:00–18:00" },
  { id: "s6", name: "Mosaic Community Centre (Demo)", category: "Community centres", description: "Hall bookings, after-school programmes, senior citizens' club and community meetings.", area: "Bloemfontein", contact: "051 000 0106 (demo)", hours: "Daily 08:00–20:00" },
  { id: "s7", name: "WorkReady Employment Desk (Demo)", category: "Employment support", description: "Job listings, CV writing workshops and interview preparation.", area: "Johannesburg", contact: "011 000 0107 (demo)", hours: "Mon–Fri 08:30–16:30" },
  { id: "s8", name: "Justice Access Legal Advice Office (Demo)", category: "Legal assistance", description: "Free basic legal advice on housing, labour disputes and family matters.", area: "Cape Town", contact: "021 000 0108 (demo)", website: "example.org/justice-access", hours: "Tue & Thu 09:00–15:00" },
  { id: "s9", name: "Hope Hands NGO (Demo)", category: "NGOs", description: "Support for vulnerable children, elderly home visits and clothing drives.", area: "Durban", contact: "031 000 0109 (demo)", hours: "Mon–Fri 08:00–16:00" },
  { id: "s10", name: "Metro Commuter Info Point (Demo)", category: "Public transport information", description: "Bus and taxi route information, timetables and accessibility guidance.", area: "Cape Town", contact: "021 000 0110 (demo)", hours: "Mon–Sat 06:00–19:00" },
  { id: "s11", name: "Ward Services Walk-in Office (Demo)", category: "Municipal services", description: "Help with service account queries, reporting faults and general municipal enquiries.", area: "Pretoria", contact: "012 000 0111 (demo)", hours: "Mon–Fri 08:00–15:30" },
  { id: "s12", name: "Lerato Primary School (Demo)", category: "Schools", description: "Public primary school, Grades R–7, with feeding scheme and aftercare.", area: "Bloemfontein", contact: "051 000 0112 (demo)", hours: "Mon–Fri 07:30–14:30" },
  { id: "s13", name: "Ikhaya Food Bank (Demo)", category: "Food support", description: "Monthly grocery hampers for registered households and emergency food packs.", area: "Johannesburg", contact: "011 000 0113 (demo)", hours: "Wed & Sat 09:00–13:00" },
  { id: "s14", name: "Future Makers Skills Centre (Demo)", category: "Youth services", description: "Learnerships, coding classes, and career counselling for school leavers.", area: "Gqeberha", contact: "041 000 0114 (demo)", hours: "Mon–Fri 09:00–17:00" },
  { id: "s15", name: "Seaside Mobile Clinic (Demo)", category: "Clinics", description: "Weekly mobile clinic visits offering screening, HIV testing and child health checks.", area: "Durban", contact: "031 000 0115 (demo)", hours: "Thursdays 09:00–14:00" },
  { id: "s16", name: "Bright Paths Job Club (Demo)", category: "Employment support", description: "Weekly job-seeker meetups, printing and free access to job portals.", area: "Gqeberha", contact: "041 000 0116 (demo)", hours: "Mondays 10:00–13:00" },
];

export type Report = {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  area: string;
  address?: string;
  urgency: string;
  description: string;
  report: string;
  createdAt: string;
  demo?: boolean;
  reference?: string;
  history?: { status: ReportStatus; at: string; note?: string }[];
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const DEMO_REPORTS: Report[] = [
  { id: "d1", title: "Pothole near school", category: "Road", status: "Draft", area: "Gqeberha", urgency: "High", description: "Huge pothole near the school entrance, cars struggle to drive around it.", report: "### Community Issue Report\n\n**Issue Type:** Pothole\n\n**Location:** Near the school entrance, Gqeberha\n\n**Description:** A large pothole near a school entrance is forcing vehicles to swerve.\n\n**Potential Impact:** Road safety risk for learners and drivers.", createdAt: daysAgo(0), demo: true },
  { id: "d2", title: "Water leak near shops", category: "Water", status: "Submitted", area: "Cape Town", urgency: "Medium", description: "Big water leak by the shops, running for two days.", report: "### Community Issue Report\n\n**Issue Type:** Water Leak\n\n**Location:** Near local shops, Cape Town\n\n**Description:** A water leak has reportedly been running for approximately two days.", createdAt: daysAgo(2), demo: true },
  { id: "d3", title: "Missed waste collection", category: "Waste", status: "Resolved", area: "Johannesburg", urgency: "Low", description: "Bins were not collected on Tuesday.", report: "### Community Issue Report\n\n**Issue Type:** Waste collection problem\n\n**Location:** Johannesburg\n\n**Description:** Scheduled waste collection was reportedly missed.", createdAt: daysAgo(7), demo: true },
  { id: "d4", title: "Broken streetlights on main road", category: "Electricity", status: "In Progress", area: "Durban", urgency: "Medium", description: "Three streetlights out for a week.", report: "### Community Issue Report\n\n**Issue Type:** Streetlight problem\n\n**Location:** Main road, Durban\n\n**Description:** Three streetlights reportedly not working for about a week.", createdAt: daysAgo(4), demo: true },
  { id: "d5", title: "Illegal dumping at open field", category: "Waste", status: "Ready to Submit", area: "Pretoria", urgency: "Medium", description: "Rubble and rubbish dumped at the open field.", report: "### Community Issue Report\n\n**Issue Type:** Illegal dumping\n\n**Location:** Open field, Pretoria\n\n**Description:** Building rubble and household waste dumped at an open field.", createdAt: daysAgo(3), demo: true },
];

export const IMPACT_STATS = { reported: 248, resolved: 173, active: 75, members: 1240 };

export const ISSUES_BY_CATEGORY = [
  { name: "Potholes", value: 64 },
  { name: "Water leaks", value: 52 },
  { name: "Waste", value: 41 },
  { name: "Streetlights", value: 38 },
  { name: "Dumping", value: 29 },
  { name: "Roads", value: 24 },
];

export const ISSUES_OVER_TIME = [
  { month: "May", reported: 28, resolved: 17 },
  { month: "Jun", reported: 35, resolved: 24 },
  { month: "Jul", reported: 41, resolved: 30 },
  { month: "Aug", reported: 46, resolved: 33 },
  { month: "Sep", reported: 52, resolved: 38 },
  { month: "Oct", reported: 46, resolved: 31 },
];

export const RESOLUTION_STATUS = [
  { name: "Resolved", value: 173 },
  { name: "In Progress", value: 41 },
  { name: "Submitted", value: 22 },
  { name: "Draft", value: 12 },
];

const EMERGENCY_WORDS = ["fire", "burning", "bleeding", "unconscious", "not breathing", "gun", "shooting", "stabbed", "attack", "live wire", "electrocut", "drowning", "trapped", "hijack", "explosion", "gas leak", "emergency", "dying", "robbery"];
export function looksLikeEmergency(text: string) {
  const t = text.toLowerCase();
  return EMERGENCY_WORDS.some((w) => t.includes(w));
}

// DEMO municipal contacts — fictional numbers, for prototype display only.
export type MunicipalContact = { department: string; municipality: string; phone: string; email: string; hours: string };
const MUNI: Record<string, string> = {
  "Cape Town": "City of Cape Town (demo)", Gqeberha: "Nelson Mandela Bay (demo)", Johannesburg: "City of Johannesburg (demo)",
  Durban: "eThekwini (demo)", Pretoria: "City of Tshwane (demo)", Bloemfontein: "Mangaung (demo)",
};
export function deptFor(category: string) {
  const c = category.toLowerCase();
  if (/water/.test(c)) return "Water & Sanitation";
  if (/electric|streetlight/.test(c)) return "Electricity Services";
  if (/waste|dump/.test(c)) return "Solid Waste Management";
  if (/road|pothole/.test(c)) return "Roads & Stormwater";
  return "General Service Desk";
}
export function contactFor(category: string, area: string): MunicipalContact {
  const city = AREAS.find((a) => area.toLowerCase().includes(a.toLowerCase()));
  const dept = deptFor(category);
  return {
    department: dept,
    municipality: (city && MUNI[city]) || "Your local municipality",
    phone: "0800 000 000 (demo)",
    email: `${(dept.split(" ")[0] ?? "info").toLowerCase()}@example.org (demo)`,
    hours: "Mon–Fri 07:30–16:00 (demo)",
  };
}
export type StatusEvent = { status: ReportStatus; at: string; note?: string };

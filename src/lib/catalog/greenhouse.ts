import { safeHttpsUrl } from "../sanitize.ts";
import type { Benefit, Chain, Department, LocationMode, RemoteRegion, Role, Scene, Seniority, Tag } from "./types";

export type GreenhouseJob = {
  id: number | string;
  title: string;
  absolute_url?: string;
  updated_at?: string;
  first_published?: string;
  content?: string;
  location?: { name?: string } | null;
  departments?: { name?: string }[] | null;
  metadata?: { name?: string; value?: string | null }[] | null;
};

const CHAINS: Chain[] = ["bitcoin", "ethereum", "solana", "base", "multi-chain"];
const SCENES: Scene[] = ["crypto"];
const BENEFITS: Benefit[] = ["remote-first", "healthcare", "visa-sponsorship", "parental-leave", "unlimited-pto"];

export const COINBASE_APPLY_HOSTS = new Set(["www.coinbase.com", "coinbase.com"]);

export function metaValue(job: GreenhouseJob, name: string): string | undefined {
  const hit = job.metadata?.find((m) => m.name === name && m.value);
  return hit?.value ?? undefined;
}

export function departmentOf(label: string, title = ""): Department {
  const s = `${label} ${title}`.toLowerCase();
  if (/\bdesign\b/.test(s)) return "design";
  if (/\bproduct\b/.test(s)) return "product";
  if (/\bmarket|communication|policy\b/.test(s)) return "marketing";
  if (/\bsales|trading|prime|partnership|business development\b/.test(s)) return "sales";
  if (/\bfinance|accounting|treasury|controller\b/.test(s)) return "finance";
  if (/\bsecurity\b/.test(s)) return "engineering";
  if (/\blegal|counsel|compliance|aml|risk|fraud|privacy|audit\b/.test(s)) return "legal";
  if (/\bdata science|research|quant\b/.test(s)) return "research";
  if (/\bengineer|infrastructure|backend|frontend|machine learning|data engineering\b/.test(s)) return "engineering";
  if (/\b(customer|people|recruit|hr|it|enterprise|operations|program|support|concierge)\b/.test(s)) return "operations";
  return "other";
}

export function seniorityOf(title: string): Seniority {
  const t = title.toLowerCase();
  if (/\bintern\b/.test(t)) return "intern";
  if (/\b(chief of staff|chief |cfo|cto|ceo|ciso|vp\b|vice president)\b/.test(t)) return "c-level";
  if (/\b(director|head of|country director)\b/.test(t)) return "director";
  if (/\b(staff|principal)\b/.test(t)) return "staff";
  if (/\b(manager|lead|supervisor|head)\b/.test(t)) return "lead";
  if (/\bsenior\b|\bsr[\s.]/.test(t)) return "senior";
  if (/\bjunior\b/.test(t)) return "junior";
  if (/\b(associate|analyst|specialist)\b/.test(t)) return "mid";
  return "mid";
}

export function parseLocation(name: string | undefined): {
  locationMode: LocationMode;
  locations: string[];
  remoteRegion?: RemoteRegion;
} {
  const raw = (name ?? "").trim();
  const lower = raw.toLowerCase();
  const remote = lower.startsWith("remote");
  const hybrid = lower.startsWith("hybrid");
  const region = regionFrom(lower);
  if (remote) return { locationMode: "remote", locations: raw ? [raw] : [], remoteRegion: region };
  if (hybrid) return { locationMode: "hybrid", locations: cityFrom(raw), remoteRegion: region };
  return { locationMode: "on-site", locations: cityFrom(raw), remoteRegion: region };
}

function regionFrom(lower: string): RemoteRegion | undefined {
  if (/\b(usa|united states|canada|north america)\b/.test(lower) || /,\s*(ny|nc|ca|tx|sf)\b/.test(lower) || lower.includes("new york") || lower.includes("charlotte")) return "us";
  if (/\b(uk|united kingdom|ireland|europe|emea|cyprus|luxembourg|london|dublin)\b/.test(lower)) return "eu";
  if (/\b(india|singapore|hyderabad|bangalore|bengaluru|manila|philippines|uae|abu dhabi|israel|apac)\b/.test(lower)) return "apac";
  if (/\b(brazil|latam|mexico|argentina)\b/.test(lower)) return "latam";
  if (/\b(nigeria|kenya|africa|lagos|nairobi)\b/.test(lower)) return "africa";
  if (lower.startsWith("remote")) return "global";
  return undefined;
}

function cityFrom(raw: string): string[] {
  const cleaned = raw.replace(/^hybrid\s*[-–]\s*/i, "").trim();
  return cleaned ? [cleaned] : [];
}

export function tagsOf(title: string, department: Department): Tag[] {
  const t = title.toLowerCase();
  const tags: Tag[] = ["crypto", "blockchain"];
  const hits: [RegExp, Tag][] = [
    [/\bsolidity\b/, "solidity"],
    [/\bsolana\b/, "solana"],
    [/\bbitcoin\b/, "bitcoin"],
    [/\bstablecoin/, "payments"],
    [/\bsecurity\b/, "security"],
    [/\bfrontend|front-end|front end\b/, "frontend"],
    [/\bbackend|back-end|back end\b/, "backend"],
    [/\bfull.?stack\b/, "fullstack"],
    [/\breact\b/, "react"],
    [/\bpython\b/, "python"],
    [/\brust\b/, "rust"],
    [/\bgolang|go engineer\b/, "golang"],
    [/\bdevops|sre|infrastructure\b/, "devops"],
    [/\bmobile\b/, "mobile"],
    [/\bdata\b/, "data-science"],
    [/\bproduct\b/, "product"],
    [/\bdesign\b/, "design"],
    [/\blegal|counsel\b/, "legal"],
    [/\bcompliance\b/, "compliance"],
    [/\bsales\b/, "sales"],
    [/\bwallet\b/, "wallet"],
    [/\bexchange\b/, "exchange"],
    [/\bcustody\b/, "custody"],
  ];
  for (const [re, tag] of hits) if (re.test(t) && !tags.includes(tag)) tags.push(tag);
  if (department === "engineering" && !tags.includes("backend") && !tags.includes("frontend")) tags.push("blockchain");
  return tags.slice(0, 8);
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

export function htmlToMarkdown(html: string): string {
  let s = decodeEntities(html);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<h1[^>]*>/gi, "\n## ").replace(/<\/h1>/gi, "\n");
  s = s.replace(/<h2[^>]*>/gi, "\n## ").replace(/<\/h2>/gi, "\n");
  s = s.replace(/<h3[^>]*>/gi, "\n### ").replace(/<\/h3>/gi, "\n");
  s = s.replace(/<li[^>]*>/gi, "\n- ").replace(/<\/li>/gi, "");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<p[^>]*>/gi, "\n\n").replace(/<\/p>/gi, "\n");
  s = s.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, text: string) => {
    const label = text.replace(/<[^>]+>/g, "").trim() || href;
    const safe = safeHttpsUrl(href);
    return safe ? `[${label}](${safe})` : label;
  });
  s = s.replace(/<[^>]+>/g, "");
  s = decodeEntities(s);
  s = s.replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (s.length > 20_000) s = s.slice(0, 20_000);
  return s;
}

export function applyUrlOf(absolute: string | undefined): string | undefined {
  const href = absolute ? safeHttpsUrl(absolute) : null;
  if (!href) return undefined;
  try {
    if (COINBASE_APPLY_HOSTS.has(new URL(href).hostname)) return href;
  } catch {
    /* invalid */
  }
  return undefined;
}

export function coinbaseSlug(id: number | string): string {
  return `coinbase-${id}`;
}

export function parseCoinbaseSlug(slug: string): string | undefined {
  const m = /^coinbase-(\d{4,12})$/.exec(slug);
  return m?.[1];
}

export function mapGreenhouseJob(job: GreenhouseJob): Role {
  const title = job.title?.trim() || "Coinbase role";
  const deptLabel = metaValue(job, "Careersite Department (for job postings)") || job.departments?.[0]?.name || metaValue(job, "Team") || "";
  const department = departmentOf(deptLabel, title);
  const loc = parseLocation(job.location?.name);
  const id = coinbaseSlug(job.id);
  const applyUrl = applyUrlOf(job.absolute_url);
  const published = job.first_published || job.updated_at || new Date().toISOString();
  const intern = seniorityOf(title) === "intern";
  const md = job.content
    ? htmlToMarkdown(job.content)
    : `## ${title}\n\nLive listing from Coinbase careers${job.location?.name ? ` · ${job.location.name}` : ""}. Application is on Coinbase — Lattice does not collect a resume for this role.`;
  return {
    id,
    slug: id,
    companyId: "coinbase",
    title,
    department,
    seniority: seniorityOf(title),
    type: intern ? "internship" : "full-time",
    locationMode: loc.locationMode,
    locations: loc.locations,
    remoteRegion: loc.remoteRegion,
    chains: CHAINS,
    scenes: SCENES,
    tags: tagsOf(title, department),
    descriptionMarkdown: md,
    responsibilities: [],
    requirements: [],
    applyUrl,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    benefits: BENEFITS,
    featured: false,
    publishedAt: new Date(published).toISOString(),
    screeningQuestions: [],
    status: "open",
    source: "ats",
  };
}

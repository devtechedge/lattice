import { safeHttpsUrl } from "../sanitize.ts";
import type { Benefit, Chain, Department, LocationMode, RemoteRegion, Role, RoleType, Scene, Seniority, Tag } from "./types";
import { ATS_APPLY_HOSTS, type LiveBoard } from "./boards.ts";

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

export type LeverJob = {
  id: string;
  text?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  description?: string;
  descriptionPlain?: string;
  lists?: { text?: string; content?: string }[];
  categories?: { location?: string; department?: string; team?: string; commitment?: string; allLocations?: string[] };
  workplaceType?: string;
};

export type AshbyJob = {
  id: string;
  title?: string;
  jobUrl?: string;
  applyUrl?: string;
  department?: string;
  team?: string;
  location?: string;
  isRemote?: boolean;
  workplaceType?: string;
  employmentType?: string;
  publishedAt?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  isListed?: boolean;
  compensation?: { compensationTierSummary?: string; scrapeableCompensationSalarySummary?: string } | null;
};

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
  if (!raw || lower === "anywhere" || lower === "global") {
    return { locationMode: "remote", locations: raw ? [raw] : [], remoteRegion: "global" };
  }
  const remote = lower.startsWith("remote") || lower === "remote-us" || lower === "remote-usa";
  const hybrid = lower.startsWith("hybrid");
  const region = regionFrom(lower);
  if (remote) return { locationMode: "remote", locations: raw ? [raw] : [], remoteRegion: region };
  if (hybrid) return { locationMode: "hybrid", locations: cityFrom(raw), remoteRegion: region };
  return { locationMode: "on-site", locations: cityFrom(raw), remoteRegion: region };
}

function regionFrom(lower: string): RemoteRegion | undefined {
  if (/\b(usa|united states|canada|north america)\b/.test(lower) || /,\s*(ny|nc|ca|tx|sf)\b/.test(lower) || lower.includes("new york") || lower.includes("charlotte") || lower.includes("san francisco")) return "us";
  if (/\b(uk|united kingdom|ireland|europe|emea|cyprus|luxembourg|london|dublin|paris|berlin|amsterdam)\b/.test(lower)) return "eu";
  if (/\b(india|singapore|hyderabad|bangalore|bengaluru|manila|philippines|uae|abu dhabi|israel|apac|hong kong|taiwan|korea|japan|dubai)\b/.test(lower)) return "apac";
  if (/\b(brazil|latam|mexico|argentina|chile)\b/.test(lower)) return "latam";
  if (/\b(nigeria|kenya|africa|lagos|nairobi)\b/.test(lower)) return "africa";
  if (lower.startsWith("remote") || lower === "anywhere") return "global";
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

export function applyUrlOf(absolute: string | undefined, extraHosts: Iterable<string> = []): string | undefined {
  const href = absolute ? safeHttpsUrl(absolute) : null;
  if (!href) return undefined;
  try {
    const host = new URL(href).hostname;
    if (ATS_APPLY_HOSTS.has(host)) return href;
    for (const h of extraHosts) if (h === host) return href;
  } catch {
    /* invalid */
  }
  return undefined;
}

export function liveSlug(companyId: string, jobId: number | string): string {
  return `${companyId}-${jobId}`;
}

export function parseLiveSlug(slug: string, companyIds: string[]): { companyId: string; jobId: string } | undefined {
  const ids = [...companyIds].sort((a, b) => b.length - a.length);
  for (const id of ids) {
    const prefix = `${id}-`;
    if (!slug.startsWith(prefix)) continue;
    const jobId = slug.slice(prefix.length);
    if (/^[A-Za-z0-9._-]{4,80}$/.test(jobId)) return { companyId: id, jobId };
  }
  return undefined;
}

function publishedIso(raw: string | number | undefined): string {
  if (typeof raw === "number") {
    const ms = raw > 1e12 ? raw : raw * 1000;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  if (typeof raw === "string" && raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

function roleTypeOf(title: string, commitment?: string): RoleType {
  const s = `${title} ${commitment ?? ""}`.toLowerCase();
  if (/\bintern/.test(s)) return "internship";
  if (/\bpart[- ]?time\b/.test(s)) return "part-time";
  if (/\bcontract|contractor|fixed term\b/.test(s)) return "contract";
  return "full-time";
}

function locationModeOf(workplace: string | undefined, loc: ReturnType<typeof parseLocation>): LocationMode {
  const w = (workplace ?? "").toLowerCase();
  if (w.includes("remote") || loc.locationMode === "remote") return "remote";
  if (w.includes("hybrid") || loc.locationMode === "hybrid") return "hybrid";
  return loc.locationMode;
}

function stubMd(board: LiveBoard, title: string, where?: string): string {
  return `## ${title}\n\nLive listing from ${board.name}${where ? ` · ${where}` : ""}. Application is on ${board.name} — Lattice does not collect a resume for this role.`;
}

function baseRole(board: LiveBoard, jobId: string, title: string, opts: {
  department: Department;
  loc: ReturnType<typeof parseLocation>;
  locationMode: LocationMode;
  type: RoleType;
  applyUrl?: string;
  publishedAt: string;
  md: string;
}): Role {
  const intern = opts.type === "internship";
  return {
    id: liveSlug(board.id, jobId),
    slug: liveSlug(board.id, jobId),
    companyId: board.id,
    title,
    department: opts.department,
    seniority: intern ? "intern" : seniorityOf(title),
    type: opts.type,
    locationMode: opts.locationMode,
    locations: opts.loc.locations,
    remoteRegion: opts.loc.remoteRegion,
    chains: board.chains,
    scenes: board.scenes,
    tags: tagsOf(title, opts.department),
    descriptionMarkdown: opts.md,
    responsibilities: [],
    requirements: [],
    applyUrl: opts.applyUrl,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    benefits: board.benefits,
    featured: false,
    publishedAt: opts.publishedAt,
    screeningQuestions: [],
    status: "open",
    source: "ats",
  };
}

export function mapGreenhouseJob(job: GreenhouseJob, board: LiveBoard): Role {
  const title = job.title?.trim() || `${board.name} role`;
  const deptLabel = metaValue(job, "Careersite Department (for job postings)") || job.departments?.[0]?.name || metaValue(job, "Team") || "";
  const department = departmentOf(deptLabel, title);
  const loc = parseLocation(job.location?.name);
  const md = job.content ? htmlToMarkdown(job.content) : stubMd(board, title, job.location?.name);
  return baseRole(board, String(job.id), title, {
    department,
    loc,
    locationMode: loc.locationMode,
    type: roleTypeOf(title),
    applyUrl: applyUrlOf(job.absolute_url, board.applyHosts),
    publishedAt: publishedIso(job.first_published || job.updated_at),
    md,
  });
}

export function mapLeverJob(job: LeverJob, board: LiveBoard): Role {
  const title = job.text?.trim() || `${board.name} role`;
  const cat = job.categories ?? {};
  const department = departmentOf(`${cat.department ?? ""} ${cat.team ?? ""}`, title);
  const locName = cat.allLocations?.[0] || cat.location;
  const loc = parseLocation(locName);
  const parts = [
    job.description ? htmlToMarkdown(job.description) : "",
    ...(job.lists ?? []).map((l) => {
      const head = l.text ? `## ${l.text}\n` : "";
      const body = l.content ? htmlToMarkdown(l.content) : "";
      return `${head}${body}`.trim();
    }),
  ].filter(Boolean);
  const md = parts.join("\n\n") || stubMd(board, title, locName);
  return baseRole(board, job.id, title, {
    department,
    loc,
    locationMode: locationModeOf(job.workplaceType, loc),
    type: roleTypeOf(title, cat.commitment),
    applyUrl: applyUrlOf(job.hostedUrl || job.applyUrl, board.applyHosts),
    publishedAt: publishedIso(job.createdAt),
    md,
  });
}

export function mapAshbyJob(job: AshbyJob, board: LiveBoard): Role | null {
  if (job.isListed === false) return null;
  const title = job.title?.trim() || `${board.name} role`;
  const department = departmentOf(`${job.department ?? ""} ${job.team ?? ""}`, title);
  const loc = parseLocation(job.location);
  const emp = (job.employmentType ?? "").toLowerCase();
  const type: RoleType = emp.includes("intern") ? "internship" : emp.includes("part") ? "part-time" : emp.includes("contract") ? "contract" : "full-time";
  const md = job.descriptionHtml ? htmlToMarkdown(job.descriptionHtml) : stubMd(board, title, job.location);
  const workplace = job.isRemote ? "remote" : job.workplaceType;
  return baseRole(board, job.id, title, {
    department,
    loc,
    locationMode: locationModeOf(workplace, loc),
    type,
    applyUrl: applyUrlOf(job.jobUrl || job.applyUrl, board.applyHosts),
    publishedAt: publishedIso(job.publishedAt),
    md,
  });
}

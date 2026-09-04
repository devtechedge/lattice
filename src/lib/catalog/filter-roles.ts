import type { Role, RoleFilters, Company } from "./types";
import { COMPANIES } from "./data.ts";

const companyMap = new Map(COMPANIES.map((c) => [c.id, c]));

export function companyOf(role: Role): Company | undefined {
  return companyMap.get(role.companyId);
}

export function matches(role: Role, f: RoleFilters, company = companyOf(role)): boolean {
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = `${role.title} ${company?.name ?? ""} ${role.tags.join(" ")} ${role.descriptionMarkdown}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.department?.length && !f.department.includes(role.department)) return false;
  if (f.seniority?.length && !f.seniority.includes(role.seniority)) return false;
  if (f.type?.length && !f.type.includes(role.type)) return false;
  if (f.locationMode?.length && !f.locationMode.includes(role.locationMode)) return false;
  if (f.remoteRegion?.length && (!role.remoteRegion || !f.remoteRegion.includes(role.remoteRegion))) return false;
  if (f.city?.length && !role.locations.some((l) => f.city!.includes(l))) return false;
  if (f.chain?.length && !role.chains.some((c) => f.chain!.includes(c))) return false;
  if (f.scene?.length && !role.scenes.some((s) => f.scene!.includes(s))) return false;
  if (f.tag?.length && !role.tags.some((t) => f.tag!.includes(t))) return false;
  if (f.benefit?.length && !role.benefits.some((b) => f.benefit!.includes(b))) return false;
  if (f.payInCrypto && !role.tags.includes("pay-in-crypto") && !role.benefits.includes("pay-in-crypto")) return false;
  if (f.salaryDisclosed && (role.salaryMin == null || role.salaryMax == null)) return false;
  if (f.salaryMin != null && (role.salaryMax == null || role.salaryMax < f.salaryMin)) return false;
  if (f.companySize?.length && (!company || !f.companySize.includes(company.size))) return false;
  if (f.featured && !role.featured) return false;
  if (f.visa && !role.benefits.includes("visa-sponsorship")) return false;
  if (f.postedWithin) {
    const hours = f.postedWithin === "24h" ? 24 : f.postedWithin === "7d" ? 24 * 7 : 24 * 30;
    if (Date.now() - new Date(role.publishedAt).getTime() > hours * 3600000) return false;
  }
  return true;
}

export function sortRoles(roles: Role[], sort: RoleFilters["sort"] = "newest"): Role[] {
  const copy = [...roles];
  switch (sort) {
    case "featured":
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || +new Date(b.publishedAt) - +new Date(a.publishedAt));
    case "salary-desc":
      return copy.sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0));
    case "salary-asc":
      return copy.sort((a, b) => (a.salaryMin ?? 9e9) - (b.salaryMin ?? 9e9));
    case "company":
      return copy.sort((a, b) => (companyOf(a)?.name ?? "").localeCompare(companyOf(b)?.name ?? ""));
    default:
      return copy.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }
}

export function applyRoleFilters(roles: Role[], f: RoleFilters): Role[] {
  return sortRoles(roles.filter((r) => matches(r, f)), f.sort);
}

export function parseList(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string" && v) {
    if (v.startsWith("[")) {
      try {
        const parsed = JSON.parse(v) as unknown;
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {
        /* not json */
      }
    }
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return undefined;
}

export function parseRoleSearch(s: Record<string, unknown>): RoleFilters {
  const bool = (k: string) => (s[k] === true || s[k] === "1" || s[k] === "true" ? true : undefined);
  const num = (k: string) => {
    const n = Number(s[k]);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    q: typeof s.q === "string" ? s.q : undefined,
    department: parseList(s.department) as RoleFilters["department"],
    seniority: parseList(s.seniority) as RoleFilters["seniority"],
    type: parseList(s.type) as RoleFilters["type"],
    locationMode: parseList(s.locationMode) as RoleFilters["locationMode"],
    remoteRegion: parseList(s.remoteRegion) as RoleFilters["remoteRegion"],
    city: parseList(s.city),
    chain: parseList(s.chain) as RoleFilters["chain"],
    scene: parseList(s.scene) as RoleFilters["scene"],
    tag: parseList(s.tag) as RoleFilters["tag"],
    benefit: parseList(s.benefit) as RoleFilters["benefit"],
    payInCrypto: bool("payInCrypto"),
    salaryDisclosed: bool("salaryDisclosed"),
    salaryMin: num("salaryMin"),
    companySize: parseList(s.companySize) as RoleFilters["companySize"],
    postedWithin: s.postedWithin === "24h" || s.postedWithin === "7d" || s.postedWithin === "30d" ? s.postedWithin : undefined,
    featured: bool("featured"),
    visa: bool("visa"),
    sort: ["newest", "featured", "salary-desc", "salary-asc", "company"].includes(String(s.sort))
      ? (s.sort as RoleFilters["sort"])
      : "newest",
    view: s.view === "table" || s.view === "cards" ? s.view : undefined,
  };
}

export function toSearch(f: RoleFilters): Record<string, string | undefined> {
  const join = (a?: string[]) => (a && a.length ? a.join(",") : undefined);
  return {
    q: f.q || undefined,
    department: join(f.department),
    seniority: join(f.seniority),
    type: join(f.type),
    locationMode: join(f.locationMode),
    remoteRegion: join(f.remoteRegion),
    city: join(f.city),
    chain: join(f.chain),
    scene: join(f.scene),
    tag: join(f.tag),
    benefit: join(f.benefit),
    payInCrypto: f.payInCrypto ? "1" : undefined,
    salaryDisclosed: f.salaryDisclosed ? "1" : undefined,
    salaryMin: f.salaryMin != null ? String(f.salaryMin) : undefined,
    companySize: join(f.companySize),
    postedWithin: f.postedWithin,
    featured: f.featured ? "1" : undefined,
    visa: f.visa ? "1" : undefined,
    sort: f.sort && f.sort !== "newest" ? f.sort : undefined,
    view: f.view,
  };
}

export function searchRecord(s: Record<string, unknown>): Record<string, string> {
  const cleaned = toSearch(parseRoleSearch(s));
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(cleaned)) {
    if (v) out[k] = v;
  }
  return out;
}

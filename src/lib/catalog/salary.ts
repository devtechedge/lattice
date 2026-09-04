import type { Seniority } from "./types";

export const ROLE_KEYS = [
  "solidity",
  "protocol",
  "backend",
  "frontend",
  "fullstack",
  "security",
  "zk",
  "devops",
  "mobile",
  "product",
  "design",
  "devrel",
  "community",
  "marketing",
  "sales",
  "quant",
  "research",
  "legal",
] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const ROLE_KEY_LABEL: Record<RoleKey, string> = {
  solidity: "Solidity engineer",
  protocol: "Protocol engineer",
  backend: "Backend engineer",
  frontend: "Frontend engineer",
  fullstack: "Full-stack engineer",
  security: "Security engineer",
  zk: "ZK / cryptography",
  devops: "DevOps / SRE",
  mobile: "Mobile engineer",
  product: "Product manager",
  design: "Designer",
  devrel: "DevRel",
  community: "Community",
  marketing: "Marketing",
  sales: "Sales",
  quant: "Quantitative",
  research: "Researcher",
  legal: "Legal / compliance",
};

export const REGIONS = ["North America", "Europe", "Asia", "Oceania", "LatAm", "Africa"] as const;
export type Region = (typeof REGIONS)[number];

const BASE_AVG: Record<RoleKey, number> = {
  solidity: 145000,
  protocol: 160000,
  backend: 135000,
  frontend: 125000,
  fullstack: 130000,
  security: 165000,
  zk: 175000,
  devops: 140000,
  mobile: 128000,
  product: 150000,
  design: 118000,
  devrel: 120000,
  community: 85000,
  marketing: 105000,
  sales: 130000,
  quant: 200000,
  research: 155000,
  legal: 150000,
};

const SENIORITY_M: Record<Seniority, number> = {
  intern: 0.35,
  junior: 0.62,
  mid: 0.9,
  senior: 1.15,
  staff: 1.35,
  lead: 1.38,
  director: 1.45,
  "c-level": 1.55,
};

const REGION_M: Record<Region, number> = {
  "North America": 1.18,
  Europe: 0.92,
  Asia: 0.72,
  Oceania: 1.02,
  LatAm: 0.58,
  Africa: 0.52,
};

export type SalaryRow = {
  roleKey: RoleKey;
  seniority: Seniority;
  region: Region;
  language?: string;
  year: number;
  avg: number;
  min: number;
  max: number;
  n: number;
};

function row(roleKey: RoleKey, seniority: Seniority, region: Region, year: number, language?: string): SalaryRow {
  const cycle = year <= 2021 ? 1.15 : year === 2022 ? 0.92 : year === 2023 ? 0.84 : year === 2024 ? 0.95 : year === 2025 ? 1.05 : 0.98;
  const avg = Math.round((BASE_AVG[roleKey] * SENIORITY_M[seniority] * REGION_M[region] * cycle) / 1000) * 1000;
  return {
    roleKey,
    seniority,
    region,
    language,
    year,
    avg,
    min: Math.round((avg * 0.72) / 1000) * 1000,
    max: Math.round((avg * 1.45) / 1000) * 1000,
    n: 12 + ((roleKey.length + seniority.length + year) % 40),
  };
}

export function salaryMatrix(year = 2026): SalaryRow[] {
  const seniorities: Seniority[] = ["junior", "mid", "senior", "staff"];
  const out: SalaryRow[] = [];
  for (const role of ROLE_KEYS) {
    for (const sen of seniorities) {
      for (const region of REGIONS) {
        out.push(row(role, sen, region, year));
      }
    }
  }
  return out;
}

export function seriesFor(roleKey: RoleKey, seniority: Seniority = "senior", region: Region = "North America"): SalaryRow[] {
  return [2021, 2022, 2023, 2024, 2025, 2026].map((y) => row(roleKey, seniority, region, y));
}

export type CompInput = {
  cash: number;
  tokenAllocation: number;
  impliedPrice: number;
  vestingMonths: number;
  cliffMonths: number;
  equityPct: number;
  companyMark: number;
};

export type CompResult = {
  year1Token: number;
  fullToken: number;
  equityValue: number;
  year1Total: number;
  fullyDiluted: number;
  vestedMonthsYear1: number;
};

export function calcComp(i: CompInput): CompResult {
  const vest = Math.max(1, i.vestingMonths);
  const cliff = Math.max(0, i.cliffMonths);
  const fullToken = i.tokenAllocation * i.impliedPrice;
  const vestedMonthsYear1 = 12 <= cliff ? 0 : Math.min(12, vest) - Math.min(12, cliff);
  const year1Token = fullToken * (vestedMonthsYear1 / vest);
  const equityValue = (i.equityPct / 100) * i.companyMark;
  return {
    year1Token,
    fullToken,
    equityValue,
    year1Total: i.cash + year1Token,
    fullyDiluted: i.cash + fullToken + equityValue,
    vestedMonthsYear1,
  };
}

export function estimateSalary(args: {
  department: string;
  seniority: Seniority;
  remoteRegion?: string;
}): { min: number; max: number; avg: number } {
  const map: Record<string, RoleKey> = {
    engineering: "solidity",
    design: "design",
    product: "product",
    marketing: "marketing",
    sales: "sales",
    finance: "legal",
    operations: "community",
    research: "research",
    legal: "legal",
    community: "community",
    other: "fullstack",
  };
  const regionMap: Record<string, Region> = {
    us: "North America",
    eu: "Europe",
    apac: "Asia",
    latam: "LatAm",
    africa: "Africa",
    global: "Europe",
  };
  const r = row(
    map[args.department] ?? "fullstack",
    args.seniority,
    regionMap[args.remoteRegion ?? "global"] ?? "Europe",
    2026,
  );
  return { min: r.min, max: r.max, avg: r.avg };
}

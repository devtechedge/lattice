export const DEPARTMENTS = [
  "engineering",
  "design",
  "product",
  "marketing",
  "sales",
  "finance",
  "operations",
  "research",
  "legal",
  "community",
  "other",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_LABEL: Record<Department, string> = {
  engineering: "Engineering",
  design: "Design",
  product: "Product",
  marketing: "Marketing",
  sales: "Sales",
  finance: "Finance",
  operations: "Operations",
  research: "Research",
  legal: "Legal / Compliance",
  community: "Community",
  other: "Other",
};

export const SENIORITIES = [
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "lead",
  "director",
  "c-level",
] as const;
export type Seniority = (typeof SENIORITIES)[number];

export const ROLE_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "bounty",
] as const;
export type RoleType = (typeof ROLE_TYPES)[number];

export const LOCATION_MODES = ["on-site", "hybrid", "remote", "on-site-or-remote"] as const;
export type LocationMode = (typeof LOCATION_MODES)[number];

export const REMOTE_REGIONS = ["global", "us", "eu", "apac", "latam", "africa"] as const;
export type RemoteRegion = (typeof REMOTE_REGIONS)[number];

export const REMOTE_LABEL: Record<RemoteRegion, string> = {
  global: "Remote — Global",
  us: "Remote — US",
  eu: "Remote — EU",
  apac: "Remote — APAC",
  latam: "Remote — LATAM",
  africa: "Remote — Africa",
};

export const SCENES = [
  "crypto",
  "nft",
  "metaverse",
  "gaming",
  "defi",
  "infrastructure",
  "dao",
] as const;
export type Scene = (typeof SCENES)[number];

export const CHAINS = [
  "ethereum",
  "solana",
  "bitcoin",
  "bnb",
  "polygon",
  "arbitrum",
  "base",
  "optimism",
  "avalanche",
  "cosmos",
  "near",
  "sui",
  "aptos",
  "starknet",
  "zksync",
  "ton",
  "multi-chain",
  "chain-agnostic",
] as const;
export type Chain = (typeof CHAINS)[number];

export const TAGS = [
  "ai",
  "analyst",
  "backend",
  "bitcoin",
  "blockchain",
  "crypto",
  "cryptography",
  "cto",
  "dao",
  "data-science",
  "defi",
  "devrel",
  "devops",
  "discord",
  "economy-designer",
  "evm",
  "frontend",
  "fullstack",
  "gaming",
  "golang",
  "layer-2",
  "mobile",
  "moderator",
  "nft",
  "open-source",
  "pay-in-crypto",
  "product",
  "project-manager",
  "react",
  "refi",
  "research",
  "rust",
  "sales",
  "smart-contract",
  "solana",
  "solidity",
  "zero-knowledge",
  "community",
  "design",
  "legal",
  "compliance",
  "quant",
  "security",
  "metaverse",
  "rwa",
  "depin",
  "infrastructure",
  "wallet",
  "exchange",
  "custody",
  "payments",
  "typescript",
  "python",
] as const;
export type Tag = (typeof TAGS)[number];

export const BENEFITS = [
  "remote-first",
  "flexible-hours",
  "pay-in-crypto",
  "healthcare",
  "token-vesting",
  "visa-sponsorship",
  "parental-leave",
  "coworking-stipend",
  "conference-budget",
  "unlimited-pto",
] as const;
export type Benefit = (typeof BENEFITS)[number];

export const BENEFIT_LABEL: Record<Benefit, string> = {
  "remote-first": "Remote-first",
  "flexible-hours": "Flexible hours",
  "pay-in-crypto": "Pay in crypto",
  healthcare: "Healthcare",
  "token-vesting": "Token vesting",
  "visa-sponsorship": "Visa sponsorship",
  "parental-leave": "Parental leave",
  "coworking-stipend": "Co-working stipend",
  "conference-budget": "Conference budget",
  "unlimited-pto": "Unlimited PTO",
};

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const COMPANY_TYPES = [
  "protocol",
  "exchange",
  "l2",
  "studio",
  "fund",
  "dao",
  "infrastructure",
  "consumer",
  "gaming",
  "research",
  "other",
] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

export const CITIES = [
  "New York",
  "San Francisco",
  "London",
  "Singapore",
  "Berlin",
  "Lisbon",
  "Dubai",
  "Bangalore",
  "Toronto",
  "Miami",
  "Hong Kong",
  "Tel Aviv",
  "Seoul",
  "Shenzhen",
] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "SGD", "AED", "INR", "CAD", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Company = {
  id: string;
  slug: string;
  name: string;
  logo: string;
  website: string;
  twitter: string;
  github: string;
  discord: string;
  scenes: Scene[];
  chains: Chain[];
  size: CompanySize;
  type: CompanyType;
  hq: string;
  remotePolicy: "remote-first" | "hybrid" | "on-site";
  verified: boolean;
  foundedYear: number;
  about: string;
  tokenTicker?: string;
  benefits: Benefit[];
  hue: number;
};

export type Role = {
  id: string;
  slug: string;
  companyId: string;
  title: string;
  department: Department;
  seniority: Seniority;
  type: RoleType;
  locationMode: LocationMode;
  locations: string[];
  remoteRegion?: RemoteRegion;
  chains: Chain[];
  scenes: Scene[];
  tags: Tag[];
  descriptionMarkdown: string;
  responsibilities: string[];
  requirements: string[];
  applyUrl?: string;
  applyEmail?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: Currency;
  salaryPeriod: "year" | "month" | "hour";
  salarySource?: "posted" | "inferred" | "none";
  tokenAllocation?: number;
  tokenTicker?: string;
  vestingMonths?: number;
  cliffMonths?: number;
  equityMin?: number;
  equityMax?: number;
  benefits: Benefit[];
  featured: boolean;
  publishedAt: string;
  screeningQuestions: string[];
  status: "open" | "closed";
  source: "catalog" | "user" | "ats";
};

export type Talent = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  role: string;
  seniority: Seniority;
  skills: Tag[];
  chains: Chain[];
  scenes: Scene[];
  location: string;
  remoteRegion: RemoteRegion;
  availability: "open" | "selective" | "not-looking";
  openToGigs: boolean;
  privacy: "public" | "network" | "hidden";
  reputation: number;
  completedContracts: number;
  contributions: { type: "repo" | "article" | "talk" | "governance"; title: string; url: string; year: number }[];
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  womenInWeb3: boolean;
  languages: string[];
  socials: { github?: string; twitter?: string; farcaster?: string; linkedin?: string; website?: string };
  hue: number;
};

export type GigPackage = {
  name: "basic" | "standard" | "pro";
  price: number;
  token: string;
  deliveryDays: number;
  revisions: number;
  summary: string;
};

export type Gig = {
  id: string;
  slug: string;
  talentId: string;
  title: string;
  category: string;
  description: string;
  packages: GigPackage[];
  rating: number;
  reviewCount: number;
  tags: Tag[];
  chains: Chain[];
  reviews: { author: string; rating: number; text: string; date: string }[];
  source: "catalog" | "user";
};

export type FreelanceProject = {
  id: string;
  slug: string;
  companyId: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  token: string;
  network: Chain;
  skills: Tag[];
  durationWeeks: number;
  locationMode: LocationMode;
  status: "open" | "hired";
  publishedAt: string;
  source: "catalog" | "user";
};

export type LearnArticle = {
  slug: string;
  title: string;
  kind: "article" | "tutorial" | "bootcamp" | "video" | "whitepaper" | "interview-questions";
  level: "beginner" | "intermediate" | "advanced";
  minutes: number;
  tags: Tag[];
  body: string;
};

export type PulseEvent = {
  id: string;
  date: string;
  kind: "layoff" | "hiring-spike" | "funding" | "grant";
  title: string;
  body: string;
};

export type SalaryStat = {
  roleKey: string;
  seniority?: Seniority;
  region?: string;
  language?: string;
  year: number;
  avg: number;
  min: number;
  max: number;
  n: number;
};

export type RoleFilters = {
  q?: string;
  department?: Department[];
  seniority?: Seniority[];
  type?: RoleType[];
  locationMode?: LocationMode[];
  remoteRegion?: RemoteRegion[];
  city?: string[];
  chain?: Chain[];
  scene?: Scene[];
  tag?: Tag[];
  benefit?: Benefit[];
  payInCrypto?: boolean;
  salaryDisclosed?: boolean;
  salaryMin?: number;
  companySize?: CompanySize[];
  postedWithin?: "24h" | "7d" | "30d";
  featured?: boolean;
  visa?: boolean;
  sort?: "newest" | "featured" | "salary-desc" | "salary-asc" | "company";
  view?: "table" | "cards";
};

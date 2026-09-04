import type {
  Benefit,
  Chain,
  Company,
  CompanySize,
  CompanyType,
  Department,
  FreelanceProject,
  Gig,
  LearnArticle,
  PulseEvent,
  RemoteRegion,
  Role,
  RoleType,
  Scene,
  Seniority,
  Tag,
  Talent,
} from "./types";

const NOW = Date.parse("2026-09-04T00:00:00.000Z");
const day = 86400000;
const isoAgo = (days: number, hours = 0) => new Date(NOW - days * day - hours * 3600000).toISOString();

function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

type CIn = {
  slug: string;
  name: string;
  type: CompanyType;
  size: CompanySize;
  hq: string;
  remotePolicy: Company["remotePolicy"];
  foundedYear: number;
  ticker?: string;
  scenes: Scene[];
  chains: Chain[];
  benefits: Benefit[];
  about: string;
};

const RAW: CIn[] = [
  { slug: "harbor-labs", name: "Harbor Labs", type: "l2", size: "51-200", hq: "Lisbon", remotePolicy: "remote-first", foundedYear: 2021, ticker: "HARB", scenes: ["infrastructure"], chains: ["ethereum", "arbitrum", "base"], benefits: ["remote-first", "token-vesting", "conference-budget", "unlimited-pto"], about: "Harbor Labs builds a modular settlement layer for rollups that want Ethereum security without operating their own prover stack. The team ships the sequencer, a fault-proof, and a public status plane used by a dozen independent chains." },
  { slug: "nimbus-settlement", name: "Nimbus Settlement", type: "infrastructure", size: "11-50", hq: "Singapore", remotePolicy: "remote-first", foundedYear: 2022, ticker: "NIM", scenes: ["crypto", "defi"], chains: ["ethereum", "polygon", "base"], benefits: ["remote-first", "pay-in-crypto", "flexible-hours", "healthcare"], about: "Nimbus routes stablecoin payouts for exchanges, payrolls, and marketplaces. One API, several networks, explicit compliance hooks. The product is boring on purpose — settlement should be." },
  { slug: "quartz-wallet", name: "Quartz Wallet", type: "consumer", size: "11-50", hq: "Berlin", remotePolicy: "hybrid", foundedYear: 2020, scenes: ["crypto"], chains: ["ethereum", "solana", "multi-chain"], benefits: ["remote-first", "healthcare", "parental-leave", "coworking-stipend"], about: "Quartz is a self-custody wallet for people who actually move size. Hardware-backed keys, session policies, and a transaction simulator that refuses to sugar-coat MEV." },
  { slug: "aperture-protocol", name: "Aperture Protocol", type: "protocol", size: "11-50", hq: "New York", remotePolicy: "remote-first", foundedYear: 2021, ticker: "APT", scenes: ["defi"], chains: ["ethereum", "arbitrum"], benefits: ["remote-first", "token-vesting", "pay-in-crypto", "conference-budget"], about: "Aperture is an intent-based DEX aggregator. Traders sign what they want; solvers compete to fill it. The research team publishes every parameter change before it ships." },
  { slug: "meridian-dao", name: "Meridian DAO", type: "dao", size: "1-10", hq: "Remote", remotePolicy: "remote-first", foundedYear: 2023, ticker: "MRD", scenes: ["dao"], chains: ["ethereum", "optimism"], benefits: ["remote-first", "pay-in-crypto", "flexible-hours", "token-vesting"], about: "Meridian builds the unglamorous operating system for DAOs: budgets, role-based payouts, and proposal hygiene. Contributors are the product." },
  { slug: "driftwood-games", name: "Driftwood Games", type: "gaming", size: "51-200", hq: "Los Angeles", remotePolicy: "hybrid", foundedYear: 2019, ticker: "DRIFT", scenes: ["gaming", "nft"], chains: ["solana", "polygon"], benefits: ["healthcare", "unlimited-pto", "conference-budget", "flexible-hours"], about: "Driftwood ships on-chain games that still feel like games. Assets are portable; the loop is not a spreadsheet. Studios in LA and Seoul share a live-ops desk." },
  { slug: "umbra-studio", name: "Umbra Studio", type: "studio", size: "11-50", hq: "London", remotePolicy: "hybrid", foundedYear: 2021, scenes: ["nft", "metaverse"], chains: ["ethereum", "base"], benefits: ["remote-first", "flexible-hours", "coworking-stipend"], about: "Umbra designs collectible worlds with actual art direction. Drops are sequenced, not spammed. The studio also licenses toolchains to other teams who do not want to invent a renderer." },
  { slug: "helios-custody", name: "Helios Custody", type: "infrastructure", size: "51-200", hq: "Zurich", remotePolicy: "hybrid", foundedYear: 2018, scenes: ["crypto", "infrastructure"], chains: ["bitcoin", "ethereum", "multi-chain"], benefits: ["healthcare", "visa-sponsorship", "parental-leave", "conference-budget"], about: "Helios runs qualified custody for funds and corporates. MPC, policy engines, and an audit trail that a real auditor can read. No retail app, no memes." },
  { slug: "palisade-research", name: "Palisade Research", type: "research", size: "11-50", hq: "Tel Aviv", remotePolicy: "remote-first", foundedYear: 2020, scenes: ["infrastructure"], chains: ["ethereum", "starknet", "zksync"], benefits: ["remote-first", "conference-budget", "token-vesting", "flexible-hours"], about: "Palisade publishes applied cryptography: folding schemes, lookup arguments, and the unglamorous engineering that makes them run in production. Several L2s license the work." },
  { slug: "kite-exchange", name: "Kite Exchange", type: "exchange", size: "201-1000", hq: "Dubai", remotePolicy: "hybrid", foundedYear: 2018, ticker: "KITE", scenes: ["crypto"], chains: ["multi-chain", "ethereum", "solana"], benefits: ["healthcare", "visa-sponsorship", "pay-in-crypto", "parental-leave"], about: "Kite is a derivatives-first exchange with a matching engine that still fits in a profiler. Listed perps, options, and a growing spot book. Compliance is a product surface, not a footnote." },
  { slug: "fathom-security", name: "Fathom Security", type: "other", size: "11-50", hq: "Toronto", remotePolicy: "remote-first", foundedYear: 2022, scenes: ["infrastructure"], chains: ["ethereum", "solana", "multi-chain"], benefits: ["remote-first", "conference-budget", "flexible-hours", "pay-in-crypto"], about: "Fathom audits and monitors smart contracts. The practice is part review, part runtime detection. Clients include protocols that cannot afford a quiet incident." },
  { slug: "oriel-markets", name: "Oriel Markets", type: "protocol", size: "11-50", hq: "New York", remotePolicy: "hybrid", foundedYear: 2023, ticker: "ORL", scenes: ["defi"], chains: ["ethereum", "base"], benefits: ["token-vesting", "healthcare", "remote-first"], about: "Oriel tokenizes short-duration treasuries and routes yield to on-chain dollars. The legal wrapper is the hard part; the vault is the easy part. Both have to be right." },
  { slug: "sable-node", name: "Sable Node", type: "infrastructure", size: "51-200", hq: "Singapore", remotePolicy: "remote-first", foundedYear: 2019, scenes: ["infrastructure"], chains: ["ethereum", "cosmos", "solana"], benefits: ["remote-first", "pay-in-crypto", "conference-budget", "unlimited-pto"], about: "Sable runs validators, RPC, and indexers for teams that should not be paging themselves at 3am. The fleet spans six regions with documented SLO math." },
  { slug: "vesper-relays", name: "Vesper Relays", type: "infrastructure", size: "11-50", hq: "Austin", remotePolicy: "remote-first", foundedYear: 2024, ticker: "VSP", scenes: ["infrastructure"], chains: ["solana", "base", "depin" as Chain], benefits: ["remote-first", "token-vesting", "flexible-hours"], about: "Vesper is a DePIN relay network for bandwidth and compute. Operators stake, jobs route, proofs settle. The team is small and allergic to slideware." },
  { slug: "larkspur-labs", name: "Larkspur Labs", type: "research", size: "1-10", hq: "Paris", remotePolicy: "remote-first", foundedYear: 2022, scenes: ["infrastructure"], chains: ["ethereum", "starknet"], benefits: ["remote-first", "conference-budget", "flexible-hours"], about: "Larkspur works on recursive proofs and circuit DSLs. Most of the output is papers and reference implementations, licensed permissively." },
  { slug: "cobalt-vault", name: "Cobalt Vault", type: "infrastructure", size: "51-200", hq: "London", remotePolicy: "hybrid", foundedYear: 2017, scenes: ["crypto"], chains: ["bitcoin", "ethereum"], benefits: ["healthcare", "visa-sponsorship", "parental-leave"], about: "Cobalt provides segregated vaults and settlement for OTC desks. The stack is conservative by design — new chains wait in a sandbox for a quarter." },
  { slug: "tidepool", name: "Tidepool", type: "protocol", size: "11-50", hq: "San Francisco", remotePolicy: "remote-first", foundedYear: 2021, ticker: "TIDE", scenes: ["defi"], chains: ["solana"], benefits: ["remote-first", "token-vesting", "pay-in-crypto", "unlimited-pto"], about: "Tidepool is a Solana money market with isolated pools and a risk engine that actually trips. Governance is slow on purpose." },
  { slug: "northwind-capital", name: "Northwind Capital", type: "fund", size: "11-50", hq: "New York", remotePolicy: "hybrid", foundedYear: 2018, scenes: ["crypto", "defi"], chains: ["chain-agnostic"], benefits: ["healthcare", "parental-leave", "conference-budget", "visa-sponsorship"], about: "Northwind is a liquid and venture fund across infrastructure and applications. The platform team builds internal research tools that sometimes leak into the public domain." },
  { slug: "aster-field", name: "Aster Field", type: "studio", size: "11-50", hq: "Seoul", remotePolicy: "hybrid", foundedYear: 2022, scenes: ["metaverse", "nft"], chains: ["polygon", "ethereum"], benefits: ["flexible-hours", "coworking-stipend", "healthcare"], about: "Aster Field builds persistent worlds with real-time presence and object provenance. The art team outnumbers engineering, which is the point." },
  { slug: "copperline", name: "Copperline", type: "consumer", size: "51-200", hq: "London", remotePolicy: "remote-first", foundedYear: 2020, ticker: "CPL", scenes: ["crypto"], chains: ["ethereum", "polygon", "base"], benefits: ["remote-first", "pay-in-crypto", "healthcare", "parental-leave"], about: "Copperline is a neobanking layer for people paid in stablecoins. Accounts, cards, invoices, and a tax export that does not insult accountants." },
  { slug: "wren-protocol", name: "Wren Protocol", type: "protocol", size: "11-50", hq: "Miami", remotePolicy: "remote-first", foundedYear: 2023, ticker: "WREN", scenes: ["defi"], chains: ["solana", "base"], benefits: ["remote-first", "token-vesting", "flexible-hours"], about: "Wren is a perpetual futures venue designed for long-tail markets. Oracle design is the product. Liquidations are boring, which is the compliment." },
  { slug: "ironbark", name: "Ironbark", type: "protocol", size: "1-10", hq: "Austin", remotePolicy: "remote-first", foundedYear: 2024, scenes: ["crypto"], chains: ["bitcoin"], benefits: ["remote-first", "pay-in-crypto", "flexible-hours"], about: "Ironbark builds Bitcoin-native contracting without pretending Bitcoin is Ethereum. Discreet log contracts, careful UX, no wrapping as a first instinct." },
  { slug: "lumen-base", name: "Lumen", type: "consumer", size: "11-50", hq: "New York", remotePolicy: "remote-first", foundedYear: 2024, scenes: ["crypto"], chains: ["base", "ethereum"], benefits: ["remote-first", "token-vesting", "healthcare"], about: "Lumen is a consumer on-chain savings product on Base. The interface hides the chain; the reserves do not. Every rate is sourced, not invented." },
  { slug: "zephyr-mesh", name: "Zephyr Mesh", type: "infrastructure", size: "11-50", hq: "Berlin", remotePolicy: "remote-first", foundedYear: 2021, scenes: ["infrastructure"], chains: ["cosmos", "ethereum"], benefits: ["remote-first", "conference-budget", "pay-in-crypto"], about: "Zephyr runs an IBC-connected messaging and intent layer. Packets should be dull. The team makes sure they are." },
  { slug: "canvas-mint", name: "Canvas Mint", type: "studio", size: "1-10", hq: "Lisbon", remotePolicy: "remote-first", foundedYear: 2021, scenes: ["nft"], chains: ["ethereum", "zksync"], benefits: ["remote-first", "flexible-hours", "coworking-stipend"], about: "Canvas Mint is a generative art house. Releases are infrequent, editions are small, and the contracts are readable. The studio also ships an open renderer." },
  { slug: "redwood-analytics", name: "Redwood Analytics", type: "other", size: "11-50", hq: "San Francisco", remotePolicy: "remote-first", foundedYear: 2020, scenes: ["crypto", "defi"], chains: ["multi-chain"], benefits: ["remote-first", "healthcare", "conference-budget"], about: "Redwood indexes chains and sells the queries: flows, holders, protocol health. Analysts get a notebook; engineers get a warehouse." },
  { slug: "sable-and-co", name: "Sable & Co", type: "other", size: "11-50", hq: "London", remotePolicy: "hybrid", foundedYear: 2019, scenes: ["crypto"], chains: ["chain-agnostic"], benefits: ["healthcare", "visa-sponsorship", "parental-leave"], about: "Sable & Co is a crypto-native legal and compliance practice. Opinions, filings, and program design for teams that have outgrown a Discord lawyer." },
  { slug: "pollen-community", name: "Pollen", type: "dao", size: "11-50", hq: "Remote", remotePolicy: "remote-first", foundedYear: 2022, scenes: ["dao", "crypto"], chains: ["ethereum", "optimism"], benefits: ["remote-first", "pay-in-crypto", "flexible-hours", "unlimited-pto"], about: "Pollen runs community and education programs for protocols that want contributors, not just an audience. Moderators are staff, not volunteers with a badge." },
  { slug: "arcadia-devrel", name: "Arcadia", type: "protocol", size: "51-200", hq: "Singapore", remotePolicy: "remote-first", foundedYear: 2020, ticker: "ARC", scenes: ["infrastructure"], chains: ["ethereum", "arbitrum", "optimism"], benefits: ["remote-first", "token-vesting", "conference-budget", "healthcare"], about: "Arcadia is an L2 with an unusually serious developer platform: SDKs, a local stack, and grants that actually pay on time." },
  { slug: "foldline", name: "Foldline", type: "studio", size: "1-10", hq: "Amsterdam", remotePolicy: "remote-first", foundedYear: 2023, scenes: ["nft", "crypto"], chains: ["ethereum", "base"], benefits: ["remote-first", "flexible-hours", "coworking-stipend"], about: "Foldline is a product design studio for wallets, explorers, and on-chain apps. The work is systems, not screenshots." },
  { slug: "brine-quant", name: "Brine", type: "fund", size: "11-50", hq: "Hong Kong", remotePolicy: "hybrid", foundedYear: 2019, scenes: ["crypto"], chains: ["multi-chain"], benefits: ["healthcare", "pay-in-crypto", "conference-budget"], about: "Brine is a quantitative shop: basis, inventory, and a small options book. Researchers sit next to engineers. Nobody has a slide titled synergy." },
  { slug: "stonepine", name: "Stonepine", type: "l2", size: "51-200", hq: "Shenzhen", remotePolicy: "hybrid", foundedYear: 2022, ticker: "SPN", scenes: ["infrastructure"], chains: ["ethereum", "opbnb" as Chain], benefits: ["healthcare", "visa-sponsorship", "token-vesting"], about: "Stonepine operates a high-throughput L2 aimed at payments and games in APAC. The sequencer is in-house; the proof is not a press release." },
  { slug: "marlowe-lending", name: "Marlowe", type: "protocol", size: "11-50", hq: "London", remotePolicy: "remote-first", foundedYear: 2021, ticker: "MRW", scenes: ["defi"], chains: ["ethereum", "arbitrum"], benefits: ["remote-first", "token-vesting", "flexible-hours"], about: "Marlowe is a fixed-rate lending protocol. Duration is a first-class object. The risk committee publishes minutes." },
  { slug: "pixelharbor", name: "Pixelharbor", type: "gaming", size: "51-200", hq: "Barcelona", remotePolicy: "hybrid", foundedYear: 2018, scenes: ["gaming", "nft"], chains: ["polygon", "immutable" as Chain], benefits: ["healthcare", "unlimited-pto", "conference-budget"], about: "Pixelharbor makes competitive games with optional on-chain inventory. Ranked comes first. The marketplace is a side door, not the front." },
  { slug: "umbriel", name: "Umbriel", type: "infrastructure", size: "11-50", hq: "Berlin", remotePolicy: "remote-first", foundedYear: 2023, scenes: ["infrastructure"], chains: ["ethereum", "zksync", "starknet"], benefits: ["remote-first", "conference-budget", "token-vesting"], about: "Umbriel sells a proving-as-a-service plane. Teams submit circuits; Umbriel returns proofs with an SLO. Hardware is a mix of GPU and custom." },
  { slug: "cinder-exchange", name: "Cinder", type: "exchange", size: "51-200", hq: "Seoul", remotePolicy: "hybrid", foundedYear: 2020, ticker: "CNDR", scenes: ["crypto"], chains: ["ethereum", "solana", "bitcoin"], benefits: ["healthcare", "visa-sponsorship", "pay-in-crypto"], about: "Cinder is a spot-first exchange with local-language support across APAC. Listings are slow. Support is staffed by humans." },
  { slug: "vale-identity", name: "Vale", type: "consumer", size: "11-50", hq: "Toronto", remotePolicy: "remote-first", foundedYear: 2024, scenes: ["crypto", "dao"], chains: ["ethereum", "polygon"], benefits: ["remote-first", "flexible-hours", "healthcare"], about: "Vale issues portable credentials for people who want to prove facts without doxxing themselves. Selective disclosure is the default." },
  { slug: "mosaic-rwa", name: "Mosaic", type: "protocol", size: "11-50", hq: "New York", remotePolicy: "hybrid", foundedYear: 2023, ticker: "MSC", scenes: ["defi"], chains: ["ethereum", "base"], benefits: ["token-vesting", "healthcare", "conference-budget"], about: "Mosaic underwrites on-chain credit against off-chain receivables. The origination desk and the smart-contract desk share a war room." },
  { slug: "nightjar", name: "Nightjar", type: "consumer", size: "1-10", hq: "Bangalore", remotePolicy: "remote-first", foundedYear: 2024, scenes: ["crypto"], chains: ["solana", "base"], benefits: ["remote-first", "pay-in-crypto", "flexible-hours"], about: "Nightjar is a mobile wallet for first-time users in India and SEA. Onramps, rupee rails, and a recovery story that does not require a lecture." },
  { slug: "praxis-grants", name: "Praxis Grants", type: "dao", size: "1-10", hq: "Remote", remotePolicy: "remote-first", foundedYear: 2022, scenes: ["dao"], chains: ["ethereum", "optimism", "base"], benefits: ["remote-first", "pay-in-crypto", "flexible-hours"], about: "Praxis runs an independent grants stack used by several ecosystems. Applications, milestones, and public reporting. The DAO is the customer." },
];

export const COMPANIES: Company[] = RAW.map((c) => ({
  id: c.slug,
  slug: c.slug,
  name: c.name,
  website: `https://${c.slug.replace(/and-co/, "sable")}.xyz`,
  twitter: `https://x.com/${c.slug.replace(/-/g, "")}`,
  github: `https://github.com/${c.slug}`,
  discord: `https://discord.gg/${c.slug}`,
  scenes: c.scenes,
  chains: c.chains.filter((x) => x !== ("depin" as Chain) && x !== ("opbnb" as Chain) && x !== ("immutable" as Chain)) as Chain[],
  size: c.size,
  type: c.type,
  hq: c.hq,
  remotePolicy: c.remotePolicy,
  verified: true,
  foundedYear: c.foundedYear,
  about: c.about,
  tokenTicker: c.ticker,
  benefits: c.benefits,
  hue: hue(c.slug),
}));

type Tpl = {
  title: string;
  department: Department;
  seniority: Seniority;
  type?: RoleType;
  tags: Tag[];
  intern?: boolean;
};

const TPL: Tpl[] = [
  { title: "Senior Solidity Engineer", department: "engineering", seniority: "senior", tags: ["solidity", "smart-contract", "evm", "security"] },
  { title: "Staff Protocol Engineer", department: "engineering", seniority: "staff", tags: ["rust", "backend", "infrastructure", "blockchain"] },
  { title: "Rust Engineer, Runtime", department: "engineering", seniority: "senior", tags: ["rust", "backend", "infrastructure"] },
  { title: "Full-Stack Engineer", department: "engineering", seniority: "mid", tags: ["fullstack", "typescript", "react", "frontend"] },
  { title: "Frontend Engineer, Wallet", department: "engineering", seniority: "senior", tags: ["frontend", "react", "wallet", "typescript"] },
  { title: "Backend Engineer", department: "engineering", seniority: "mid", tags: ["backend", "golang", "typescript"] },
  { title: "ZK Circuit Engineer", department: "engineering", seniority: "senior", tags: ["zero-knowledge", "cryptography", "rust"] },
  { title: "DevOps / SRE", department: "engineering", seniority: "senior", tags: ["devops", "infrastructure", "security"] },
  { title: "Smart Contract Security Engineer", department: "engineering", seniority: "senior", tags: ["security", "smart-contract", "solidity"] },
  { title: "Mobile Engineer", department: "engineering", seniority: "mid", tags: ["mobile", "react", "wallet"] },
  { title: "Junior Blockchain Developer", department: "engineering", seniority: "junior", tags: ["solidity", "blockchain", "typescript"] },
  { title: "Product Designer", department: "design", seniority: "mid", tags: ["design", "frontend", "product"] },
  { title: "Brand Designer", department: "design", seniority: "senior", tags: ["design", "nft"] },
  { title: "Product Manager, Protocol", department: "product", seniority: "senior", tags: ["product", "defi"] },
  { title: "Technical Product Manager", department: "product", seniority: "mid", tags: ["product", "blockchain"] },
  { title: "DevRel Engineer", department: "community", seniority: "mid", tags: ["devrel", "open-source", "community"] },
  { title: "Community Lead", department: "community", seniority: "senior", tags: ["community", "discord", "moderator"] },
  { title: "Growth Marketing Lead", department: "marketing", seniority: "senior", tags: ["crypto"] },
  { title: "Content Strategist", department: "marketing", seniority: "mid", tags: ["community"] },
  { title: "Institutional Sales", department: "sales", seniority: "senior", tags: ["sales", "exchange"] },
  { title: "BD / Partnerships", department: "sales", seniority: "mid", tags: ["sales"] },
  { title: "Researcher, Mechanism Design", department: "research", seniority: "senior", tags: ["research", "economy-designer", "defi"] },
  { title: "Quantitative Researcher", department: "research", seniority: "senior", tags: ["quant", "data-science", "python"] },
  { title: "Data Analyst", department: "research", seniority: "mid", tags: ["analyst", "data-science", "python"] },
  { title: "Compliance Officer", department: "legal", seniority: "senior", tags: ["compliance", "legal"] },
  { title: "General Counsel", department: "legal", seniority: "director", tags: ["legal"] },
  { title: "Finance Operations", department: "finance", seniority: "mid", tags: ["payments"] },
  { title: "People & Talent", department: "operations", seniority: "mid", tags: [] },
  { title: "CTO", department: "engineering", seniority: "c-level", tags: ["cto", "rust", "solidity"] },
  { title: "Engineering Intern", department: "engineering", seniority: "intern", type: "internship", tags: ["typescript", "blockchain"] },
];

function salaryFor(seniority: Seniority, department: Department, region: RemoteRegion | undefined, hq: string): { min?: number; max?: number } {
  const base: Record<Seniority, [number, number]> = {
    intern: [28000, 52000],
    junior: [62000, 95000],
    mid: [90000, 140000],
    senior: [130000, 190000],
    staff: [170000, 240000],
    lead: [175000, 250000],
    director: [180000, 280000],
    "c-level": [200000, 350000],
  };
  let [min, max] = base[seniority];
  if (department === "community" || department === "marketing") {
    min *= 0.78;
    max *= 0.82;
  }
  if (department === "engineering" || department === "research") {
    min *= 1.05;
    max *= 1.08;
  }
  const loc = region ?? (hq === "New York" || hq === "San Francisco" ? "us" : hq === "London" || hq === "Berlin" || hq === "Lisbon" || hq === "Paris" || hq === "Amsterdam" || hq === "Zurich" || hq === "Barcelona" ? "eu" : hq === "Singapore" || hq === "Hong Kong" || hq === "Seoul" || hq === "Shenzhen" || hq === "Bangalore" || hq === "Dubai" ? "apac" : "global");
  const locM: Record<string, number> = { us: 1.15, eu: 0.92, apac: 0.78, latam: 0.62, africa: 0.55, global: 0.95 };
  const m = locM[loc] ?? 1;
  min = Math.round((min * m) / 1000) * 1000;
  max = Math.round((max * m) / 1000) * 1000;
  return { min, max };
}

function describe(company: Company, title: string, department: Department): { md: string; resp: string[]; req: string[] } {
  const resp = [
    `Own a surface of ${company.name}'s ${department} work from spec through production.`,
    `Write in public: reviews, incident notes, and the decisions that did not ship.`,
    `Pair with counterparts in product, research, and security rather than throwing work over a wall.`,
    `Keep quality bars explicit — tests, runbooks, and the boring operational path.`,
  ];
  const req = [
    `Demonstrated work in ${company.scenes[0]} or an adjacent domain, not just a tutorial repo.`,
    `Comfort with ambiguity; most of this industry is still being named.`,
    `Written communication that a stranger can follow.`,
    `A bias toward shipping the smaller correct thing.`,
  ];
  const md = `## The role

${company.name} is hiring a ${title}. ${company.about}

This is not a tourist seat. You will work on the path that users actually hit, with the constraints of a ${company.size} ${company.type} that is ${company.remotePolicy.replace("-", " ")}.

## What you will do

- ${resp[0]}
- ${resp[1]}
- ${resp[2]}
- ${resp[3]}
- Collaborate across timezones. The default is asynchronous; meetings earn their place.

## What you bring

- ${req[0]}
- ${req[1]}
- ${req[2]}
- ${req[3]}

## How we work

We publish more than we present. Compensation is cash${company.tokenTicker ? `, ${company.tokenTicker} with a published vest,` : ""} and a benefits stack that is written down, not implied. Token-heavy offers are labeled as such — if cash is below market, ask for the cliff.

## Apply

Send a short note on a piece of work you are proud of. Links beat adjectives. We reply to everyone we interview and most people we do not.`;
  return { md, resp, req };
}

function regionFor(company: Company, remote: boolean): RemoteRegion | undefined {
  if (!remote) return undefined;
  const hq = company.hq;
  if (hq === "New York" || hq === "San Francisco" || hq === "Austin" || hq === "Miami" || hq === "Toronto") return "us";
  if (["London", "Berlin", "Lisbon", "Paris", "Amsterdam", "Zurich", "Barcelona"].includes(hq)) return "eu";
  if (["Singapore", "Hong Kong", "Seoul", "Shenzhen", "Bangalore", "Dubai"].includes(hq)) return "apac";
  return "global";
}

export const ROLES: Role[] = (() => {
  const out: Role[] = [];
  let n = 0;
  for (let ci = 0; ci < COMPANIES.length; ci++) {
    const c = COMPANIES[ci];
    const count = 2 + (ci % 3);
    const used = new Set<string>();
    for (let k = 0; k < count; k++) {
      let tpl = TPL[(ci * 3 + k * 5) % TPL.length];
      let guard = 0;
      while (used.has(tpl.title) && guard++ < 20) tpl = TPL[(ci * 3 + k * 5 + guard) % TPL.length];
      used.add(tpl.title);
      const remote = c.remotePolicy === "remote-first" || k % 3 !== 2;
      const region = regionFor(c, remote);
      const disclose = n % 5 !== 1;
      const payCrypto = c.benefits.includes("pay-in-crypto") || n % 4 === 0;
      const featured = n % 7 === 0;
      const sal = disclose ? salaryFor(tpl.seniority, tpl.department, region, c.hq) : {};
      const days = 1 + (n % 11 === 0 ? n % 4 : 2 + ((n * 7) % 28));
      const hours = 3 + (n % 14);
      const { md, resp, req } = describe(c, tpl.title, tpl.department);
      const tags = [...new Set([...tpl.tags, ...(payCrypto ? (["pay-in-crypto"] as Tag[]) : []), c.scenes[0] as Tag].filter(Boolean))] as Tag[];
      const slug = `${c.slug}-${tpl.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.replace(/-+/g, "-");
      const type: RoleType = tpl.type ?? (n % 17 === 0 ? "contract" : "full-time");
      out.push({
        id: slug,
        slug,
        companyId: c.id,
        title: tpl.title,
        department: tpl.department,
        seniority: tpl.seniority,
        type,
        locationMode: remote ? (c.remotePolicy === "hybrid" && k % 3 === 1 ? "on-site-or-remote" : "remote") : c.remotePolicy === "on-site" ? "on-site" : "hybrid",
        locations: remote ? [] : [c.hq],
        remoteRegion: region,
        chains: c.chains.slice(0, 3),
        scenes: c.scenes,
        tags: tags.slice(0, 8),
        descriptionMarkdown: md,
        responsibilities: resp,
        requirements: req,
        applyEmail: `jobs@${c.slug}.xyz`,
        salaryMin: sal.min,
        salaryMax: sal.max,
        salaryCurrency: "USD",
        salaryPeriod: "year",
        tokenAllocation: c.tokenTicker && n % 3 !== 2 ? 12000 + (n % 8) * 2500 : undefined,
        tokenTicker: c.tokenTicker && n % 3 !== 2 ? c.tokenTicker : undefined,
        vestingMonths: c.tokenTicker ? 24 : undefined,
        cliffMonths: c.tokenTicker ? 6 : undefined,
        equityMin: n % 6 === 0 ? 0.05 : undefined,
        equityMax: n % 6 === 0 ? 0.25 : undefined,
        benefits: c.benefits,
        featured,
        publishedAt: isoAgo(days, hours),
        screeningQuestions: featured ? ["Link a piece of work that would make us hire you twice."] : [],
        status: "open",
        source: "catalog",
      });
      n++;
    }
  }
  return out.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
})();

const FIRST = ["Amina", "Jonas", "Priya", "Mateo", "Hana", "Ibrahim", "Sofia", "Kenji", "Leila", "Oscar", "Nia", "Viktor", "Ananya", "Diego", "Marta", "Yusuf", "Elena", "Ravi", "Chloe", "Tariq", "Ines", "Noah", "Mei", "Luca", "Aisha", "Owen", "Zara", "Felix", "Sana", "Hugo", "Ada", "Omar", "Vera", "Kai"];
const LAST = ["Okoye", "Berg", "Nair", "Alvarez", "Sato", "Haddad", "Rossi", "Park", "Mansour", "Lind", "Mensah", "Kovacs", "Deshpande", "Vargas", "Nowak", "Rahman", "Petrov", "Iyer", "Nguyen", "Diallo", "Moreau", "Cohen", "Chen", "Bianchi", "Khan", "Walsh", "Qureshi", "Bauer", "Iqbal", "Silva"];

export const TALENT: Talent[] = Array.from({ length: 34 }, (_, i) => {
  const name = `${FIRST[i]} ${LAST[i % LAST.length]}`;
  const slug = name.toLowerCase().replace(/ /g, "-");
  const seniorities: Seniority[] = ["junior", "mid", "senior", "staff", "lead"];
  const seniority = seniorities[i % seniorities.length];
  const roles = ["Solidity engineer", "Protocol engineer", "Product designer", "DevRel", "Quant", "Security engineer", "Community lead", "Full-stack"];
  const skillSets: Tag[][] = [
    ["solidity", "smart-contract", "evm", "security"],
    ["rust", "backend", "infrastructure"],
    ["design", "frontend", "product"],
    ["devrel", "community", "open-source"],
    ["quant", "python", "data-science"],
    ["security", "solidity", "rust"],
    ["community", "discord"],
    ["fullstack", "typescript", "react"],
  ];
  const locs = ["Lisbon", "Lagos", "Bangalore", "Berlin", "Mexico City", "Toronto", "Seoul", "Nairobi", "London", "São Paulo", "Dubai", "Tallinn", "New York", "Singapore", "Cape Town", "Warsaw", "Taipei", "Austin"];
  const privacy: Talent["privacy"] = i >= 28 ? "network" : "public";
  return {
    id: slug,
    slug,
    displayName: name,
    headline: `${roles[i % roles.length]} · ${seniority}`,
    bio: `${name.split(" ")[0]} has spent the last ${3 + (i % 8)} years on ${["protocol internals", "application surfaces", "security reviews", "community systems", "mechanism design"][i % 5]}. Looking for teams that write things down and ship on a cadence.`,
    role: roles[i % roles.length],
    seniority,
    skills: skillSets[i % skillSets.length],
    chains: ([["ethereum"], ["solana"], ["ethereum", "base"], ["bitcoin"], ["starknet", "ethereum"], ["cosmos"], ["polygon", "ethereum"]] as Chain[][])[i % 7],
    scenes: ([["defi"], ["infrastructure"], ["nft"], ["dao"], ["gaming"], ["crypto"]] as Scene[][])[i % 6],
    location: locs[i % locs.length],
    remoteRegion: (["eu", "africa", "apac", "eu", "latam", "us", "apac", "africa", "eu", "latam", "apac", "eu", "us", "apac", "africa", "eu", "apac", "us"] as RemoteRegion[])[i % 18],
    availability: i % 7 === 0 ? "selective" : "open",
    openToGigs: i % 3 !== 2,
    privacy,
    reputation: Number((4.2 + (i % 8) * 0.1).toFixed(2)),
    completedContracts: 2 + (i % 14),
    contributions: [
      { type: "repo", title: "open circuit helpers", url: "https://github.com/example", year: 2025 },
      { type: "article", title: "Reading a token grant", url: "https://example.com", year: 2024 },
    ],
    desiredSalaryMin: 80000 + (i % 6) * 15000,
    desiredSalaryMax: 140000 + (i % 6) * 20000,
    womenInWeb3: i % 3 === 0,
    languages: i % 2 === 0 ? ["English"] : ["English", "Spanish"],
    socials: { github: `https://github.com/${slug}`, twitter: `https://x.com/${slug.replace("-", "")}` },
    hue: hue(slug),
  };
});

const GIG_CATS = [
  "Smart contracts & security",
  "Development",
  "Design & brand",
  "Writing & research",
  "Community & Discord",
  "Marketing & growth",
  "Token & economy design",
  "Data & analytics",
];

export const GIGS: Gig[] = TALENT.filter((t) => t.openToGigs).slice(0, 22).map((t, i) => {
  const titles = [
    "I will review your Solidity repo",
    "I will design a mint page",
    "I will write a token-design memo",
    "I will stand up a Discord + mods playbook",
    "I will instrument on-chain analytics",
    "I will ship a wallet connect flow",
    "I will audit an access-control module",
    "I will produce a protocol explainer",
  ];
  const title = titles[i % titles.length];
  const slug = `${t.slug}-gig-${i}`;
  return {
    id: slug,
    slug,
    talentId: t.id,
    title,
    category: GIG_CATS[i % GIG_CATS.length],
    description: `${t.displayName} offers a scoped engagement. Deliverables are written down before work starts. Revisions are in the package, not implied.`,
    packages: [
      { name: "basic", price: 400 + i * 20, token: "USDC", deliveryDays: 5, revisions: 1, summary: "Written review, no call." },
      { name: "standard", price: 900 + i * 40, token: "USDC", deliveryDays: 7, revisions: 2, summary: "Review plus a working session." },
      { name: "pro", price: 1800 + i * 80, token: "USDC", deliveryDays: 12, revisions: 3, summary: "Hands-on implementation or a full memo." },
    ],
    rating: t.reputation,
    reviewCount: 2 + (i % 6),
    tags: t.skills,
    chains: t.chains,
    reviews: [
      { author: "Harbor Labs", rating: 5, text: "Clear, on time, no theatre.", date: isoAgo(20 + i) },
      { author: "Tidepool", rating: 4, text: "Would hire again for a tighter scope.", date: isoAgo(40 + i) },
    ],
    source: "catalog",
  };
});

export const PROJECTS: FreelanceProject[] = COMPANIES.slice(0, 12).map((c, i) => {
  const titles = [
    "Scoped audit of the vault module",
    "Token design + emission schedule",
    "Wallet onboarding overhaul",
    "Indexer for a new event surface",
    "Brand system for a protocol launch",
    "DevRel workshop series",
  ];
  const slug = `${c.slug}-project-${i}`;
  return {
    id: slug,
    slug,
    companyId: c.id,
    title: titles[i % titles.length],
    description: `${c.name} needs a ${titles[i % titles.length].toLowerCase()} over a fixed window. Milestones are paid in USDC on Base. This is a contract, not a headcount seat.`,
    budgetMin: 4000 + i * 500,
    budgetMax: 9000 + i * 800,
    token: "USDC",
    network: "base",
    skills: ([["solidity", "security"], ["economy-designer", "research"], ["frontend", "wallet"], ["backend", "data-science"], ["design"], ["devrel", "community"]] as Tag[][])[i % 6],
    durationWeeks: 2 + (i % 5),
    locationMode: "remote",
    status: "open",
    publishedAt: isoAgo(2 + i * 2),
    source: "catalog",
  };
});

export const LEARN: LearnArticle[] = [
  { slug: "token-heavy-offers", title: "How to evaluate a token-heavy offer", kind: "article", level: "intermediate", minutes: 6, tags: ["crypto"], body: `## Cash is a number. Tokens are a story.

When the cash line is below market, the rest of the package is doing work. Ask for four facts in writing: allocation, implied price, cliff, vest, and what happens on a departure before TGE.

Year-one token value is not the headline allocation. After a six-month cliff on a 24-month vest you have earned a quarter of the grant if you stay the year — and zero if you leave at month five.

Fully-diluted value is a ceiling, not a salary. Use it to compare offers, not to pay rent.

Lattice's calculator applies cliff logic before any vesting. If a recruiter cannot fill the fields, treat the token line as zero until they can.` },
  { slug: "solidity-interview", title: "Solidity interview: 20 questions", kind: "interview-questions", level: "intermediate", minutes: 8, tags: ["solidity", "smart-contract"], body: `## Storage, calls, and the things that actually break

1. What is a storage collision in an upgradeable proxy?
2. When does \`delegatecall\` write to the caller?
3. How do you pull-pay versus push-pay, and why does it matter?
4. What does \`unchecked\` forfeit?
5. Reentrancy: guards vs CEI vs read-only reentrancy.
6. \`tx.origin\` versus \`msg.sender\`.
7. Oracle manipulation in a two-block window.
8. What is a dusty leftover approval?
9. How do you fuzz a rounding error in a vault?
10. When is \`send\` / \`transfer\` the wrong tool?
11. Upgrade delays as a feature.
12. Signature replay across chains.
13. Storage packing and griefing.
14. What does a good invariant test look like?
15. How do you reason about MEV on a liquidation?
16. Permit vs approve/permit2.
17. Default visibility mistakes.
18. What belongs in a constructor versus an initializer?
19. How do you write a finding that a protocol engineer will fix?
20. What will you refuse to ship?

Bring a repo, not a list of courses.` },
  { slug: "zk-primer", title: "A ZK primer for working engineers", kind: "tutorial", level: "beginner", minutes: 7, tags: ["zero-knowledge", "cryptography"], body: `## Proofs are compression with a jury

A zero-knowledge proof lets a prover convince a verifier that a statement holds without handing over the witness. In product terms: you can show a thing is in a set, a balance is sufficient, or a circuit executed, without publishing the inputs.

You do not need to invent a proving system to ship. You need to know what is being proven, who is the verifier (contract, server, client), and what happens when the proof is wrong. Recursive proofs change the cost shape; they do not remove the need for a spec.

Read a circuit. Then read the verifier. Then decide if you trust the ceremony.` },
  { slug: "devrel-path", title: "The DevRel path in protocol teams", kind: "article", level: "beginner", minutes: 5, tags: ["devrel", "community"], body: `## DevRel is product, with a microphone

The job is to shorten the time from clone to first successful call. Docs, examples, office hours, and the political work of carrying bug reports back into engineering without becoming a human shield.

You will be measured on activation, not applause. A packed Twitter space with empty GitHub issues is a miss. A quiet SDK that newcomers finish is a hit.` },
  { slug: "reading-audits", title: "How to read an audit without pretending", kind: "article", level: "intermediate", minutes: 5, tags: ["security"], body: `## The PDF is not a blessing

An audit is a snapshot of a commit, with a scope, by a firm with a reputation. It is not insurance. Read the scope first. Then the severity rubric. Then the unfixed items and the reasons. If the report is two pages of complimentary adjectives, it is marketing.` },
  { slug: "remote-eu", title: "Working remote from the EU", kind: "article", level: "beginner", minutes: 4, tags: ["crypto"], body: `## Timezones, entities, and the rest

Remote-EU usually means overlap with London and Lisbon, invoices through an EOR or your own company, and a tax reality that does not care about your token ticker. Ask who employs you. Ask who withholds. Ask what happens to unvested tokens if the entity changes.` },
  { slug: "rust-runtime", title: "Rust for chain runtimes", kind: "tutorial", level: "advanced", minutes: 6, tags: ["rust", "infrastructure"], body: `## No GC, no surprises, still surprises

Runtime work is about deterministic execution, bounded allocations, and APIs that cannot silently change cost. Idiomatic Rust is not enough. You will care about no_std corners, hashing, and what your host function does when it fails.` },
  { slug: "nft-scene", title: "NFT and metaverse roles that still exist", kind: "article", level: "beginner", minutes: 4, tags: ["nft", "metaverse", "gaming"], body: `## The scene did not vanish. The tourists did.

Studios still hire: art direction, live-ops, marketplace engineering, and the unglamorous work of royalties that actually pay. Filter Lattice by scene. The volume boards bury these under generic crypto.` },
  { slug: "comp-levels", title: "Seniority, actually", kind: "article", level: "beginner", minutes: 4, tags: ["product"], body: `## Titles are local. Scope is not.

Junior owns a task. Mid owns a surface. Senior owns a failure mode. Staff owns a bet across surfaces. If a startup calls everyone senior, ignore the title and read the scope in the listing.` },
  { slug: "apply-well", title: "Apply like an adult", kind: "article", level: "beginner", minutes: 3, tags: ["community"], body: `## Six lines beat a novel

Name the role. Name one relevant piece of work. Name the constraint you already understand (remote region, visa, token). Link the repo or the writing. Stop.` },
];

export const PULSE: PulseEvent[] = [
  { id: "p1", date: isoAgo(4), kind: "hiring-spike", title: "Security and ZK seats warmed up", body: "Protocol teams posted more circuit and audit roles in the last two weeks than in the prior month. Staff-level still scarce." },
  { id: "p2", date: isoAgo(9), kind: "layoff", title: "A consumer wallet trimmed growth", body: "A 40-person consumer team cut a growth pod. Engineering was spared. Similar pattern to 2023, smaller magnitude." },
  { id: "p3", date: isoAgo(14), kind: "funding", title: "RWA origination raised", body: "Two origination desks closed rounds. Legal/compliance roles followed within days — the tell that the money is for licenses, not slogans." },
  { id: "p4", date: isoAgo(18), kind: "grant", title: "L2 grant season opened", body: "Arcadia and Praxis posted public milestone grants. DevRel and ecosystem seats usually trail by three weeks." },
  { id: "p5", date: isoAgo(22), kind: "hiring-spike", title: "Solana app layer is loud again", body: "Wren, Tidepool, and Nightjar all added application engineers. Rust plus product sense, not research." },
  { id: "p6", date: isoAgo(27), kind: "layoff", title: "An NFT marketplace folded a studio", body: "One marketplace shuttered an in-house art tool. Independent studios (Umbra, Canvas Mint) picked up two of the designers." },
  { id: "p7", date: isoAgo(33), kind: "funding", title: "Custody still raises in winter", body: "Helios and Cobalt added institutional coverage. These teams hire slowly and actually mean 'hybrid Zurich'." },
  { id: "p8", date: isoAgo(40), kind: "grant", title: "ZK proving credits", body: "Umbriel published subsidised proving credits for public goods circuits. Expect a bump in research internships, not headcount." },
];

export const GIG_CATEGORIES = GIG_CATS;

export function companyById(id: string) {
  return COMPANIES.find((c) => c.id === id);
}
export function roleBySlug(slug: string) {
  return ROLES.find((r) => r.slug === slug);
}
export function talentBySlug(slug: string) {
  return TALENT.find((t) => t.slug === slug);
}

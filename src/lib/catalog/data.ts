import type {
  Chain,
  FreelanceProject,
  Gig,
  LearnArticle,
  PulseEvent,
  RemoteRegion,
  Role,
  Scene,
  Seniority,
  Tag,
  Talent,
} from "./types";
import { COMPANIES } from "./boards.ts";

const NOW = Date.parse("2026-09-04T00:00:00.000Z");
const day = 86400000;
const isoAgo = (days: number, hours = 0) => new Date(NOW - days * day - hours * 3600000).toISOString();

function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export { COMPANIES };

export const ROLES: Role[] = [];

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

export const PROJECTS: FreelanceProject[] = [];

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

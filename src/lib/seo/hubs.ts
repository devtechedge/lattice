import type { RoleFilters } from "@/lib/catalog/types";

export type SeoHub = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  body: string[];
  filters: RoleFilters;
  related?: { href: string; label: string }[];
};

/** Indexable SEO hubs with crawlable copy + live filtered boards. */
export const SEO_HUBS: SeoHub[] = [
  {
    slug: "solidity",
    title: "Solidity Jobs & Smart Contract Roles | Lattice",
    description:
      "Find live Solidity and smart-contract jobs from crypto employer ATS boards. Apply on the company site. Public Web3 listings — not an employer.",
    h1: "Solidity jobs",
    lead: "Live Solidity and smart-contract openings pulled from public Greenhouse, Ashby, and Lever boards across crypto teams.",
    body: [
      "Solidity remains the default language for EVM smart contracts — DeFi protocols, L2s, wallets, and security-minded product teams hire engineers who can ship and review production Solidity.",
      "Lattice surfaces still-open roles that mention Solidity or smart-contract work. Titles and pay come from the employer board; we never invent a salary band. Apply always leaves Lattice for the company ATS.",
      "Browse related hubs for DeFi scene roles and Ethereum-chain coverage, or open the full roles index to combine filters.",
    ],
    filters: { tag: ["solidity"], sort: "newest" },
    related: [
      { href: "/jobs/defi", label: "DeFi jobs" },
      { href: "/jobs/ethereum", label: "Ethereum jobs" },
      { href: "/roles", label: "All Web3 roles" },
    ],
  },
  {
    slug: "defi",
    title: "DeFi Jobs & Careers — Live Crypto Roles | Lattice",
    description:
      "Browse live DeFi jobs from protocol, exchange, and infrastructure teams. Public ATS listings for blockchain careers. Apply on the employer site.",
    h1: "DeFi jobs",
    lead: "Decentralized finance roles — engineering, research, risk, product, and growth — from teams hiring on public ATS boards.",
    body: [
      "DeFi hiring spans smart-contract engineers, protocol researchers, quant and risk roles, and go-to-market seats at exchanges and infrastructure companies.",
      "This hub filters Lattice’s live crawl to the DeFi scene so you can scan openings without relying on client-only URL filters that search engines may ignore.",
      "Pair with Solidity jobs if you want contract-focused engineering, or Ethereum jobs for chain-tagged listings.",
    ],
    filters: { scene: ["defi"], sort: "newest" },
    related: [
      { href: "/jobs/solidity", label: "Solidity jobs" },
      { href: "/jobs/ethereum", label: "Ethereum jobs" },
      { href: "/scenes/defi", label: "DeFi scene facet" },
    ],
  },
  {
    slug: "ethereum",
    title: "Ethereum Jobs — Web3 & Crypto Careers | Lattice",
    description:
      "Live Ethereum and EVM jobs from crypto employer boards. Blockchain careers on Lattice — public listings, apply on the company site.",
    h1: "Ethereum jobs",
    lead: "Open roles tagged for Ethereum and EVM ecosystems, refreshed from first-party employer boards.",
    body: [
      "Ethereum and EVM work covers L1/L2 protocols, wallets, custody, indexing, and consumer apps that settle on Ethereum or compatible chains.",
      "Lattice lists jobs when the employer board associates them with Ethereum. Use this page as a stable, indexable entry point; the live board below updates as crawls refresh.",
      "Looking for language-specific work? Try the Solidity hub. For remote-first Web3 seats, see Remote Web3 jobs.",
    ],
    filters: { chain: ["ethereum"], sort: "newest" },
    related: [
      { href: "/jobs/solidity", label: "Solidity jobs" },
      { href: "/jobs/remote-web3", label: "Remote Web3 jobs" },
      { href: "/chains/ethereum", label: "Ethereum chain facet" },
    ],
  },
  {
    slug: "remote-web3",
    title: "Remote Web3 Jobs & Crypto Careers | Lattice",
    description:
      "Remote blockchain, crypto, and Web3 jobs from live employer ATS boards. Global and region-tagged remote roles. Apply on the company site.",
    h1: "Remote Web3 jobs",
    lead: "Remote-friendly crypto and blockchain openings — still sourced from public employer boards, not scraped job aggregators.",
    body: [
      "Many Web3 teams hire remote-first or remote-friendly across engineering, design, product, and operations. Region tags (US, EU, APAC, and more) appear when the board publishes them.",
      "This hub starts from remote location mode so crawlers and humans get a dedicated landing page — not only a querystring on /roles.",
      "Tighten further with Solidity, DeFi, or Ethereum hubs, or filter by remote region on the main roles board.",
    ],
    filters: { locationMode: ["remote"], sort: "newest" },
    related: [
      { href: "/jobs/solidity", label: "Solidity jobs" },
      { href: "/jobs/defi", label: "DeFi jobs" },
      { href: "/roles?remoteRegion=global", label: "Remote — Global on Roles" },
    ],
  },
];

export function hubBySlug(slug: string): SeoHub | undefined {
  return SEO_HUBS.find((h) => h.slug === slug);
}

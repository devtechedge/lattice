import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({ component: Page });

function Page() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs uppercase tracking-wider text-mute">About</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">The decentralized future is people.</h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">Lattice exists so the right ones find each other. Web3 hiring was split across five products. We took the slice each of them got right and dropped the rest.</p>
      <ul className="mt-8 space-y-4 text-sm leading-relaxed text-mute">
        <li><span className="text-fg">CryptoJobsList</span> — density, salary submissions, RSS, tools, screening into an ATS.</li>
        <li><span className="text-fg">Web3.Career</span> — tag taxonomy, salary observatory, remote-first IA, get discovered.</li>
        <li><span className="text-fg">CryptocurrencyJobs.co</span> — editorial tone, Talent Collective privacy, designed cards, adult copy.</li>
        <li><span className="text-fg">FindWeb3</span> — NFT/metaverse as a scene, remote-region chips, salary on the card.</li>
        <li><span className="text-fg">LaborX</span> — roles, contracts, and gigs in one work graph, with a demo escrow timeline.</li>
      </ul>
      <p className="mt-8 text-sm leading-relaxed text-mute">We did not take listing auctions, paid boosts, or resume paywalls. Everything here is the free tier. Featured roles are editorial, not checkout.</p>
      <p className="mt-6 text-sm leading-relaxed text-mute">No fake urgency. No forced account to follow an external apply URL. Token-heavy offers are labeled as such. Coinbase roles are pulled live from their public Greenhouse board and apply on coinbase.com — Lattice does not invent a salary.</p>
    </main>
  );
}

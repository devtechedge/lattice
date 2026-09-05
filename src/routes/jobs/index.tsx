import { Link, createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { SEO_HUBS } from "@/lib/seo/hubs";

export const Route = createFileRoute("/jobs/")({
  head: () =>
    pageHead({
      title: "Web3 Job Hubs — Solidity, DeFi, Ethereum, Remote | Lattice",
      path: "/jobs",
      description:
        "Indexable hubs for Solidity, DeFi, Ethereum, and remote Web3 jobs. Live roles from public crypto employer boards on Lattice.",
    }),
  component: JobsIndexPage,
});

function JobsIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-wider text-mute">Discover</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Web3 job hubs</h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        Stable landing pages for high-intent blockchain and crypto job searches. Each hub includes crawlable copy plus a live filtered board from employer ATS listings.
      </p>
      <ul className="mt-10 space-y-6">
        {SEO_HUBS.map((h) => (
          <li key={h.slug} className="border-b border-line pb-6">
            <Link
              to="/jobs/$slug"
              params={{ slug: h.slug }}
              className="font-serif text-2xl tracking-tight text-fg hover:text-signal"
            >
              {h.h1}
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-mute">{h.lead}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-mute">
        Or browse the full{" "}
        <Link to="/roles" className="text-signal underline underline-offset-4">
          roles index
        </Link>
        .
      </p>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GIGS, GIG_CATEGORIES, TALENT } from "@/lib/catalog/data";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/utils";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gigs/")({
  head: () =>
    pageHead({
      title: "Gigs — Lattice",
      path: "/gigs",
      description: "Packaged Web3 gigs from Lattice talent. Demo contracts — not on-chain escrow.",
    }),
  component: GigsPage,
});

function GigsPage() {
  const [cat, setCat] = useState<string | "all">("all");
  const list = useMemo(() => GIGS.filter((g) => cat === "all" || g.category === cat), [cat]);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Gigs</h1>
      <p className="mt-2 text-sm text-mute">Packaged work from Lattice talent. Order creates a demo contract — recorded, not executed on-chain.</p>
      <div className="mt-6 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setCat("all")} className={`rounded-full border px-2.5 py-1 text-[11px] ${cat === "all" ? "border-signal bg-signal text-signal-fg" : "border-line text-mute"}`}>All</button>
        {GIG_CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className={`rounded-full border px-2.5 py-1 text-[11px] ${cat === c ? "border-signal bg-signal text-signal-fg" : "border-line text-mute"}`}>{c}</button>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((g) => {
          const t = TALENT.find((x) => x.id === g.talentId);
          const mid = g.packages.find((p) => p.name === "standard") ?? g.packages[0];
          return (
            <Link key={g.id} to="/gigs/$slug" params={{ slug: g.slug }} className="rounded-md border border-line bg-raised p-4 hover:border-line-strong">
              <p className="text-xs text-cyan">{g.category}</p>
              <h2 className="mt-1 font-medium">{g.title}</h2>
              <p className="mt-1 text-sm text-mute">{t?.displayName} · {g.rating.toFixed(1)} · {g.reviewCount} reviews</p>
              <p className="mt-3 font-mono text-sm tabular-nums">{formatUsd(mid.price)} {mid.token} · {mid.deliveryDays}d</p>
              <div className="mt-2 flex flex-wrap gap-1">{g.tags.slice(0, 4).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

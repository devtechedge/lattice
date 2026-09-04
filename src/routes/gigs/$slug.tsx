import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { GIGS, TALENT } from "@/lib/catalog/data";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/utils";
import { createContract } from "@/lib/server/actions";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import type { GigPackage } from "@/lib/catalog/types";

export const Route = createFileRoute("/gigs/$slug")({ component: GigPage });

function GigPage() {
  const { slug } = Route.useParams();
  const gig = GIGS.find((g) => g.slug === slug);
  const user = useCurrentUser();
  if (!gig) return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-3xl">Gig not found</h1></main>;
  const talent = TALENT.find((t) => t.id === gig.talentId);
  const gigId = gig.id;
  const talentId = gig.talentId;
  const gigTitle = gig.title;

  async function order(pkg: GigPackage) {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      await createContract({ data: { kind: "gig", sourceId: gigId, talentId, payload: { title: gigTitle, package: pkg.name, amount: pkg.price, token: pkg.token } } });
      toast.success("Contract opened — funded (demo). Track it under Me.");
    } catch {
      window.location.href = "/login";
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs text-cyan">{gig.category}</p>
      <h1 className="mt-1 font-serif text-3xl tracking-tight">{gig.title}</h1>
      <p className="mt-2 text-sm text-mute">
        {talent ? <Link to="/talent/$slug" params={{ slug: talent.slug }} className="hover:text-fg">{talent.displayName}</Link> : null}
        {" · "}{gig.rating.toFixed(1)} · {gig.reviewCount} reviews
      </p>
      <p className="mt-4 text-sm leading-relaxed text-mute">{gig.description}</p>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {gig.packages.map((p) => (
          <div key={p.name} className="rounded-md border border-line bg-raised p-4">
            <p className="text-xs capitalize text-mute">{p.name}</p>
            <p className="mt-1 font-mono text-xl tabular-nums">{formatUsd(p.price)}</p>
            <p className="text-xs text-mute">{p.token} · {p.deliveryDays} days · {p.revisions} revisions</p>
            <p className="mt-2 text-sm text-mute">{p.summary}</p>
            <Button className="mt-4 w-full" size="sm" onClick={() => order(p)}>Order</Button>
          </div>
        ))}
      </div>
      <section className="mt-10">
        <h2 className="text-sm font-medium">Reviews</h2>
        <ul className="mt-3 space-y-3">
          {gig.reviews.map((r, i) => (
            <li key={i} className="border-t border-line pt-3 text-sm">
              <p className="font-medium">{r.author} · {r.rating}/5</p>
              <p className="text-mute">{r.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

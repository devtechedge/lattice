import { createFileRoute, Link } from "@tanstack/react-router";
import { LEARN } from "@/lib/catalog/data";
import { Badge } from "@/components/ui/badge";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/learn/")({
  head: () =>
    pageHead({
      title: "Learn — Lattice",
      path: "/learn",
      description: "Short pieces on Web3 careers. No courseware theatre.",
    }),
  component: Page,
});

function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Learn</h1>
      <p className="mt-2 text-sm text-mute">Short pieces. No courseware theatre.</p>
      <ul className="mt-8 space-y-3">
        {LEARN.map((a) => (
          <li key={a.slug}>
            <Link to="/learn/$slug" params={{ slug: a.slug }} className="block rounded-md border border-line bg-raised p-4 hover:border-line-strong">
              <div className="flex flex-wrap gap-1.5">
                <Badge>{a.kind}</Badge>
                <Badge tone="mute">{a.level}</Badge>
                <Badge>{a.minutes} min</Badge>
              </div>
              <h2 className="mt-2 font-medium">{a.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PROJECTS, companyById } from "@/lib/catalog/data";
import { formatUsd } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/contracts/")({ component: Page });

function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Contracts</h1>
      <p className="mt-2 text-sm text-mute">Scoped freelance projects posted by teams. Distinct from gigs (talent-offered packages) and roles (employment).</p>
      <div className="mt-8 grid gap-3">
        {PROJECTS.map((p) => {
          const c = companyById(p.companyId);
          return (
            <Link key={p.id} to="/contracts/$slug" params={{ slug: p.slug }} className="rounded-md border border-line bg-raised p-4 hover:border-line-strong">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-medium">{p.title}</h2>
                <p className="font-mono text-sm tabular-nums">{formatUsd(p.budgetMin)} – {formatUsd(p.budgetMax)} {p.token}</p>
              </div>
              <p className="mt-1 text-sm text-mute">{c?.name} · {p.durationWeeks} weeks · {p.network}</p>
              <div className="mt-2 flex flex-wrap gap-1">{p.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

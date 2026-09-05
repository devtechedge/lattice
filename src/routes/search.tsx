import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { COMPANIES, GIGS, LEARN, TALENT } from "@/lib/catalog/data";
import { listLiveRoles } from "@/lib/server/live";
import type { Role } from "@/lib/catalog/types";

const names = new Map(COMPANIES.map((c) => [c.id, c.name]));

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: Page,
});

function Page() {
  const { q } = Route.useSearch();
  const [live, setLive] = useState<Role[]>([]);
  useEffect(() => {
    listLiveRoles()
      .then(setLive)
      .catch(() => setLive([]));
  }, []);
  const needle = q.toLowerCase();
  const roles = needle
    ? live.filter((r) => `${r.title} ${names.get(r.companyId) ?? ""} ${r.tags.join(" ")}`.toLowerCase().includes(needle)).slice(0, 12)
    : [];
  const companies = needle ? COMPANIES.filter((c) => c.name.toLowerCase().includes(needle)).slice(0, 6) : [];
  const talent = needle ? TALENT.filter((t) => t.privacy === "public" && t.displayName.toLowerCase().includes(needle)).slice(0, 6) : [];
  const gigs = needle ? GIGS.filter((g) => g.title.toLowerCase().includes(needle)).slice(0, 6) : [];
  const learn = needle ? LEARN.filter((a) => a.title.toLowerCase().includes(needle)) : [];
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Search</h1>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Roles, companies, talent, gigs, learn" className="h-10 w-full rounded-sm border border-line bg-raised px-3 text-sm" />
      </form>
      {!needle && <p className="mt-6 text-sm text-mute">Type a query. Or press ⌘K.</p>}
      <Section
        title="Roles"
        items={roles.map((r) => ({
          to: `/roles/${r.slug}`,
          label: names.get(r.companyId) ? `${r.title} · ${names.get(r.companyId)}` : r.title,
        }))}
      />
      <Section title="Companies" items={companies.map((c) => ({ to: `/companies/${c.slug}`, label: c.name }))} />
      <Section title="Talent" items={talent.map((t) => ({ to: `/talent/${t.slug}`, label: t.displayName }))} />
      <Section title="Gigs" items={gigs.map((g) => ({ to: `/gigs/${g.slug}`, label: g.title }))} />
      <Section title="Learn" items={learn.map((a) => ({ to: `/learn/${a.slug}`, label: a.title }))} />
    </main>
  );
}

function Section({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="mt-2 space-y-1">
        {items.map((i) => (
          <li key={i.to}><a href={i.to} className="text-sm hover:text-signal">{i.label}</a></li>
        ))}
      </ul>
    </section>
  );
}

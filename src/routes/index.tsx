import { createFileRoute, Link } from "@tanstack/react-router";
import { RolesBoard } from "@/components/jobs/board";
import { JobCard } from "@/components/jobs/job-card";
import { COMPANIES, GIGS, ROLES, TALENT } from "@/lib/catalog/data";
import { parseRoleSearch, searchRecord } from "@/lib/catalog/filter-roles";
import { CompanyMark } from "@/components/company-mark";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>) => searchRecord(s),
  component: Home,
});

function Home() {
  const search = parseRoleSearch(Route.useSearch());
  const featured = ROLES.find((r) => r.featured) ?? ROLES[0];
  const week = ROLES.filter((r) => Date.now() - new Date(r.publishedAt).getTime() < 7 * 86400000).slice(0, 8);
  const hiring = COMPANIES.filter((c) => ROLES.some((r) => r.companyId === c.id)).slice(0, 14);
  const publicTalent = TALENT.filter((t) => t.privacy === "public").length;
  const latest = ROLES.slice(0, 3);
  const featuredCompany = COMPANIES.find((c) => c.id === featured?.companyId);

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 md:items-end md:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-mute">Web3 · crypto · blockchain</p>
            <h1 className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl">One lattice. Every Web3 career.</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mute">
              Roles, gigs, talent, and salaries for crypto, blockchain, NFTs, and the metaverse — without five tabs and a paywall.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/roles" className="inline-flex h-10 items-center rounded-sm bg-signal px-4 text-sm font-medium text-signal-fg">
                Browse roles
              </Link>
              <Link to="/talent" className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-sm">
                Get discovered
              </Link>
              <Link to="/post" className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-sm">
                Post for free
              </Link>
            </div>
          </div>
          <div className="rounded-md border border-line bg-raised p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-mute">Open now</p>
            <div className="mt-3 grid grid-cols-2 gap-3 font-mono tabular-nums">
              <Stat n={ROLES.length} label="roles" to="/roles" />
              <Stat n={COMPANIES.length} label="teams" to="/companies" />
              <Stat n={GIGS.length} label="gigs" to="/gigs" />
              <Stat n={publicTalent} label="talent" to="/talent" />
            </div>
            <ul className="mt-4 space-y-3">
              {latest.map((r) => (
                <li key={r.id} className="flex items-baseline justify-between gap-3 border-t border-line pt-3 text-sm">
                  <Link to="/roles/$slug" params={{ slug: r.slug }} className="truncate hover:text-signal">
                    {r.title}
                  </Link>
                  <span className="shrink-0 font-mono text-[11px] text-mute">{timeAgo(r.publishedAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {featured && (
        <section className="border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <p className="text-xs uppercase tracking-wider text-gold">Featured</p>
            <div className="mt-3">
              <JobCard role={featured} company={featuredCompany} />
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-xs uppercase tracking-wider text-mute">New this week</p>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {week.map((r) => {
              const c = COMPANIES.find((x) => x.id === r.companyId);
              return (
                <li key={r.id}>
                  <Link to="/roles/$slug" params={{ slug: r.slug }} className="flex items-center justify-between gap-3 rounded-sm border border-line px-3 py-2.5 text-sm hover:border-line-strong">
                    <span className="min-w-0 truncate">
                      <span className="text-fg">{r.title}</span>
                      <span className="text-mute"> · {c?.name}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-mute">{timeAgo(r.publishedAt)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-xs uppercase tracking-wider text-mute">Companies hiring now</p>
          <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
            {hiring.map((c) => (
              <Link key={c.id} to="/companies/$slug" params={{ slug: c.slug }} className="flex shrink-0 items-center gap-2 text-sm text-mute hover:text-fg">
                <CompanyMark name={c.name} hue={c.hue} size={24} />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="font-serif text-2xl leading-snug tracking-tight md:text-3xl">The decentralized future is people.</p>
          <p className="mt-3 text-sm text-mute">Lattice exists so the right ones find each other.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <RolesBoard initial={search} syncUrl />
      </section>
    </div>
  );
}

function Stat({ n, label, to }: { n: number; label: string; to: "/roles" | "/companies" | "/gigs" | "/talent" }) {
  return (
    <Link to={to} className="rounded-sm border border-line px-3 py-2 hover:border-line-strong">
      <p className="text-2xl text-fg">{n}</p>
      <p className="text-[11px] uppercase tracking-wider text-mute">{label}</p>
    </Link>
  );
}

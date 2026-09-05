import { Link, createFileRoute } from "@tanstack/react-router";
import { CompanyMark } from "@/components/company-mark";
import { COMPANIES } from "@/lib/catalog/data";
import { pageHead } from "@/lib/seo";
import { listLiveRoles } from "@/lib/server/live";
import { useLiveRoles } from "@/lib/catalog/use-live-roles";
import { timeAgo } from "@/lib/utils";
import type { Role } from "@/lib/catalog/types";

const WEEK_MS = 7 * 86400000;

export const Route = createFileRoute("/hiring")({
  loader: async () => {
    try {
      const live = await listLiveRoles();
      return { live };
    } catch {
      return { live: [] as Role[] };
    }
  },
  head: () =>
    pageHead({
      title: "Crypto Companies Hiring This Week — Web3 Jobs | Lattice",
      path: "/hiring",
      description:
        "Which crypto and Web3 companies posted live jobs this week. Fresh openings from public ATS boards — Coinbase, Binance, Ripple, and more. Updated from live crawls.",
    }),
  component: HiringPage,
});

type CompanyWeek = {
  companyId: string;
  roles: Role[];
};

function byCompanyThisWeek(roles: Role[]): CompanyWeek[] {
  const cutoff = Date.now() - WEEK_MS;
  const map = new Map<string, Role[]>();
  for (const r of roles) {
    const t = new Date(r.publishedAt).getTime();
    if (!Number.isFinite(t) || t < cutoff) continue;
    const list = map.get(r.companyId) ?? [];
    list.push(r);
    map.set(r.companyId, list);
  }
  return [...map.entries()]
    .map(([companyId, list]) => ({
      companyId,
      roles: list.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    }))
    .sort((a, b) => b.roles.length - a.roles.length || a.companyId.localeCompare(b.companyId));
}

function HiringPage() {
  const initial = Route.useLoaderData()?.live;
  const { live, ready } = useLiveRoles(initial);
  const weeks = byCompanyThisWeek(live);
  const totalRoles = weeks.reduce((n, w) => n + w.roles.length, 0);
  const asOf = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-wider text-mute">Fresh openings</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Crypto companies hiring this week</h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        A living roundup of Web3 and crypto employers that published at least one still-open role in the last seven days.
        Counts come from Lattice’s live crawl of public Greenhouse, Ashby, and Lever boards — not from another job site.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        Use this page when you want a shareable answer to “who’s hiring in crypto right now?” Apply always leaves Lattice for
        the employer ATS. Public listings. Not an employer.
      </p>
      <p className="mt-4 text-xs text-mute">
        Snapshot as of {asOf} UTC
        {ready ? (
          <>
            {" "}
            · <span className="font-mono tabular-nums text-fg">{weeks.length}</span> companies ·{" "}
            <span className="font-mono tabular-nums text-fg">{totalRoles}</span> roles posted this week
          </>
        ) : (
          " · loading live boards…"
        )}
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link to="/roles" className="text-signal underline underline-offset-4">
          All live roles
        </Link>
        <Link to="/companies" className="text-signal underline underline-offset-4">
          All companies
        </Link>
        <Link to="/jobs" className="text-signal underline underline-offset-4">
          Job hubs
        </Link>
        <Link to="/salaries" className="text-signal underline underline-offset-4">
          Salary observatory
        </Link>
      </div>

      <section className="mt-10 space-y-8">
        {!ready && weeks.length === 0 ? (
          <p className="text-sm text-mute">Fetching employer boards…</p>
        ) : weeks.length === 0 ? (
          <p className="text-sm text-mute">
            No roles with a publish date in the last seven days showed up in this crawl. Check the{" "}
            <Link to="/roles" className="text-signal underline underline-offset-4">
              full roles board
            </Link>{" "}
            for everything still open.
          </p>
        ) : (
          weeks.map(({ companyId, roles }) => {
            const c = COMPANIES.find((x) => x.id === companyId);
            const name = c?.name ?? companyId;
            const slug = c?.slug;
            return (
              <article key={companyId} className="border-t border-line pt-6">
                <div className="flex items-start gap-3">
                  {c ? (
                    <CompanyMark name={c.name} logoUrl={c.logo} website={c.website} hue={c.hue} size={40} />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-2xl tracking-tight">
                      {slug ? (
                        <Link
                          to="/companies/$slug"
                          params={{ slug }}
                          className="hover:text-signal"
                        >
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                    </h2>
                    <p className="mt-1 text-xs text-mute">
                      <span className="font-mono tabular-nums text-fg">{roles.length}</span> new this week
                      {c ? ` · ${c.type} · ${c.hq}` : null}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {roles.slice(0, 8).map((r) => (
                        <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                          <Link
                            to="/roles/$slug"
                            params={{ slug: r.slug }}
                            className="text-fg hover:text-signal"
                          >
                            {r.title}
                          </Link>
                          <span className="shrink-0 text-xs text-mute">{timeAgo(r.publishedAt)}</span>
                        </li>
                      ))}
                    </ul>
                    {roles.length > 8 ? (
                      <p className="mt-2 text-xs text-mute">+{roles.length - 8} more this week</p>
                    ) : null}
                    {slug ? (
                      <Link
                        to="/companies/$slug"
                        params={{ slug }}
                        className="mt-3 inline-block text-xs text-signal underline underline-offset-4"
                      >
                        All {name} roles on Lattice
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      <section className="mt-14 border-t border-line pt-8 text-sm leading-relaxed text-mute">
        <h2 className="font-serif text-xl tracking-tight text-fg">How this list is built</h2>
        <p className="mt-3">
          Lattice refreshes openings from each tracked team’s public ATS JSON. A company appears here when at least one of
          those roles has a published timestamp inside the last seven days and is still present on the board. Closed roles
          drop when the employer board no longer returns them.
        </p>
        <p className="mt-3">
          For skill-focused landings, see{" "}
          <Link to="/jobs/$slug" params={{ slug: "solidity" }} className="text-signal underline underline-offset-4">
            Solidity jobs
          </Link>
          ,{" "}
          <Link to="/jobs/$slug" params={{ slug: "defi" }} className="text-signal underline underline-offset-4">
            DeFi jobs
          </Link>
          , and other{" "}
          <Link to="/jobs" className="text-signal underline underline-offset-4">
            Web3 job hubs
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Rows3 } from "lucide-react";
import { JobCard } from "./job-card";
import { JobTable } from "./job-table";
import { ActiveChips, RoleFiltersBar } from "./filters";
import { COMPANIES, ROLES } from "@/lib/catalog/data";
import { applyRoleFilters, toSearch } from "@/lib/catalog/filter-roles";
import type { Role, RoleFilters, Company } from "@/lib/catalog/types";
import { listBookmarks, listPostedRoles, toggleBookmark } from "@/lib/server/actions";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const companyMap = new Map(COMPANIES.map((c) => [c.id, c]));

function parsePosted(rows: { payload_json: string; id: string; published_at: string }[]): Role[] {
  return rows
    .map((row) => {
      try {
        const p = JSON.parse(row.payload_json) as Role & { companyName?: string };
        return {
          ...p,
          id: p.id ?? row.id,
          slug: p.slug ?? row.id,
          publishedAt: p.publishedAt ?? row.published_at,
          source: "user",
          salaryCurrency: p.salaryCurrency ?? "USD",
          salaryPeriod: p.salaryPeriod ?? "year",
          tags: p.tags ?? [],
          chains: p.chains ?? [],
          scenes: p.scenes ?? [],
          benefits: p.benefits ?? [],
          locations: p.locations ?? [],
          responsibilities: p.responsibilities ?? [],
          requirements: p.requirements ?? [],
          screeningQuestions: p.screeningQuestions ?? [],
          status: "open",
          featured: false,
          companyId: p.companyId ?? "user",
        } as Role;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Role[];
}

function searchFrom(f: RoleFilters): Record<string, string> {
  const raw = toSearch(f);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v) out[k] = v;
  }
  return out;
}

export function RolesBoard({
  initial,
  hideHero,
  syncUrl,
}: {
  initial: RoleFilters;
  hideHero?: boolean;
  syncUrl?: boolean;
}) {
  const [filters, setFilters] = useState<RoleFilters>(initial);
  const [posted, setPosted] = useState<Role[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(40);
  const user = useCurrentUser();
  const view = filters.view ?? "cards";
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setFilters(initial);
  }, [JSON.stringify(initial)]);

  useEffect(() => {
    listPostedRoles()
      .then((rows) => setPosted(parsePosted(rows)))
      .catch(() => setPosted([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    listBookmarks()
      .then((rows) => setSaved(new Set(rows.map((r) => r.role_id))))
      .catch(() => {});
  }, [user]);

  const push = (f: RoleFilters) => {
    setFilters(f);
    setLimit(40);
    if (syncUrl) {
      void navigate({ to: pathname as never, search: searchFrom(f) as never, replace: true });
    }
  };

  const all = useMemo(() => [...posted, ...ROLES], [posted]);
  const results = useMemo(() => applyRoleFilters(all, filters), [all, filters]);
  const shown = results.slice(0, limit);

  const onToggle = async (id: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await toggleBookmark({ data: { roleId: id } });
      setSaved((prev) => {
        const next = new Set(prev);
        if (res.saved) next.add(id);
        else next.delete(id);
        return next;
      });
    } catch {
      window.location.href = "/login";
    }
  };

  const extraCompanies = new Map<string, Company>(companyMap);
  posted.forEach((r) => {
    if (!extraCompanies.has(r.companyId)) {
      extraCompanies.set(r.companyId, {
        id: r.companyId,
        slug: r.companyId,
        name: (r as Role & { companyName?: string }).companyName ?? "Independent",
        website: "",
        twitter: "",
        github: "",
        discord: "",
        scenes: r.scenes,
        chains: r.chains,
        size: "1-10",
        type: "other",
        hq: "Remote",
        remotePolicy: "remote-first",
        verified: false,
        foundedYear: 2026,
        about: "",
        benefits: [],
        hue: 140,
      });
    }
  });

  const suggestions = ROLES.filter((r) => r.featured || r.remoteRegion === "eu").slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm text-mute" data-testid="roles-count">
          <span className="font-mono tabular-nums text-fg">{results.length}</span> open roles
          {posted.length ? ` · ${posted.length} posted this session` : ""}
        </p>
        {!hideHero && (
          <div className="flex rounded-sm border border-line">
            <button
              type="button"
              className={cn("grid size-9 place-items-center", view === "cards" && "bg-raised text-signal")}
              onClick={() => push({ ...filters, view: "cards" })}
              aria-label="Card view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              className={cn("grid size-9 place-items-center", view === "table" && "bg-raised text-signal")}
              onClick={() => push({ ...filters, view: "table" })}
              aria-label="Table view"
            >
              <Rows3 className="size-4" />
            </button>
          </div>
        )}
      </div>
      <RoleFiltersBar
        value={filters}
        onChange={push}
        extra={
          hideHero ? (
            <div className="flex rounded-sm border border-line">
              <button
                type="button"
                className={cn("grid size-10 place-items-center", view === "cards" && "text-signal")}
                onClick={() => push({ ...filters, view: "cards" })}
                aria-label="Cards"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                className={cn("grid size-10 place-items-center", view === "table" && "text-signal")}
                onClick={() => push({ ...filters, view: "table" })}
                aria-label="Table"
              >
                <Rows3 className="size-4" />
              </button>
            </div>
          ) : null
        }
      />
      <ActiveChips value={filters} onChange={push} />
      {results.length === 0 ? (
        <div className="rounded-md border border-line bg-raised p-8">
          <p className="font-medium">No open roles match these filters. Loosen a chip, or post one.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => push({ sort: filters.sort, view: filters.view })}>
              Clear filters
            </Button>
            <a href="/post/role">
              <Button>Post a role</Button>
            </a>
          </div>
          {suggestions.length > 0 && (
            <ul className="mt-6 space-y-2">
              {suggestions.map((r) => (
                <li key={r.id}>
                  <a href={`/roles/${r.slug}`} className="text-sm text-signal hover:underline">
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : view === "table" ? (
        <JobTable roles={shown} companies={extraCompanies} saved={saved} onToggleSave={onToggle} />
      ) : (
        <div className="grid gap-3">
          {shown.map((r) => (
            <JobCard key={r.id} role={r} company={extraCompanies.get(r.companyId)} saved={saved.has(r.id)} onToggleSave={onToggle} />
          ))}
        </div>
      )}
      {shown.length < results.length && (
        <button type="button" className="w-full rounded-sm border border-line py-3 text-sm text-mute hover:text-fg" onClick={() => setLimit((n) => n + 40)}>
          Load more · {results.length - shown.length} remaining
        </button>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { RolesBoard } from "@/components/jobs/board";
import { parseRoleSearch, searchRecord } from "@/lib/catalog/filter-roles";
import { useLiveRoles } from "@/lib/catalog/use-live-roles";
import { listLiveRoles } from "@/lib/server/live";
import { timeAgo } from "@/lib/utils";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/roles/")({
  validateSearch: (s: Record<string, unknown>) => searchRecord(s),
  loader: async () => {
    try {
      const live = await listLiveRoles();
      return { live };
    } catch {
      return { live: [] as Awaited<ReturnType<typeof listLiveRoles>> };
    }
  },
  head: () =>
    pageHead({
      title: "Web3 & Crypto Jobs — Live Open Roles | Lattice",
      path: "/roles",
      description: "Browse live Web3 jobs and crypto careers. Filter by chain, seniority, and region. Listings from public Greenhouse, Ashby, and Lever boards.",
    }),
  component: RolesPage,
});

function RolesPage() {
  const search = parseRoleSearch(Route.useSearch());
  const initial = Route.useLoaderData()?.live;
  const { live } = useLiveRoles(initial);
  const newest = live[0];
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-xs uppercase tracking-wider text-mute">Updated {newest ? timeAgo(newest.publishedAt) : "just now"} ago</p>
      <h1 className="mt-1 font-serif text-3xl tracking-tight">Roles</h1>
      <p className="mt-2 text-sm text-mute">
        Filter by chain, role, remote region, and seniority. Live listings from twenty crypto teams — apply on the employer’s site. The URL is the filter.
      </p>
      <div className="mt-8">
        <RolesBoard initial={search} hideHero syncUrl />
      </div>
    </main>
  );
}

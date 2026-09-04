import { createFileRoute } from "@tanstack/react-router";
import { RolesBoard } from "@/components/jobs/board";
import { parseRoleSearch, searchRecord } from "@/lib/catalog/filter-roles";
import { ROLES } from "@/lib/catalog/data";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/roles/")({
  validateSearch: (s: Record<string, unknown>) => searchRecord(s),
  component: RolesPage,
});

function RolesPage() {
  const search = parseRoleSearch(Route.useSearch());
  const newest = ROLES[0];
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-xs uppercase tracking-wider text-mute">Updated {newest ? timeAgo(newest.publishedAt) : "just now"} ago</p>
      <h1 className="mt-1 font-serif text-3xl tracking-tight">Roles</h1>
      <p className="mt-2 text-sm text-mute">Filter by chain, role, remote region, token split, and seniority. The URL is the filter.</p>
      <div className="mt-8">
        <RolesBoard initial={search} hideHero syncUrl />
      </div>
    </main>
  );
}

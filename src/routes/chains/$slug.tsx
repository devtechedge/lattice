import { createFileRoute } from "@tanstack/react-router";
import { RolesBoard } from "@/components/jobs/board";
import type { Chain } from "@/lib/catalog/types";

export const Route = createFileRoute("/chains/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight capitalize">{slug} roles</h1>
      <div className="mt-8"><RolesBoard initial={{ chain: [slug as Chain], sort: "newest" }} hideHero /></div>
    </main>
  );
}

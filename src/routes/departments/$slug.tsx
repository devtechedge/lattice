import { createFileRoute } from "@tanstack/react-router";
import { RolesBoard } from "@/components/jobs/board";
import { DEPARTMENT_LABEL, type Department } from "@/lib/catalog/types";

export const Route = createFileRoute("/departments/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const label = DEPARTMENT_LABEL[slug as Department] ?? slug;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">{label}</h1>
      <div className="mt-8"><RolesBoard initial={{ department: [slug as Department], sort: "newest" }} hideHero /></div>
    </main>
  );
}

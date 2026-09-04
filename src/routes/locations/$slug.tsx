import { createFileRoute } from "@tanstack/react-router";
import { RolesBoard } from "@/components/jobs/board";
import { CITIES } from "@/lib/catalog/types";

export const Route = createFileRoute("/locations/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const city = CITIES.find((c) => c.toLowerCase().replace(/ /g, "-") === slug) ?? slug.replace(/-/g, " ");
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight capitalize">{city}</h1>
      <p className="mt-2 text-sm text-mute">Open roles in {city}.</p>
      <div className="mt-8"><RolesBoard initial={{ city: [typeof city === "string" ? city : slug], sort: "newest" }} hideHero /></div>
    </main>
  );
}

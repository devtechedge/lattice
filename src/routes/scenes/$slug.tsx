import { createFileRoute } from "@tanstack/react-router";
import { RolesBoard } from "@/components/jobs/board";
import type { Scene } from "@/lib/catalog/types";

export const Route = createFileRoute("/scenes/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight capitalize">{slug}</h1>
      <p className="mt-2 text-sm text-mute">Scene coverage as a first-class facet — NFT and metaverse roles two clicks away.</p>
      <div className="mt-8"><RolesBoard initial={{ scene: [slug as Scene], sort: "newest" }} hideHero /></div>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: Page });

function Page() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl tracking-tight">Privacy</h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">Lattice stores what you save, apply with, and post. Talent profiles honor Public / Network only / Hidden. We do not sell resume data. Session auth is handled by this app’s account system. Demo contracts are records, not on-chain transactions.</p>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({ component: Page });

function Page() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl tracking-tight">Terms</h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">Lattice is a free-tier board. Listings are provided as-is. Featured placement is editorial. Salary estimates are observatory figures, not offers. You are responsible for the accuracy of roles and applications you post.</p>
    </main>
  );
}

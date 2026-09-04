import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PROJECTS, companyById } from "@/lib/catalog/data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { formatUsd } from "@/lib/utils";
import { createContract, submitProposal } from "@/lib/server/actions";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/contracts/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const p = PROJECTS.find((x) => x.slug === slug);
  const user = useCurrentUser();
  const [note, setNote] = useState("");
  if (!p) return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-3xl">Not found</h1></main>;
  const c = companyById(p.companyId);
  const project = p;

  async function propose(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      await submitProposal({ data: { projectId: project.id, note } });
      await createContract({
        data: {
          kind: "project",
          sourceId: project.id,
          payload: { title: project.title, amount: project.budgetMax, token: project.token, network: project.network },
        },
      });
      toast.success("Proposal filed. Demo escrow: funded.");
      setNote("");
    } catch {
      window.location.href = "/login";
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs text-mute">{c ? <Link to="/companies/$slug" params={{ slug: c.slug }}>{c.name}</Link> : null}</p>
      <h1 className="mt-1 font-serif text-3xl tracking-tight">{p.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">{p.description}</p>
      <p className="mt-4 font-mono text-sm">{formatUsd(p.budgetMin)} – {formatUsd(p.budgetMax)} {p.token} on {p.network} · {p.durationWeeks} weeks</p>
      <form onSubmit={propose} className="mt-8 space-y-3 rounded-md border border-line bg-raised p-4">
        <p className="text-sm font-medium">Propose</p>
        <Textarea required value={note} onChange={(e) => setNote(e.target.value)} placeholder="Scope, start date, relevant work." />
        <Button type="submit">Submit proposal</Button>
      </form>
    </main>
  );
}

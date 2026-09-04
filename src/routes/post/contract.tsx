import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { publishProject } from "@/lib/server/actions";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/post/contract")({ component: Page });

function Page() {
  const { user, isPending } = useCurrentUserState();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("4000");
  const [budgetMax, setBudgetMax] = useState("8000");
  if (isPending) return <main className="mx-auto max-w-xl px-4 py-16"><div className="h-40 animate-pulse rounded-md bg-raised" /></main>;
  if (!user) return <RedirectToSignIn />;
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Post a contract</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await publishProject({
            data: { title, description, companyName, budgetMin: Number(budgetMin), budgetMax: Number(budgetMax), token: "USDC", durationWeeks: 3 },
          });
          toast.success("Published.");
          nav({ to: "/contracts" });
          void res;
        }}
      >
        <div className="space-y-1"><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-1"><Label>Company</Label><Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
        <div className="space-y-1"><Label>Scope</Label><Textarea required value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Budget min</Label><Input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} /></div>
          <div className="space-y-1"><Label>Budget max</Label><Input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} /></div>
        </div>
        <Button type="submit">Publish</Button>
      </form>
    </main>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { GIG_CATEGORIES } from "@/lib/catalog/data";
import { publishGig } from "@/lib/server/actions";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/post/gig")({ component: Page });

function Page() {
  const { user, isPending } = useCurrentUserState();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(GIG_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  if (isPending) return <main className="mx-auto max-w-xl px-4 py-16"><div className="h-40 animate-pulse rounded-md bg-raised" /></main>;
  if (!user) return <RedirectToSignIn />;
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Post a gig</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await publishGig({ data: { title, category, description, priceBasic: 400, priceStandard: 900, pricePro: 1800, token: "USDC" } });
          toast.success("Gig is live.");
          nav({ to: "/gigs" });
        }}
      >
        <div className="space-y-1"><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will review your Solidity repo" /></div>
        <div className="space-y-1">
          <Label>Category</Label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-sm border border-line bg-raised px-3 text-sm">
            {GIG_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1"><Label>Description</Label><Textarea required value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <Button type="submit">Publish</Button>
      </form>
    </main>
  );
}

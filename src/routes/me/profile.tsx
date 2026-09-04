import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyProfile, saveProfile } from "@/lib/server/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { CHAINS, TAGS } from "@/lib/catalog/types";

export const Route = createFileRoute("/me/profile")({ component: Page });

function Page() {
  const { user, isPending } = useCurrentUserState();
  const nav = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [what, setWhat] = useState("");
  const [location, setLocation] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "network" | "hidden">("public");
  const [openToGigs, setOpenToGigs] = useState(true);
  const [womenInWeb3, setWomenInWeb3] = useState(false);
  const [skills, setSkills] = useState<string[]>(["solidity"]);
  const [chains, setChains] = useState<string[]>(["ethereum"]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    getMyProfile()
      .then((row) => {
        if (!row) return;
        const p = JSON.parse(row.payload_json) as Record<string, unknown>;
        setDisplayName(String(p.displayName ?? ""));
        setHeadline(String(p.headline ?? ""));
        setBio(String(p.bio ?? ""));
        setWhat(String(p.what ?? ""));
        setLocation(String(p.location ?? ""));
        setPrivacy((p.privacy as typeof privacy) ?? "public");
        setOpenToGigs(Boolean(p.openToGigs));
        setWomenInWeb3(Boolean(p.womenInWeb3));
        if (Array.isArray(p.skills)) setSkills(p.skills as string[]);
        if (Array.isArray(p.chains)) setChains(p.chains as string[]);
      })
      .catch(() => {});
  }, [user]);

  if (isPending) return <main className="mx-auto max-w-xl px-4 py-16"><div className="h-40 animate-pulse rounded-md bg-raised" /></main>;
  if (!user) return <RedirectToSignIn />;

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Your profile</h1>
      <p className="mt-2 text-sm text-mute">Three minutes. Privacy: public directory, network only, or hidden.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await saveProfile({
            data: { displayName, headline, bio, what, location, privacy, openToGigs, womenInWeb3, skills, chains, seniority: "mid" },
          });
          toast.success(privacy === "public" ? "Profile live on Talent." : "Profile saved.");
          if (privacy === "public" && user) nav({ to: "/talent/$slug", params: { slug: user.id } });
        }}
      >
        <div className="space-y-1"><Label>Name</Label><Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
        <div className="space-y-1"><Label>Headline</Label><Input required value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
        <div className="space-y-1"><Label>What you want</Label><Input value={what} onChange={(e) => setWhat(e.target.value)} /></div>
        <div className="space-y-1"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
        <div className="space-y-1"><Label>Background</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} /></div>
        <div className="space-y-1">
          <Label>Privacy</Label>
          <select value={privacy} onChange={(e) => setPrivacy(e.target.value as typeof privacy)} className="h-10 w-full rounded-sm border border-line bg-raised px-3 text-sm">
            <option value="public">Public directory</option>
            <option value="network">Network only</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={openToGigs} onChange={(e) => setOpenToGigs(e.target.checked)} /> Open to gigs</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={womenInWeb3} onChange={(e) => setWomenInWeb3(e.target.checked)} /> Women in Web3 (opt-in)</label>
        <p className="text-xs text-mute">Skills (toggle): {TAGS.slice(0, 12).map((t) => (
          <button key={t} type="button" className={`mr-1 mt-1 rounded-full border px-2 py-0.5 ${skills.includes(t) ? "border-signal text-signal" : "border-line text-mute"}`} onClick={() => setSkills((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t])}>{t}</button>
        ))}</p>
        <p className="text-xs text-mute">Chains: {CHAINS.slice(0, 8).map((t) => (
          <button key={t} type="button" className={`mr-1 mt-1 rounded-full border px-2 py-0.5 ${chains.includes(t) ? "border-cyan text-cyan" : "border-line text-mute"}`} onClick={() => setChains((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t])}>{t}</button>
        ))}</p>
        <Button type="submit">Save</Button>
      </form>
    </main>
  );
}

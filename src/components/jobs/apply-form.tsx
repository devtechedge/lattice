import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { submitApplication } from "@/lib/server/actions";
import { safeHttpsUrl } from "@/lib/sanitize";
import type { Role } from "@/lib/catalog/types";

export function ApplyForm({ role, onDone }: { role: Role; onDone?: () => void }) {
  const user = useCurrentUser();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.primaryEmail ?? "");
  const [github, setGithub] = useState("");
  const [cover, setCover] = useState("");
  const [answer, setAnswer] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (role.applyUrl) {
      const href = safeHttpsUrl(role.applyUrl);
      if (href) window.open(href, "_blank", "noopener,noreferrer");
      if (role.source === "ats") return;
    }
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setBusy(true);
    try {
      await submitApplication({
        data: {
          roleId: role.id,
          name,
          email,
          github,
          coverLetter: cover,
          answers: role.screeningQuestions.length ? [answer] : [],
        },
      });
      toast.success("Application filed. Track it under Me → Applications.");
      onDone?.();
    } catch {
      toast.error("Sign in to file the application.");
      window.location.href = "/login";
    } finally {
      setBusy(false);
    }
  }

  if (role.source === "ats") {
    const href = role.applyUrl ? safeHttpsUrl(role.applyUrl) : null;
    return (
      <div className="space-y-3" data-testid="apply-form">
        <p className="text-sm text-mute">This listing is live from Coinbase careers. Application happens on their site. Lattice does not collect a resume.</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-full items-center justify-center rounded-sm bg-signal text-sm font-medium text-signal-fg"
          >
            Apply on Coinbase
          </a>
        ) : (
          <p className="text-sm text-danger">Apply link unavailable.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" data-testid="apply-form">
      <div className="space-y-1">
        <Label htmlFor="an">Name</Label>
        <Input id="an" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="ae">Email</Label>
        <Input id="ae" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="ag">GitHub</Label>
        <Input id="ag" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/…" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="ac">Note</Label>
        <Textarea id="ac" required value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Six lines beat a novel." />
      </div>
      {role.screeningQuestions.map((q) => (
        <div key={q} className="space-y-1">
          <Label>{q}</Label>
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </div>
      ))}
      <Button type="submit" className="w-full" disabled={busy}>
        {role.applyUrl ? "Apply via site" : "Submit application"}
      </Button>
      <p className="text-xs text-mute">Free. No resume paywall. External apply still records a click here.</p>
    </form>
  );
}

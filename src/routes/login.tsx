import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message);
      }
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-sm place-items-center px-4 py-16">
      <div className="w-full space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-mute">Lattice</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-mute">Saving, applying, and studio tools attach to your account. Browsing stays open.</p>
        </div>
        {authEnabled ? (
          <>
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button key={p.providerId} type="button" variant="secondary" className="w-full" onClick={() => signIn(p.providerId, { callbackURL: "/" })}>
                  Continue with {p.label}
                </Button>
              ))}
            </div>
            <p className="text-center text-xs text-mute">or email</p>
            <form onSubmit={onEmail} className="space-y-3">
              {mode === "up" && (
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {mode === "up" ? "Create account" : "Sign in"}
              </Button>
            </form>
            <button type="button" className="text-sm text-mute hover:text-fg" onClick={() => setMode(mode === "up" ? "in" : "up")}>
              {mode === "up" ? "Have an account? Sign in" : "New here? Create an account"}
            </button>
          </>
        ) : (
          <p className="text-sm text-mute">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}

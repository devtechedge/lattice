import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listBookmarks, listMyApplications, listMyAlerts, listMyContracts, advanceContract, type ApplicationRow, type ContractRow } from "@/lib/server/actions";
import { ROLES } from "@/lib/catalog/data";
import { Button } from "@/components/ui/button";

const FLOW = ["funded", "in-progress", "delivered", "accepted", "released"] as const;

export const Route = createFileRoute("/me/")({ component: Page });

function Page() {
  const { user, isPending } = useCurrentUserState();
  const [saved, setSaved] = useState<string[]>([]);
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [alerts, setAlerts] = useState<{ id: string; channel: string; cadence: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    listBookmarks().then((r) => setSaved(r.map((x) => x.role_id))).catch(() => {});
    listMyApplications().then(setApps).catch(() => {});
    listMyContracts().then(setContracts).catch(() => {});
    listMyAlerts().then(setAlerts).catch(() => {});
  }, [user]);

  if (isPending) return <main className="mx-auto max-w-3xl px-4 py-16"><div className="h-40 animate-pulse rounded-md bg-raised" /></main>;
  if (!user) return <RedirectToSignIn />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Me</h1>
      <p className="mt-1 text-sm text-mute">{user.displayName ?? user.primaryEmail}</p>
      <div className="mt-4 flex gap-3 text-sm">
        <Link to="/me/profile" className="text-signal">Edit profile</Link>
        <Link to="/studio" className="text-mute hover:text-fg">Studio</Link>
        <Link to="/alerts" className="text-mute hover:text-fg">Alerts</Link>
      </div>
      <section className="mt-10">
        <h2 className="text-sm font-medium">Saved roles</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {saved.map((id) => {
            const r = ROLES.find((x) => x.id === id);
            return <li key={id}>{r ? <Link to="/roles/$slug" params={{ slug: r.slug }} className="hover:text-signal">{r.title}</Link> : id}</li>;
          })}
          {saved.length === 0 && <li className="text-mute">None yet.</li>}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="text-sm font-medium">Applications</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {apps.map((a) => (
            <li key={a.id} className="rounded-sm border border-line px-3 py-2">
              {ROLES.find((r) => r.id === a.role_id)?.title ?? a.role_id} · {a.stage}
            </li>
          ))}
          {apps.length === 0 && <li className="text-mute">None yet.</li>}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="text-sm font-medium">Contracts (demo escrow)</h2>
        <ul className="mt-2 space-y-3">
          {contracts.map((c) => {
            const payload = JSON.parse(c.payload_json) as { title?: string };
            const idx = (FLOW as readonly string[]).indexOf(c.status);
            return (
              <li key={c.id} className="rounded-md border border-line p-3">
                <p className="text-sm font-medium">{payload.title ?? c.kind}</p>
                <ol className="mt-2 flex flex-wrap gap-1 text-[11px]">
                  {FLOW.map((s, i) => (
                    <li key={s} className={i <= idx ? "text-signal" : "text-mute"}>{s}{i < FLOW.length - 1 ? " →" : ""}</li>
                  ))}
                </ol>
                {idx < FLOW.length - 1 && (
                  <Button
                    size="sm"
                    className="mt-3"
                    variant="secondary"
                    onClick={async () => {
                      const next = FLOW[idx + 1];
                      if (!next) return;
                      await advanceContract({ data: { id: c.id, status: next } });
                      setContracts((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
                    }}
                  >
                    Advance
                  </Button>
                )}
              </li>
            );
          })}
          {contracts.length === 0 && <p className="text-sm text-mute">Order a gig or propose on a contract to open one.</p>}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="text-sm font-medium">Alerts</h2>
        <ul className="mt-2 text-sm text-mute">
          {alerts.map((a) => <li key={a.id}>{a.channel} · {a.cadence}</li>)}
          {alerts.length === 0 && <li>None. Build one on Alerts.</li>}
        </ul>
      </section>
    </main>
  );
}

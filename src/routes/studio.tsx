import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listMyPostedRoles, listStudioApplications, setApplicationStage, type ApplicationRow, type PostedRow } from "@/lib/server/actions";
import { Button } from "@/components/ui/button";

const STAGES = ["applied", "screen", "interview", "offer", "hired", "rejected"] as const;

export const Route = createFileRoute("/studio")({ component: Page });

function Page() {
  const { user, isPending } = useCurrentUserState();
  const [posts, setPosts] = useState<PostedRow[]>([]);
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [open, setOpen] = useState<ApplicationRow | null>(null);

  useEffect(() => {
    if (!user) return;
    listMyPostedRoles().then(setPosts).catch(() => {});
    listStudioApplications().then(setApps).catch(() => {});
  }, [user]);

  if (isPending) return <main className="mx-auto max-w-6xl px-4 py-16"><div className="h-40 animate-pulse rounded-md bg-raised" /></main>;
  if (!user) return <RedirectToSignIn />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Studio</h1>
          <p className="mt-1 text-sm text-mute">ATS for roles you posted. Free.</p>
        </div>
        <Link to="/post/role"><Button size="sm">Post a role</Button></Link>
      </div>
      <section className="mt-8">
        <h2 className="text-sm font-medium">Your roles</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {posts.map((p) => {
            const payload = JSON.parse(p.payload_json) as { title?: string };
            return <li key={p.id}><Link to="/roles/$slug" params={{ slug: p.id }} className="hover:text-signal">{payload.title ?? p.id}</Link></li>;
          })}
          {posts.length === 0 && <li className="text-mute">None yet.</li>}
        </ul>
      </section>
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Applicants</h2>
          <button
            type="button"
            className="text-xs text-mute hover:text-fg"
            onClick={() => {
              const blob = new Blob([JSON.stringify(apps, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "lattice-applications.json";
              a.click();
            }}
          >
            Export JSON
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          {STAGES.filter((s) => s !== "hired" && s !== "rejected").map((stage) => (
            <div key={stage} className="rounded-md border border-line bg-raised p-2">
              <p className="px-1 text-[11px] uppercase tracking-wider text-mute">{stage}</p>
              <ul className="mt-2 space-y-2">
                {apps.filter((a) => a.stage === stage).map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => setOpen(a)} className="w-full rounded-sm border border-line px-2 py-2 text-left text-xs hover:border-line-strong">
                      {a.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-bg/70 p-4" onClick={() => setOpen(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-md border border-line bg-raised p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium">{open.name}</h3>
            <p className="text-sm text-mute">{open.email} · {open.github}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{open.cover_letter}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === open.stage ? "primary" : "secondary"}
                  onClick={async () => {
                    await setApplicationStage({ data: { id: open.id, stage: s } });
                    setApps((prev) => prev.map((x) => (x.id === open.id ? { ...x, stage: s } : x)));
                    setOpen({ ...open, stage: s });
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

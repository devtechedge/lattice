import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { COMPANIES, ROLES } from "@/lib/catalog/data";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import { COMPANY_TYPES, SCENES } from "@/lib/catalog/types";

export const Route = createFileRoute("/companies/")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [scene, setScene] = useState("");
  const [hiring, setHiring] = useState(false);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    ROLES.forEach((r) => m.set(r.companyId, (m.get(r.companyId) ?? 0) + 1));
    return m;
  }, []);
  const list = COMPANIES.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()))
    .filter((c) => !type || c.type === type)
    .filter((c) => !scene || c.scenes.includes(scene as never))
    .filter((c) => !hiring || (counts.get(c.id) ?? 0) > 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Companies</h1>
      <p className="mt-2 text-sm text-mute">{COMPANIES.length} teams. {ROLES.length} open roles.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams" className="h-10 rounded-sm border border-line bg-raised px-3 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-sm border border-line bg-raised px-3 text-sm">
          <option value="">Type</option>
          {COMPANY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={scene} onChange={(e) => setScene(e.target.value)} className="h-10 rounded-sm border border-line bg-raised px-3 text-sm">
          <option value="">Scene</option>
          {SCENES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-mute"><input type="checkbox" checked={hiring} onChange={(e) => setHiring(e.target.checked)} /> Hiring now</label>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((c) => (
          <Link key={c.id} to="/companies/$slug" params={{ slug: c.slug }} className="flex gap-3 rounded-md border border-line bg-raised p-4 hover:border-line-strong">
            <CompanyMark name={c.name} hue={c.hue} />
            <div>
              <p className="font-medium">{c.name} {c.verified && <span className="text-gold">●</span>}</p>
              <p className="text-sm text-mute">{c.type} · {c.hq} · {c.size} · {counts.get(c.id) ?? 0} open</p>
              <div className="mt-2 flex gap-1">{c.scenes.map((s) => <Badge key={s} tone="cyan">{s}</Badge>)}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

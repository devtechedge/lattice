import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPANIES } from "@/lib/catalog/data";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/job-card";
import { BENEFIT_LABEL } from "@/lib/catalog/types";
import { useLiveRoles } from "@/lib/catalog/use-live-roles";

export const Route = createFileRoute("/companies/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const c = COMPANIES.find((x) => x.slug === slug);
  const { live, ready } = useLiveRoles();
  if (!c) return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-3xl">Not found</h1></main>;
  const roles = live.filter((r) => r.companyId === c.id);
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start gap-4">
        <CompanyMark name={c.name} logoUrl={c.logo} website={c.website} hue={c.hue} size={56} />
        <div>
          <h1 className="font-serif text-3xl tracking-tight">{c.name}</h1>
          <p className="text-sm text-mute">{c.type} · {c.hq} · {c.size} · founded {c.foundedYear} {c.tokenTicker ? `· ${c.tokenTicker}` : ""}</p>
        </div>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-mute">{c.about}</p>
      <p className="mt-3 text-xs uppercase tracking-wider text-cyan">
        {!ready ? "Loading live roles…" : `${roles.length} live roles from ${c.name}’s public board`}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {c.chains.map((x) => <Badge key={x}>{x}</Badge>)}
        {c.scenes.map((x) => <Badge key={x} tone="cyan">{x}</Badge>)}
      </div>
      <p className="mt-4 text-sm text-mute">Benefits: {c.benefits.map((b) => BENEFIT_LABEL[b]).join(" · ")}</p>
      <p className="mt-2 text-sm">
        <a className="text-signal" href={c.website} target="_blank" rel="noopener noreferrer">{c.website}</a>
      </p>
      <h2 className="mt-10 text-sm font-medium">Open roles</h2>
      <div className="mt-3 grid gap-3">
        {roles.map((r) => <JobCard key={r.id} role={r} company={c} />)}
        {roles.length === 0 && <p className="text-sm text-mute">{!ready ? "Fetching the public board…" : "No live roles on the public board right now."}</p>}
      </div>
      <p className="mt-6 text-sm"><Link to="/companies" className="text-mute hover:text-fg">All companies</Link></p>
    </main>
  );
}

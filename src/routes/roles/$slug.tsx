import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { ApplyForm } from "@/components/jobs/apply-form";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/lib/markdown";
import { COMPANIES, companyById } from "@/lib/catalog/data";
import { BENEFIT_LABEL, REMOTE_LABEL } from "@/lib/catalog/types";
import { formatUsd, timeAgo } from "@/lib/utils";
import { formatPay } from "@/lib/catalog/salary-ats";
import { listBookmarks, listPostedRoles, toggleBookmark } from "@/lib/server/actions";
import { getLiveRole, listLiveRoles } from "@/lib/server/live";
import { parseLiveSlug } from "@/lib/catalog/greenhouse";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import type { Role } from "@/lib/catalog/types";
import { pageHead } from "@/lib/seo";

const COMPANY_IDS = COMPANIES.map((c) => c.id);

export const Route = createFileRoute("/roles/$slug")({
  head: () =>
    pageHead({
      title: "Role — Lattice",
      path: "/roles",
      description: "Live Web3 role from a public employer board. Apply on the employer’s site. Lattice does not invent pay.",
    }),
  component: RolePage,
});

function RolePage() {
  const { slug } = Route.useParams();
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [pending, setPending] = useState(true);
  const [saved, setSaved] = useState(false);
  const [similarLive, setSimilarLive] = useState<Role[]>([]);
  const user = useCurrentUser();
  const company = role ? companyById(role.companyId) ?? COMPANIES.find((c) => c.id === role.companyId) : undefined;

  useEffect(() => {
    let on = true;
    setPending(true);
    setRole(undefined);
    const load = parseLiveSlug(slug, COMPANY_IDS)
      ? getLiveRole({ data: { slug } }).then((r) => {
          if (on) setRole(r ?? undefined);
        })
      : listPostedRoles().then((rows) => {
          const hit = rows.find((r) => r.id === slug);
          if (on && hit) setRole(JSON.parse(hit.payload_json) as Role);
        });
    load.catch(() => {
      if (on) setRole(undefined);
    }).finally(() => {
      if (on) setPending(false);
    });
    return () => {
      on = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!role || role.source !== "ats") return;
    listLiveRoles()
      .then((rows) =>
        setSimilarLive(
          rows
            .filter((r) => r.id !== role.id && (r.companyId === role.companyId || r.department === role.department))
            .slice(0, 4),
        ),
      )
      .catch(() => setSimilarLive([]));
  }, [role]);

  useEffect(() => {
    if (!user || !role) return;
    listBookmarks()
      .then((rows) => setSaved(rows.some((r) => r.role_id === role.id)))
      .catch(() => {});
  }, [user, role]);

  if (!role) {
    if (pending) {
      return <main className="mx-auto max-w-3xl px-4 py-16"><div className="h-40 animate-pulse rounded-md bg-raised" /></main>;
    }
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-3xl">Role not found</h1>
        <Link to="/roles" className="mt-4 inline-block text-sm text-signal">Back to roles</Link>
      </main>
    );
  }

  const similar = role.source === "ats" ? similarLive : [];

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <article>
        <div className="flex items-start gap-3">
          <CompanyMark name={company?.name ?? "Role"} logoUrl={company?.logo} website={company?.website} hue={company?.hue ?? 140} size={48} />
          <div>
            {role.featured && <p className="text-[11px] font-medium text-gold">Featured</p>}
            {role.source === "ats" && (
              <p className="text-[11px] uppercase tracking-wider text-cyan">Live from {company?.name ?? "the employer"}</p>
            )}
            <h1 className="font-serif text-3xl tracking-tight">{role.title}</h1>
            <p className="mt-1 text-sm text-mute">
              {company ? (
                <Link to="/companies/$slug" params={{ slug: company.slug }} className="hover:text-fg">{company.name}</Link>
              ) : (
                "Independent"
              )}
              {" · "}
              {timeAgo(role.publishedAt)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge>{role.type}</Badge>
          <Badge>{role.seniority}</Badge>
          <Badge>{role.locationMode === "remote" && role.remoteRegion ? REMOTE_LABEL[role.remoteRegion] : role.locations[0] ?? role.locationMode}</Badge>
          {role.scenes.map((s) => <Badge key={s} tone="cyan">{s}</Badge>)}
          {role.chains.map((c) => <Badge key={c}>{c}</Badge>)}
          {role.tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </div>
        <div className="mt-8 overflow-hidden rounded-md border border-line">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-line">
                <td className="px-3 py-2 text-mute">Cash</td>
                <td className="px-3 py-2 font-mono tabular-nums">
                  {role.source === "ats" ? (
                    <>
                      {formatPay(
                        role.salaryMin != null ? Math.round(role.salaryMin * 100) : null,
                        role.salaryMax != null ? Math.round(role.salaryMax * 100) : null,
                        role.salaryCurrency,
                        role.salarySource ?? "none",
                      )}
                      {role.salarySource === "inferred" && (
                        <span className="mt-1 block text-xs font-sans text-mute">Inferred from posting text. Not an offer.</span>
                      )}
                    </>
                  ) : role.salaryMin && role.salaryMax ? (
                    `${formatUsd(role.salaryMin)} – ${formatUsd(role.salaryMax)} / ${role.salaryPeriod}`
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-3 py-2 text-mute">Token</td>
                <td className="px-3 py-2">
                  {role.tokenAllocation && role.tokenTicker ? (
                    <span>
                      {role.tokenAllocation.toLocaleString()} {role.tokenTicker} · {role.cliffMonths}m cliff / {role.vestingMonths}m vest
                      <span className="mt-1 block text-xs text-mute">Cash below market often means tokens do the work. Check cliff, vest, and TGE.</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-3 py-2 text-mute">Equity</td>
                <td className="px-3 py-2 font-mono">{role.equityMin != null ? `${role.equityMin}% – ${role.equityMax}%` : "—"}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-mute">Benefits</td>
                <td className="px-3 py-2">{role.benefits.map((b) => BENEFIT_LABEL[b]).join(" · ") || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-8 max-w-2xl">
          <Markdown source={role.descriptionMarkdown} />
        </div>
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-medium">Similar roles</h2>
            <ul className="mt-3 space-y-2">
              {similar.map((s) => (
                <li key={s.id}>
                  <Link to="/roles/$slug" params={{ slug: s.slug }} className="text-sm hover:text-signal">{s.title}</Link>
                  <span className="text-xs text-mute"> · {companyById(s.companyId)?.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-md border border-line bg-raised p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium">Apply</p>
            <button
              type="button"
              className="grid size-10 place-items-center"
              aria-label="Bookmark"
              onClick={async () => {
                try {
                  const res = await toggleBookmark({ data: { roleId: role.id } });
                  setSaved(res.saved);
                } catch {
                  window.location.href = "/login";
                }
              }}
            >
              <Bookmark className={saved ? "size-4 fill-signal text-signal" : "size-4"} />
            </button>
          </div>
          <ApplyForm role={role} />
        </div>
        <div className="sticky bottom-0 mt-3 flex gap-2 border-t border-line bg-bg p-3 lg:hidden">
          <Button className="flex-1" onClick={() => document.querySelector("[data-testid=apply-form]")?.scrollIntoView({ behavior: "smooth" })}>Apply</Button>
        </div>
      </aside>
    </main>
  );
}

import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import type { Company, Role } from "@/lib/catalog/types";
import { REMOTE_LABEL } from "@/lib/catalog/types";
import { estimateSalary } from "@/lib/catalog/salary";
import { formatPay } from "@/lib/catalog/salary-ats";
import { formatCompactUsd, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function salaryLabel(role: Role): { text: string; inferred?: boolean; estimate?: boolean } {
  if (role.source === "ats") {
    return {
      text: formatPay(
        role.salaryMin != null ? Math.round(role.salaryMin * 100) : null,
        role.salaryMax != null ? Math.round(role.salaryMax * 100) : null,
        role.salaryCurrency,
        role.salarySource ?? "none",
      ),
      inferred: role.salarySource === "inferred",
    };
  }
  if (role.salaryMin && role.salaryMax) {
    return { text: `${formatCompactUsd(role.salaryMin)} – ${formatCompactUsd(role.salaryMax)}` };
  }
  const est = estimateSalary({ department: role.department, seniority: role.seniority, remoteRegion: role.remoteRegion });
  return { text: `${formatCompactUsd(est.min)} – ${formatCompactUsd(est.max)}`, estimate: true };
}

export function JobCard({
  role,
  company,
  saved,
  onToggleSave,
}: {
  role: Role;
  company?: Company;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
}) {
  const sal = salaryLabel(role);
  const location =
    role.locations[0] ??
    (role.locationMode === "remote" && role.remoteRegion ? REMOTE_LABEL[role.remoteRegion] : role.locationMode);
  return (
    <article
      data-testid="job-card"
      className={cn(
        "relative flex h-[7.25rem] flex-col justify-between overflow-hidden rounded-md border border-line bg-raised p-4 transition-colors hover:border-line-strong",
        role.featured && "shadow-[inset_3px_0_0_0_var(--gold)]",
      )}
    >
      <div className="flex gap-3">
        <CompanyMark name={company?.name ?? role.title} website={company?.website} hue={company?.hue ?? 140} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="h-3.5 text-[11px] font-medium uppercase tracking-wider text-cyan">
                {role.source === "ats" ? `Live · ${company?.name ?? "ATS"}` : role.featured ? "Featured" : " "}
              </p>
              <Link
                to="/roles/$slug"
                params={{ slug: role.slug }}
                className="mt-0.5 line-clamp-2 min-h-[2.5rem] font-medium leading-snug hover:text-signal"
              >
                {role.title}
              </Link>
              <p className="truncate text-sm text-mute">{company?.name ?? "Independent"}</p>
            </div>
            <button
              type="button"
              aria-label={saved ? "Remove bookmark" : "Bookmark"}
              onClick={() => onToggleSave?.(role.id)}
              className="grid size-10 shrink-0 place-items-center text-mute hover:text-signal"
            >
              <Bookmark className={cn("size-4", saved && "fill-signal text-signal")} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-2 flex h-6 items-center gap-1.5 overflow-hidden">
        <span
          className={cn(
            "shrink-0 font-mono text-sm tabular-nums",
            (sal.inferred || sal.estimate) && "text-mute underline decoration-dashed decoration-mute/50 underline-offset-4",
          )}
          title={
            sal.inferred
              ? "Inferred from posting text. Not an offer."
              : sal.estimate
                ? "Estimated from Lattice’s observatory for this role, seniority, and region. Not an offer."
                : undefined
          }
        >
          {sal.text}
        </span>
        <Badge>{location}</Badge>
        <Badge>{role.type}</Badge>
        {role.scenes[0] ? <Badge tone="cyan">{role.scenes[0]}</Badge> : null}
        {role.tags.slice(0, 2).map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
        <span className="ml-auto shrink-0 font-mono text-[11px] text-mute">{timeAgo(role.publishedAt)}</span>
      </div>
    </article>
  );
}

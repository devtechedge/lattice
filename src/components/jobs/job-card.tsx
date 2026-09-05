import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import type { Company, Role } from "@/lib/catalog/types";
import { REMOTE_LABEL } from "@/lib/catalog/types";
import { estimateSalary } from "@/lib/catalog/salary";
import { formatCompactUsd, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function salaryLabel(role: Role) {
  if (role.salaryMin && role.salaryMax) {
    return `${formatCompactUsd(role.salaryMin)} – ${formatCompactUsd(role.salaryMax)}`;
  }
  if (role.source === "ats") return "Not disclosed";
  const est = estimateSalary({ department: role.department, seniority: role.seniority, remoteRegion: role.remoteRegion });
  return { estimate: `${formatCompactUsd(est.min)} – ${formatCompactUsd(est.max)}` };
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
  return (
    <article
      data-testid="job-card"
      className={cn(
        "relative rounded-md border border-line bg-raised p-4 pl-4 transition-colors hover:border-line-strong",
        role.featured && "pl-3.5 shadow-[inset_3px_0_0_0_var(--gold)]",
      )}
    >
      <div className="flex gap-3">
        <CompanyMark name={company?.name ?? role.title} hue={company?.hue ?? 140} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {role.featured && <p className="text-[11px] font-medium text-gold">Featured</p>}
              {role.source === "ats" && <p className="text-[11px] uppercase tracking-wider text-cyan">Live · {company?.name ?? "ATS"}</p>}
              <Link to="/roles/$slug" params={{ slug: role.slug }} className="block truncate font-medium hover:text-signal">
                {role.title}
              </Link>
              <p className="truncate text-sm text-mute">{company?.name ?? "Independent"}</p>
            </div>
            <button
              type="button"
              aria-label={saved ? "Remove bookmark" : "Bookmark"}
              onClick={() => onToggleSave?.(role.id)}
              className="grid size-10 place-items-center text-mute hover:text-signal"
            >
              <Bookmark className={cn("size-4", saved && "fill-signal text-signal")} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {typeof sal === "string" ? (
              <span className="font-mono text-sm tabular-nums">{sal}</span>
            ) : (
              <span className="font-mono text-sm tabular-nums text-mute underline decoration-dashed decoration-mute/50 underline-offset-4" title="Estimated from Lattice’s observatory for this role, seniority, and region. Not an offer.">
                {sal.estimate}
              </span>
            )}
            <Badge>{role.locations[0] ?? (role.locationMode === "remote" && role.remoteRegion ? REMOTE_LABEL[role.remoteRegion] : role.locationMode)}</Badge>
            <Badge>{role.type}</Badge>
            <Badge tone="cyan">{role.scenes[0]}</Badge>
            {role.tags.slice(0, 3).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
            {role.tags.length > 3 && <Badge>+{role.tags.length - 3}</Badge>}
            <span className="ml-auto font-mono text-[11px] text-mute">{timeAgo(role.publishedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import type { Company, Role } from "@/lib/catalog/types";
import { REMOTE_LABEL } from "@/lib/catalog/types";
import { formatCompactUsd, timeAgo } from "@/lib/utils";
import { salaryLabel } from "./job-card";
import { cn } from "@/lib/utils";

export function JobTable({
  roles,
  companies,
  saved,
  onToggleSave,
}: {
  roles: Role[];
  companies: Map<string, Company>;
  saved: Set<string>;
  onToggleSave?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="sticky top-0 bg-raised text-[11px] uppercase tracking-wider text-mute">
          <tr className="border-b border-line">
            <th className="px-3 py-2 font-medium">Role</th>
            <th className="px-3 py-2 font-medium">Company</th>
            <th className="px-3 py-2 font-medium">Salary</th>
            <th className="px-3 py-2 font-medium">Location</th>
            <th className="px-3 py-2 font-medium">Tags</th>
            <th className="px-3 py-2 font-medium">Posted</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => {
            const c = companies.get(r.companyId);
            const sal = salaryLabel(r);
            return (
              <tr key={r.id} className={cn("border-b border-line hover:bg-raised", r.featured && "bg-raised")}>
                <td className="px-3 py-2.5">
                  <Link to="/roles/$slug" params={{ slug: r.slug }} className="font-medium hover:text-signal">
                    {r.title}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-mute">{c?.name ?? "—"}</td>
                <td className="px-3 py-2.5 font-mono tabular-nums">{typeof sal === "string" ? sal : <span className="text-mute underline decoration-dashed">{sal.estimate}</span>}</td>
                <td className="px-3 py-2.5 text-mute">{r.locationMode === "remote" && r.remoteRegion ? REMOTE_LABEL[r.remoteRegion] : r.locations[0] ?? r.locationMode}</td>
                <td className="px-3 py-2.5 text-mute">{r.tags.slice(0, 3).join(", ")}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-mute">{timeAgo(r.publishedAt)}</td>
                <td>
                  <button type="button" className="grid size-10 place-items-center" onClick={() => onToggleSave?.(r.id)} aria-label="Bookmark">
                    <Bookmark className={cn("size-4", saved.has(r.id) && "fill-signal text-signal")} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

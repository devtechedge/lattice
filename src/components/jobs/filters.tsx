import {
  BENEFITS,
  BENEFIT_LABEL,
  CHAINS,
  CITIES,
  DEPARTMENTS,
  DEPARTMENT_LABEL,
  REMOTE_REGIONS,
  REMOTE_LABEL,
  ROLE_TYPES,
  SCENES,
  SENIORITIES,
  type RoleFilters,
} from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] capitalize transition-colors",
        active ? "border-signal bg-signal text-signal-fg" : "border-line text-mute hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function toggle<T extends string>(arr: T[] | undefined, v: T): T[] | undefined {
  const set = new Set(arr ?? []);
  if (set.has(v)) set.delete(v);
  else set.add(v);
  const next = [...set];
  return next.length ? next : undefined;
}

export function RoleFiltersBar({
  value,
  onChange,
  extra,
}: {
  value: RoleFilters;
  onChange: (f: RoleFilters) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <input
          value={value.q ?? ""}
          onChange={(e) => onChange({ ...value, q: e.target.value || undefined })}
          placeholder="Role, company, or keyword"
          className="h-10 flex-1 rounded-sm border border-line bg-raised px-3 text-sm"
        />
        <select
          value={value.sort ?? "newest"}
          onChange={(e) => onChange({ ...value, sort: e.target.value as RoleFilters["sort"] })}
          className="h-10 rounded-sm border border-line bg-raised px-3 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="featured">Featured first</option>
          <option value="salary-desc">Salary high → low</option>
          <option value="salary-asc">Salary low → high</option>
          <option value="company">Company A–Z</option>
        </select>
        {extra}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DEPARTMENTS.map((d) => (
          <Chip key={d} active={!!value.department?.includes(d)} onClick={() => onChange({ ...value, department: toggle(value.department, d) })}>
            {DEPARTMENT_LABEL[d]}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SENIORITIES.map((d) => (
          <Chip key={d} active={!!value.seniority?.includes(d)} onClick={() => onChange({ ...value, seniority: toggle(value.seniority, d) })}>
            {d}
          </Chip>
        ))}
        {ROLE_TYPES.map((d) => (
          <Chip key={d} active={!!value.type?.includes(d)} onClick={() => onChange({ ...value, type: toggle(value.type, d) })}>
            {d}
          </Chip>
        ))}
        {REMOTE_REGIONS.map((d) => (
          <Chip key={d} active={!!value.remoteRegion?.includes(d)} onClick={() => onChange({ ...value, remoteRegion: toggle(value.remoteRegion, d) })}>
            {REMOTE_LABEL[d]}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            [undefined, "Any time"],
            ["24h", "24h"],
            ["7d", "7d"],
            ["30d", "30d"],
          ] as const
        ).map(([k, label]) => (
          <Chip key={label} active={value.postedWithin === k} onClick={() => onChange({ ...value, postedWithin: k })}>
            {label}
          </Chip>
        ))}
        {(
          [
            [undefined, "Any salary"],
            [80000, "$80k+"],
            [120000, "$120k+"],
            [160000, "$160k+"],
          ] as const
        ).map(([n, label]) => (
          <Chip key={label} active={value.salaryMin === n} onClick={() => onChange({ ...value, salaryMin: n })}>
            {label}
          </Chip>
        ))}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-mute">More filters — chains, scenes, benefits, cities</summary>
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {CHAINS.map((d) => (
              <Chip key={d} active={!!value.chain?.includes(d)} onClick={() => onChange({ ...value, chain: toggle(value.chain, d) })}>
                {d}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SCENES.map((d) => (
              <Chip key={d} active={!!value.scene?.includes(d)} onClick={() => onChange({ ...value, scene: toggle(value.scene, d) })}>
                {d}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BENEFITS.map((d) => (
              <Chip key={d} active={!!value.benefit?.includes(d)} onClick={() => onChange({ ...value, benefit: toggle(value.benefit, d) })}>
                {BENEFIT_LABEL[d]}
              </Chip>
            ))}
            <Chip active={!!value.payInCrypto} onClick={() => onChange({ ...value, payInCrypto: value.payInCrypto ? undefined : true })}>
              Pay in crypto
            </Chip>
            <Chip active={!!value.salaryDisclosed} onClick={() => onChange({ ...value, salaryDisclosed: value.salaryDisclosed ? undefined : true })}>
              Salary disclosed
            </Chip>
            <Chip active={!!value.featured} onClick={() => onChange({ ...value, featured: value.featured ? undefined : true })}>
              Featured
            </Chip>
            <Chip active={!!value.visa} onClick={() => onChange({ ...value, visa: value.visa ? undefined : true })}>
              Visa
            </Chip>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CITIES.map((d) => (
              <Chip key={d} active={!!value.city?.includes(d)} onClick={() => onChange({ ...value, city: toggle(value.city, d) })}>
                {d}
              </Chip>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}

export function ActiveChips({ value, onChange }: { value: RoleFilters; onChange: (f: RoleFilters) => void }) {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  const push = (arr: string[] | undefined, field: keyof RoleFilters) => {
    arr?.forEach((v) =>
      chips.push({
        key: `${String(field)}-${v}`,
        label: v,
        clear: () => onChange({ ...value, [field]: arr.filter((x) => x !== v).length ? arr.filter((x) => x !== v) : undefined }),
      }),
    );
  };
  push(value.department, "department");
  push(value.seniority, "seniority");
  push(value.type, "type");
  push(value.chain, "chain");
  push(value.scene, "scene");
  push(value.remoteRegion, "remoteRegion");
  push(value.tag, "tag");
  push(value.benefit, "benefit");
  push(value.city, "city");
  if (value.q) chips.push({ key: "q", label: `“${value.q}”`, clear: () => onChange({ ...value, q: undefined }) });
  if (value.payInCrypto) chips.push({ key: "crypto", label: "pay in crypto", clear: () => onChange({ ...value, payInCrypto: undefined }) });
  if (value.salaryDisclosed) chips.push({ key: "disc", label: "salary disclosed", clear: () => onChange({ ...value, salaryDisclosed: undefined }) });
  if (value.featured) chips.push({ key: "feat", label: "featured", clear: () => onChange({ ...value, featured: undefined }) });
  if (value.visa) chips.push({ key: "visa", label: "visa", clear: () => onChange({ ...value, visa: undefined }) });
  if (value.postedWithin) chips.push({ key: "posted", label: value.postedWithin, clear: () => onChange({ ...value, postedWithin: undefined }) });
  if (value.salaryMin) chips.push({ key: "sal", label: `$${Math.round(value.salaryMin / 1000)}k+`, clear: () => onChange({ ...value, salaryMin: undefined }) });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <button key={c.key} type="button" onClick={c.clear} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-mute hover:text-fg">
          {c.label} ×
        </button>
      ))}
      <button type="button" className="text-[11px] text-signal" onClick={() => onChange({ sort: value.sort, view: value.view })}>
        Clear
      </button>
    </div>
  );
}

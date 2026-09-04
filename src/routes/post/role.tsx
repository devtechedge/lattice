import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { CHAINS, DEPARTMENTS, DEPARTMENT_LABEL, ROLE_TYPES, SCENES, SENIORITIES, LOCATION_MODES, REMOTE_REGIONS } from "@/lib/catalog/types";
import { publishRole, publishRoleAuthed } from "@/lib/server/actions";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Markdown } from "@/lib/markdown";

export const Route = createFileRoute("/post/role")({ component: Page });

function Page() {
  const nav = useNavigate();
  const user = useCurrentUser();
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [department, setDepartment] = useState("engineering");
  const [seniority, setSeniority] = useState("senior");
  const [type, setType] = useState("full-time");
  const [locationMode, setLocationMode] = useState("remote");
  const [remoteRegion, setRemoteRegion] = useState("global");
  const [desc, setDesc] = useState("## The role\n\nWrite the work, the constraints, and how to apply.\n");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [tokenAllocation, setTokenAllocation] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title,
      companyName,
      department,
      seniority,
      type,
      locationMode,
      remoteRegion: locationMode === "remote" ? remoteRegion : undefined,
      chains: ["ethereum"],
      scenes: ["crypto"],
      tags: ["blockchain"],
      descriptionMarkdown: desc,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      tokenTicker: tokenTicker || undefined,
      tokenAllocation: tokenAllocation ? Number(tokenAllocation) : undefined,
      vestingMonths: tokenTicker ? 24 : undefined,
      cliffMonths: tokenTicker ? 6 : undefined,
      applyEmail: email || undefined,
    };
    try {
      const res = user ? await publishRoleAuthed({ data: payload }) : await publishRole({ data: payload });
      toast.success("Published. It’s live on Lattice — no invoice, no auction, no 30-day upsell.");
      nav({ to: "/roles/$slug", params: { slug: res.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm text-mute">Free tier: unlimited roles. Preview before publish. No account required.</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">Post a role</h1>
      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Title" value={title} onChange={setTitle} required />
          <Field label="Company" value={companyName} onChange={setCompanyName} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Department" value={department} onChange={setDepartment} options={DEPARTMENTS.map((d) => [d, DEPARTMENT_LABEL[d]])} />
            <Select label="Seniority" value={seniority} onChange={setSeniority} options={SENIORITIES.map((d) => [d, d])} />
            <Select label="Type" value={type} onChange={setType} options={ROLE_TYPES.map((d) => [d, d])} />
            <Select label="Location" value={locationMode} onChange={setLocationMode} options={LOCATION_MODES.map((d) => [d, d])} />
          </div>
          {locationMode === "remote" && <Select label="Remote region" value={remoteRegion} onChange={setRemoteRegion} options={REMOTE_REGIONS.map((d) => [d, d])} />}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary min (USD)" value={salaryMin} onChange={setSalaryMin} />
            <Field label="Salary max (USD)" value={salaryMax} onChange={setSalaryMax} />
            <Field label="Token ticker" value={tokenTicker} onChange={setTokenTicker} />
            <Field label="Token allocation" value={tokenAllocation} onChange={setTokenAllocation} />
          </div>
          <Field label="Apply email" value={email} onChange={setEmail} />
          <div className="space-y-1">
            <Label>Description (Markdown)</Label>
            <Textarea className="min-h-48" value={desc} onChange={(e) => setDesc(e.target.value)} required />
          </div>
          <Button type="submit" disabled={busy}>Publish</Button>
        </div>
        <div className="rounded-md border border-line bg-raised p-4">
          <p className="text-xs uppercase tracking-wider text-mute">Preview</p>
          <h2 className="mt-2 font-serif text-2xl">{title || "Role title"}</h2>
          <p className="text-sm text-mute">{companyName || "Company"}</p>
          <div className="mt-4 max-w-none text-sm">
            <Markdown source={desc} />
          </div>
        </div>
      </form>
      <p className="mt-6 text-xs text-mute">Also: {CHAINS.slice(0, 4).join(", ")} · {SCENES.join(", ")}</p>
    </main>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] | string[][] }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-sm border border-line bg-raised px-3 text-sm">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

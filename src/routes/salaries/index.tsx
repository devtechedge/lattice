import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcComp, REGIONS, ROLE_KEY_LABEL, ROLE_KEYS, salaryMatrix, seriesFor, type RoleKey } from "@/lib/catalog/salary";
import type { Seniority } from "@/lib/catalog/types";
import { SENIORITIES } from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatUsd } from "@/lib/utils";
import { submitSalary } from "@/lib/server/actions";
import { toast } from "sonner";

export const Route = createFileRoute("/salaries/")({ component: Page });

function Page() {
  const [role, setRole] = useState<RoleKey>("solidity");
  const [sen, setSen] = useState<Seniority>("senior");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("Europe");
  const matrix = useMemo(() => salaryMatrix(2026), []);
  const rows = matrix.filter((r) => r.roleKey === role && r.seniority === sen);
  const focus = rows.find((r) => r.region === region) ?? rows[0];
  const na = rows.find((r) => r.region === "North America");
  const series = seriesFor(role, sen, region);
  const [cash, setCash] = useState(90000);
  const [alloc, setAlloc] = useState(40000);
  const [price, setPrice] = useState(1);
  const [vest, setVest] = useState(24);
  const [cliff, setCliff] = useState(6);
  const [eq, setEq] = useState(0.15);
  const [mark, setMark] = useState(80_000_000);
  const result = calcComp({ cash, tokenAllocation: alloc, impliedPrice: price, vestingMonths: vest, cliffMonths: cliff, equityPct: eq, companyMark: mark });
  const p50 = focus?.avg ?? 0;
  const band = result.year1Total < p50 * 0.9 ? "below" : result.year1Total > p50 * 1.1 ? "above" : "at";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Salaries</h1>
      <p className="mt-2 max-w-2xl text-sm text-mute">Observatory by role, seniority, and region. Calculator applies cliff before vest. Estimated figures are not offers.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <select value={role} onChange={(e) => setRole(e.target.value as RoleKey)} className="h-10 rounded-sm border border-line bg-raised px-3 text-sm">
          {ROLE_KEYS.map((k) => <option key={k} value={k}>{ROLE_KEY_LABEL[k]}</option>)}
        </select>
        <select value={sen} onChange={(e) => setSen(e.target.value as Seniority)} className="h-10 rounded-sm border border-line bg-raised px-3 text-sm">
          {SENIORITIES.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value as (typeof REGIONS)[number])} className="h-10 rounded-sm border border-line bg-raised px-3 text-sm">
          {REGIONS.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      {focus && (
        <p className="mt-4 text-sm text-mute">
          {ROLE_KEY_LABEL[role]} · {sen} · {region}: avg <span className="font-mono text-fg">{formatUsd(focus.avg)}</span>
          {na ? <> · North America {formatUsd(na.avg)}</> : null}
        </p>
      )}
      <div className="mt-6 h-56 rounded-md border border-line bg-raised p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <XAxis dataKey="year" stroke="currentColor" tick={{ fontSize: 11 }} />
            <YAxis stroke="currentColor" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v) => formatUsd(Number(v))} />
            <Line type="monotone" dataKey="avg" stroke="#b6f75d" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-mute">
            <tr className="border-b border-line">
              <th className="sticky left-0 bg-bg px-3 py-2">Region</th>
              <th className="px-3 py-2">Avg</th>
              <th className="px-3 py-2">Min</th>
              <th className="px-3 py-2">Max</th>
              <th className="px-3 py-2">n</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.region} className="border-b border-line">
                <td className="sticky left-0 bg-bg px-3 py-2">{r.region}</td>
                <td className="px-3 py-2 font-mono tabular-nums">{formatUsd(r.avg)}</td>
                <td className="px-3 py-2 font-mono tabular-nums">{formatUsd(r.min)}</td>
                <td className="px-3 py-2 font-mono tabular-nums">{formatUsd(r.max)}</td>
                <td className="px-3 py-2 font-mono text-mute">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3 rounded-md border border-line bg-raised p-4">
          <h2 className="font-medium">Calculator</h2>
          <p className="text-xs text-mute">After cliff, year-1 token value = allocation × implied price × (months vested in year 1 / vesting months). Fully-diluted = cash + full token + equity mark.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cash" value={cash} onChange={setCash} />
            <Field label="Token allocation" value={alloc} onChange={setAlloc} />
            <Field label="Implied price" value={price} onChange={setPrice} step={0.01} />
            <Field label="Vest months" value={vest} onChange={setVest} />
            <Field label="Cliff months" value={cliff} onChange={setCliff} />
            <Field label="Equity %" value={eq} onChange={setEq} step={0.01} />
            <Field label="Company mark" value={mark} onChange={setMark} />
          </div>
        </div>
        <div className="rounded-md border border-line bg-raised p-4">
          <h2 className="font-medium">Result</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="Year-1 token" v={formatUsd(result.year1Token)} />
            <Row k="Year-1 total" v={formatUsd(result.year1Total)} />
            <Row k="Fully diluted" v={formatUsd(result.fullyDiluted)} />
            <Row k="Months vested in year 1" v={`${result.vestedMonthsYear1}`} />
          </dl>
          <p className="mt-4 rounded-sm border border-line px-3 py-2 text-sm">
            This is <span className="text-signal">{band}</span> Lattice P50 for {ROLE_KEY_LABEL[role]} · {sen} · {region} ({formatUsd(p50)}).
          </p>
          <SalarySubmit roleKey={role} seniority={sen} region={region} cash={cash} token={result.fullToken} equity={result.equityValue} />
        </div>
      </section>
      <CareerTools cash={cash} token={result.year1Token} equity={result.equityValue} role={ROLE_KEY_LABEL[role]} />
    </main>
  );
}

function Field({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <label className="block text-xs text-mute">
      {label}
      <Input className="mt-1" type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1">
      <dt className="text-mute">{k}</dt>
      <dd className="font-mono tabular-nums">{v}</dd>
    </div>
  );
}

function SalarySubmit({ roleKey, seniority, region, cash, token, equity }: { roleKey: string; seniority: string; region: string; cash: number; token: number; equity: number }) {
  return (
    <Button
      className="mt-4"
      variant="secondary"
      type="button"
      onClick={async () => {
        await submitSalary({ data: { roleKey, seniority, region, cash, tokenValue: Math.round(token), equityValue: Math.round(equity), year: 2026 } });
        toast.success("Anonymous submission recorded.");
      }}
    >
      Submit this package anonymously
    </Button>
  );
}

function CareerTools({ cash, token, equity, role }: { cash: number; token: number; equity: number; role: string }) {
  const [tab, setTab] = useState<"payslip" | "invoice" | "cv">("payslip");
  const month = Math.round(cash / 12);
  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl tracking-tight">Career tools</h2>
      <p className="mt-1 text-sm text-mute">Payslip, invoice, and a blind CV. Generated locally — nothing is emailed.</p>
      <div className="mt-4 flex gap-1">
        {(["payslip", "invoice", "cv"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-sm border px-3 py-1.5 text-xs capitalize ${tab === t ? "border-signal bg-signal text-signal-fg" : "border-line text-mute"}`}
          >
            {t === "cv" ? "Blind CV" : t}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-line bg-raised p-5 font-mono text-sm">
        {tab === "payslip" && (
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-mute">{`LATTICE PAYSLIP (preview)
Role            ${role}
Gross (annual)  ${formatUsd(cash)}
Gross (month)   ${formatUsd(month)}
Token (yr-1)    ${formatUsd(Math.round(token))}
Equity mark     ${formatUsd(Math.round(equity))}
Net estimate    ${formatUsd(Math.round(month * 0.68))}  (illustrative 32% withhold)
Not a legal payslip. Check cliff, vest, and TGE.`}</pre>
        )}
        {tab === "invoice" && (
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-mute">{`INVOICE · USDC on Base (demo)
From            Independent
To              Client
Scope           ${role} engagement
Amount          ${formatUsd(Math.max(900, Math.round(cash / 52)))} USDC
Network         Base
Status          Recorded, not executed
Lattice demo escrow: funded → in progress → delivered → accepted → released.`}</pre>
        )}
        {tab === "cv" && (
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-mute">{`BLIND CV
Name            [redacted]
Role            ${role}
Region          Remote
Selected work   Protocol internals, reviews in public, shipped on a cadence.
Compensation    Seeking ${formatUsd(cash)} cash + token with a written vest.
Links           Available after intro.
Lattice does not dump CVs into a public pool.`}</pre>
        )}
      </div>
    </section>
  );
}

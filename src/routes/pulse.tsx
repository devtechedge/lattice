import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PULSE } from "@/lib/catalog/data";
import { seriesFor } from "@/lib/catalog/salary";
import { Badge } from "@/components/ui/badge";
import { useLiveRoles } from "@/lib/catalog/use-live-roles";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/pulse")({
  head: () =>
    pageHead({
      title: "Web3 Hiring Pulse — Market Notes | Lattice",
      path: "/pulse",
      description:
        "Market pulse for crypto and Web3 hiring: live department heat, posting cycles, and short notes. Honest about boom and bust.",
    }),
  component: Page,
});

function Page() {
  const { live } = useLiveRoles();
  const byDept = ["engineering", "design", "product", "marketing", "community", "research", "legal"].map((d) => ({
    name: d,
    n: live.filter((r) => r.department === d).length,
    heat: live.filter((r) => r.department === d && Date.now() - new Date(r.publishedAt).getTime() < 7 * 86400000).length > 3 ? "heating" : "steady",
  }));
  const posts = [2021, 2022, 2023, 2024, 2025, 2026].map((y) => ({
    year: y,
    n: y === 2021 ? 40 : y === 2022 ? 28 : y === 2023 ? 18 : y === 2024 ? 24 : y === 2025 ? 32 : live.length,
  }));
  const salaries = seriesFor("solidity", "senior", "North America");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Pulse</h1>
      <p className="mt-2 text-sm text-mute">Honest about cycles. 2026 count is live openings. Earlier years are a historical series, not this board.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="h-56 rounded-md border border-line bg-raised p-3">
          <p className="text-xs text-mute">Postings</p>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={posts}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="n" stroke="#b6f75d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-56 rounded-md border border-line bg-raised p-3">
          <p className="text-xs text-mute">Solidity senior · North America</p>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={salaries}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke="#e4c36a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {byDept.map((d) => (
          <Badge key={d.name} tone={d.heat === "heating" ? "signal" : "default"}>{d.name} · {d.n} · {d.heat}</Badge>
        ))}
      </div>
      <ol className="mt-10 space-y-4">
        {PULSE.map((e) => (
          <li key={e.id} className="border-t border-line pt-4">
            <p className="text-xs uppercase tracking-wider text-mute">{e.kind} · {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            <h2 className="mt-1 font-medium">{e.title}</h2>
            <p className="mt-1 text-sm text-mute">{e.body}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}

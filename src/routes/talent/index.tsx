import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TALENT } from "@/lib/catalog/data";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import { CHAINS, REMOTE_REGIONS, REMOTE_LABEL, SENIORITIES } from "@/lib/catalog/types";
import { listPublicProfiles } from "@/lib/server/actions";
import { pageHead } from "@/lib/seo";

type Card = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  skills: string[];
  chains: string[];
  remoteRegion?: string;
  hue: number;
  seniority?: string;
  openToGigs?: boolean;
  womenInWeb3?: boolean;
};

function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export const Route = createFileRoute("/talent/")({
  head: () =>
    pageHead({
      title: "Talent — Lattice",
      path: "/talent",
      description: "Public Web3 talent. Get discovered without a resume paywall.",
    }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [sen, setSen] = useState<string | "">("");
  const [region, setRegion] = useState<string | "">("");
  const [chain, setChain] = useState<string | "">("");
  const [gigs, setGigs] = useState(false);
  const [women, setWomen] = useState(false);
  const [extra, setExtra] = useState<Card[]>([]);

  useEffect(() => {
    listPublicProfiles()
      .then((rows) => {
        setExtra(
          rows.map((r) => {
            const p = JSON.parse(r.payload_json) as Record<string, unknown>;
            return {
              id: r.user_id,
              slug: r.user_id,
              displayName: String(p.displayName ?? "Member"),
              headline: String(p.headline ?? ""),
              skills: Array.isArray(p.skills) ? (p.skills as string[]) : [],
              chains: Array.isArray(p.chains) ? (p.chains as string[]) : [],
              remoteRegion: undefined,
              hue: hue(r.user_id),
              seniority: String(p.seniority ?? ""),
              openToGigs: Boolean(p.openToGigs),
              womenInWeb3: Boolean(p.womenInWeb3),
            };
          }),
        );
      })
      .catch(() => {});
  }, []);

  const list = useMemo(() => {
    const catalog: Card[] = TALENT.filter((t) => t.privacy === "public").map((t) => ({
      id: t.id,
      slug: t.slug,
      displayName: t.displayName,
      headline: t.headline,
      skills: t.skills,
      chains: t.chains,
      remoteRegion: t.remoteRegion,
      hue: t.hue,
      seniority: t.seniority,
      openToGigs: t.openToGigs,
      womenInWeb3: t.womenInWeb3,
    }));
    return [...extra, ...catalog]
      .filter((t) => !q || `${t.displayName} ${t.headline} ${t.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
      .filter((t) => !sen || t.seniority === sen)
      .filter((t) => !region || t.remoteRegion === region)
      .filter((t) => !chain || t.chains.includes(chain))
      .filter((t) => !gigs || t.openToGigs)
      .filter((t) => !women || t.womenInWeb3);
  }, [q, sen, region, chain, gigs, women, extra]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Talent</h1>
          <p className="mt-2 max-w-xl text-sm text-mute">Get discovered. Public directory by default; network-only profiles stay off this list.</p>
        </div>
        <Link to="/me/profile" className="inline-flex h-10 items-center rounded-sm bg-signal px-4 text-sm font-medium text-signal-fg">
          Create your Lattice profile
        </Link>
      </div>
      <div className="mt-6 flex flex-col gap-2 md:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, skill, chain" className="h-10 flex-1 rounded-sm border border-line bg-raised px-3 text-sm" />
        <select value={sen} onChange={(e) => setSen(e.target.value)} className="h-10 rounded-sm border border-line bg-raised px-3 text-sm">
          <option value="">Seniority</option>
          {SENIORITIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-10 rounded-sm border border-line bg-raised px-3 text-sm">
          <option value="">Region</option>
          {REMOTE_REGIONS.map((s) => (
            <option key={s} value={s}>
              {REMOTE_LABEL[s]}
            </option>
          ))}
        </select>
        <select value={chain} onChange={(e) => setChain(e.target.value)} className="h-10 rounded-sm border border-line bg-raised px-3 text-sm">
          <option value="">Chain</option>
          {CHAINS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex gap-3 text-sm">
        <label className="flex items-center gap-2 text-mute">
          <input type="checkbox" checked={gigs} onChange={(e) => setGigs(e.target.checked)} /> Open to gigs
        </label>
        <label className="flex items-center gap-2 text-mute">
          <input type="checkbox" checked={women} onChange={(e) => setWomen(e.target.checked)} /> Women in Web3
        </label>
      </div>
      <p className="mt-4 font-mono text-xs text-mute">{list.length} public profiles</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((t) => (
          <Link key={t.id} to="/talent/$slug" params={{ slug: t.slug }} className="flex gap-3 rounded-md border border-line bg-raised p-4 hover:border-line-strong">
            <CompanyMark name={t.displayName} hue={t.hue} />
            <div className="min-w-0">
              <p className="font-medium">{t.displayName}</p>
              <p className="text-sm text-mute">
                {t.headline}
                {t.remoteRegion ? ` · ${REMOTE_LABEL[t.remoteRegion as keyof typeof REMOTE_LABEL]}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {t.skills.slice(0, 4).map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GIGS, TALENT } from "@/lib/catalog/data";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REMOTE_LABEL } from "@/lib/catalog/types";
import { listPublicProfiles, toggleShortlist } from "@/lib/server/actions";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import type { Talent } from "@/lib/catalog/types";

export const Route = createFileRoute("/talent/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const catalog = TALENT.find((x) => x.slug === slug);
  const [live, setLive] = useState<Talent | undefined>(catalog);
  const [loading, setLoading] = useState(!catalog);
  const user = useCurrentUser();

  useEffect(() => {
    if (catalog) {
      setLive(catalog);
      setLoading(false);
      return;
    }
    listPublicProfiles()
      .then((rows) => {
        const hit = rows.find((r) => r.user_id === slug);
        if (!hit) {
          setLive(undefined);
          setLoading(false);
          return;
        }
        const p = JSON.parse(hit.payload_json) as Record<string, unknown>;
        setLive({
          id: hit.user_id,
          slug: hit.user_id,
          displayName: String(p.displayName ?? "Member"),
          headline: String(p.headline ?? ""),
          bio: `${String(p.bio ?? "")}${p.what ? `\n\nWants: ${p.what}` : ""}`,
          role: String(p.headline ?? "Talent"),
          seniority: (p.seniority as Talent["seniority"]) ?? "mid",
          skills: (Array.isArray(p.skills) ? p.skills : []) as Talent["skills"],
          chains: (Array.isArray(p.chains) ? p.chains : []) as Talent["chains"],
          scenes: ["crypto"],
          location: String(p.location ?? "Remote"),
          remoteRegion: "global",
          availability: "open",
          openToGigs: Boolean(p.openToGigs),
          privacy: "public",
          reputation: 4.8,
          completedContracts: 0,
          contributions: [],
          womenInWeb3: Boolean(p.womenInWeb3),
          languages: ["English"],
          socials: {},
          hue: 140,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, catalog]);

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-16"><div className="h-40 animate-pulse rounded-md bg-raised" /></main>;
  const t = live;
  if (!t || t.privacy === "hidden") return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-serif text-3xl">Profile not found</h1></main>;
  if (t.privacy === "network") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-3xl">Network only</h1>
        <p className="mt-2 text-sm text-mute">This profile is shared with hiring teams, not the public directory.</p>
      </main>
    );
  }
  const gigs = GIGS.filter((g) => g.talentId === t.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start gap-4">
        <CompanyMark name={t.displayName} hue={t.hue} size={56} />
        <div>
          <h1 className="font-serif text-3xl tracking-tight">{t.displayName}</h1>
          <p className="text-sm text-mute">
            {t.headline} · {t.location} · {REMOTE_LABEL[t.remoteRegion]}
          </p>
          <p className="mt-1 font-mono text-xs text-gold">
            {t.reputation.toFixed(2)} reputation · {t.completedContracts} contracts
          </p>
        </div>
      </div>
      <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-mute">{t.bio}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {t.skills.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
        {t.chains.map((s) => (
          <Badge key={s} tone="cyan">
            {s}
          </Badge>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <Button
          variant="secondary"
          onClick={async () => {
            if (!user) return (window.location.href = "/login");
            try {
              const r = await toggleShortlist({ data: { talentId: t.id } });
              toast.success(r.saved ? "Shortlisted" : "Removed");
            } catch {
              window.location.href = "/login";
            }
          }}
        >
          Shortlist
        </Button>
        <Link to="/studio">
          <Button>Invite from Studio</Button>
        </Link>
      </div>
      {t.contributions.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-medium">Contributions</h2>
          <ul className="mt-2 space-y-1 text-sm text-mute">
            {t.contributions.map((c) => (
              <li key={c.title}>
                {c.year} · {c.type} · {c.title}
              </li>
            ))}
          </ul>
        </section>
      )}
      {gigs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-medium">Gigs</h2>
          <ul className="mt-2 space-y-1">
            {gigs.map((g) => (
              <li key={g.id}>
                <Link to="/gigs/$slug" params={{ slug: g.slug }} className="text-sm hover:text-signal">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

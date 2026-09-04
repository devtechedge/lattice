import { createFileRoute, Link } from "@tanstack/react-router";
import { CITIES, REMOTE_REGIONS, REMOTE_LABEL } from "@/lib/catalog/types";
import { ROLES } from "@/lib/catalog/data";

export const Route = createFileRoute("/locations/")({ component: Page });

function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Locations</h1>
      <h2 className="mt-8 text-sm font-medium">Remote regions</h2>
      <ul className="mt-3 space-y-1">
        {REMOTE_REGIONS.map((r) => {
          const n = ROLES.filter((x) => x.remoteRegion === r).length;
          return <li key={r}><Link to="/roles" search={{ remoteRegion: r }} className="text-sm hover:text-signal">{REMOTE_LABEL[r]} · {n}</Link></li>;
        })}
      </ul>
      <h2 className="mt-8 text-sm font-medium">Cities</h2>
      <ul className="mt-3 space-y-1">
        {CITIES.map((c) => (
          <li key={c}><Link to="/locations/$slug" params={{ slug: c.toLowerCase().replace(/ /g, "-") }} className="text-sm hover:text-signal">{c}</Link></li>
        ))}
      </ul>
    </main>
  );
}

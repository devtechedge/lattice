import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { RolesBoard } from "@/components/jobs/board";
import { pageHead } from "@/lib/seo";
import { hubBySlug, SEO_HUBS } from "@/lib/seo/hubs";

export const Route = createFileRoute("/jobs/$slug")({
  head: ({ params }) => {
    const hub = hubBySlug(params.slug);
    if (!hub) {
      return pageHead({
        title: "Web3 Jobs Hub | Lattice",
        path: `/jobs/${params.slug}`,
        description: "Live blockchain, crypto, and Web3 job hubs on Lattice.",
      });
    }
    return pageHead({
      title: hub.title,
      path: `/jobs/${hub.slug}`,
      description: hub.description,
    });
  },
  component: JobsHubPage,
});

function JobsHubPage() {
  const { slug } = Route.useParams();
  const hub = hubBySlug(slug);
  if (!hub) {
    throw notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-xs uppercase tracking-wider text-mute">
        <Link to="/jobs/" className="hover:text-fg">
          Job hubs
        </Link>
        {" / "}
        {hub.slug}
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">{hub.h1}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mute">{hub.lead}</p>
      <div className="mt-6 max-w-3xl space-y-3 text-sm leading-relaxed text-mute">
        {hub.body.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
      <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {SEO_HUBS.filter((h) => h.slug !== hub.slug).map((h) => (
          <li key={h.slug}>
            <Link
              to="/jobs/$slug"
              params={{ slug: h.slug }}
              className="text-signal underline underline-offset-4"
            >
              {h.h1}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/roles" className="text-signal underline underline-offset-4">
            All Web3 roles
          </Link>
        </li>
      </ul>
      <div className="mt-10">
        <RolesBoard initial={hub.filters} hideHero />
      </div>
      <p className="mt-8 max-w-3xl text-xs text-mute">
        Public listings from employer ATS boards. Lattice is not the employer. Apply on the company site. Pay is
        shown only when the board publishes it.
      </p>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { LEARN } from "@/lib/catalog/data";
import { Markdown } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/learn/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const a = LEARN.find((x) => x.slug === slug);
  if (!a) return <main className="mx-auto max-w-2xl px-4 py-16"><h1 className="font-serif text-3xl">Not found</h1></main>;
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link to="/learn" className="text-xs text-mute hover:text-fg">Learn</Link>
      <div className="mt-3 flex gap-1.5">
        <Badge>{a.kind}</Badge>
        <Badge>{a.level}</Badge>
        <Badge>{a.minutes} min</Badge>
      </div>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{a.title}</h1>
      <div className="mt-8">
        <Markdown source={a.body} />
      </div>
    </main>
  );
}

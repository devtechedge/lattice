import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/post/")({ component: Page });

function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="rounded-sm border border-line bg-raised px-3 py-2 text-sm text-mute">Free tier: unlimited roles, gigs, and contracts. No boosts, no auctions, no resume paywall.</p>
      <h1 className="mt-6 font-serif text-3xl tracking-tight">Post</h1>
      <div className="mt-8 grid gap-3">
        <Link to="/post/role" className="rounded-md border border-line bg-raised p-5 hover:border-line-strong">
          <p className="font-medium">Post a role</p>
          <p className="mt-1 text-sm text-mute">Employment — full-time, part-time, intern, bounty. Live in about a minute.</p>
        </Link>
        <Link to="/post/contract" className="rounded-md border border-line bg-raised p-5 hover:border-line-strong">
          <p className="font-medium">Post a contract</p>
          <p className="mt-1 text-sm text-mute">A scoped freelance project with a budget and a deadline.</p>
        </Link>
        <Link to="/post/gig" className="rounded-md border border-line bg-raised p-5 hover:border-line-strong">
          <p className="font-medium">Post a gig</p>
          <p className="mt-1 text-sm text-mute">A packaged service you offer. Sign in so it attaches to your profile.</p>
        </Link>
      </div>
    </main>
  );
}

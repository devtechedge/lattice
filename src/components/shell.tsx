import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CITIES, CHAINS, DEPARTMENTS, DEPARTMENT_LABEL, SCENES, REMOTE_REGIONS, REMOTE_LABEL } from "@/lib/catalog/types";
import { LatticeMark } from "./mark";
import { CommandK } from "./command-k";
import { ThemeToggle } from "./theme";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/roles", label: "Roles" },
  { to: "/gigs", label: "Gigs" },
  { to: "/talent", label: "Talent" },
  { to: "/salaries", label: "Salaries" },
  { to: "/companies", label: "Companies" },
  { to: "/learn", label: "Learn" },
  { to: "/pulse", label: "Pulse" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState(false);
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-signal focus:px-3 focus:py-2 focus:text-signal-fg">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 text-fg">
            <LatticeMark className="size-9 text-signal" />
            <span className="text-base font-semibold tracking-tight">Lattice</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-sm px-2.5 py-1.5 text-sm text-mute transition-colors hover:text-fg",
                  pathname === n.to || pathname.startsWith(n.to + "/") ? "text-fg" : "",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCmd(true)}
              className="hidden h-9 items-center gap-2 rounded-sm border border-line px-3 text-xs text-mute md:flex"
            >
              <Search className="size-3.5" />
              Search
              <kbd className="ml-2 font-mono text-[10px]">⌘K</kbd>
            </button>
            <button type="button" onClick={() => setCmd(true)} className="grid size-10 place-items-center text-mute md:hidden" aria-label="Search">
              <Search className="size-4" />
            </button>
            <Link to="/post" className="hidden sm:block">
              <Button size="sm">Post</Button>
            </Link>
            {isPending ? (
              <div className="size-8 animate-pulse rounded-full bg-raised" />
            ) : user ? (
              <SignedIn>
                <UserButton />
              </SignedIn>
            ) : (
              <SignedOut>
                <Link to="/login" className="px-2 text-sm text-mute hover:text-fg">
                  Sign in
                </Link>
              </SignedOut>
            )}
            <ThemeToggle />
            <button type="button" className="grid size-10 place-items-center lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-line px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="rounded-sm px-2 py-2.5 text-sm">
                  {n.label}
                </Link>
              ))}
              <Link to="/post" className="rounded-sm px-2 py-2.5 text-sm">
                Post
              </Link>
              <Link to="/me" className="rounded-sm px-2 py-2.5 text-sm">
                Me
              </Link>
              <Link to="/studio" className="rounded-sm px-2 py-2.5 text-sm">
                Studio
              </Link>
            </div>
          </nav>
        )}
      </header>
      <div id="main" className="flex-1">
        {children}
      </div>
      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <LatticeMark className="size-4 text-signal" />
              <span className="text-sm font-medium">Lattice</span>
            </div>
            <p className="mt-3 max-w-xs font-serif text-lg leading-snug text-mute">The decentralized future is people.</p>
            <p className="mt-3 text-xs text-mute">Public listings. Not an employer. Free tier — no auctions, no resume paywall.</p>
            <a href="https://github.com/devtechedge/lattice" className="mt-3 inline-block text-xs text-mute hover:text-fg">
              GitHub @devtechedge/lattice
            </a>
            <a
              href="https://jobrow.vercel.app"
              className="mt-1 block text-xs text-mute hover:text-fg"
              rel="noopener noreferrer"
            >
              Jobrow - US tech jobs
            </a>
          </div>
          <FooterCol title="Departments" links={DEPARTMENTS.map((d) => ({ to: `/departments/${d}`, label: DEPARTMENT_LABEL[d] }))} />
          <FooterCol title="Scenes" links={SCENES.map((s) => ({ to: `/scenes/${s}`, label: s }))} />
          <FooterCol
            title="More"
            links={[
              { to: "/hiring", label: "Hiring this week" },
              { to: "/jobs", label: "Job hubs" },
              { to: "/locations", label: "Locations" },
              { to: "/alerts", label: "Alerts & RSS" },
              { to: "/about", label: "About" },
              { to: "/privacy", label: "Privacy" },
              { to: "/terms", label: "Terms" },
              { to: "/me", label: "Me" },
              { to: "/studio", label: "Studio" },
            ]}
          />
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-4 gap-y-1 px-4 py-4 text-[11px] text-mute">
            {CHAINS.slice(0, 12).map((c) => (
              <Link key={c} to="/chains/$slug" params={{ slug: c }} className="hover:text-fg">
                {c}
              </Link>
            ))}
            {CITIES.slice(0, 8).map((c) => (
              <Link key={c} to="/locations/$slug" params={{ slug: c.toLowerCase().replace(/ /g, "-") }} className="hover:text-fg">
                {c}
              </Link>
            ))}
            {REMOTE_REGIONS.map((r) => (
              <Link key={r} to="/roles" search={{ remoteRegion: r }} className="hover:text-fg">
                {REMOTE_LABEL[r]}
              </Link>
            ))}
          </div>
        </div>
      </footer>
      <CommandK open={cmd} onOpenChange={setCmd} />
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-mute">{title}</p>
      <ul className="mt-3 space-y-1.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to as never} className="text-sm capitalize text-mute hover:text-fg">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

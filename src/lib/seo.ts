/** Shared page meta for search + social + AI crawlers. */
export const SITE_ORIGIN = "https://lattice-beta-livid.vercel.app";

export const DEFAULT_DESCRIPTION =
  "Web3 roles, gigs, talent, and salaries. Public listings — not an employer.";

export const OG_IMAGE = `${SITE_ORIGIN}/og.jpg`;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_ORIGIN;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageHead(opts: { title: string; description?: string; path?: string; ogType?: string }) {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const url = absoluteUrl(opts.path ?? "/");
  const title = opts.title;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: opts.ogType ?? "website" },
      { property: "og:site_name", content: "Lattice" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

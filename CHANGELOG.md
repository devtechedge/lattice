# Changelog

## 1.2.7 — 2026-09-06

- Fix above-the-fold company marks stuck on initials: cached logos could fire `onLoad` before React attached the handler, so the opacity gate never flipped. Show same-origin logos immediately; fall back to initials only on error.

## 1.2.6 — 2026-09-06

- Ship real company logos as same-origin assets under `public/logos/{id}.png` for all twenty boards. Marks no longer depend on third-party favicon CDNs (CSP/redirects kept breaking them).

## 1.2.5 — 2026-09-06

- Fix broken company marks: Google’s favicon endpoint 301s to `*.gstatic.com` (blocked by CSP). Use DuckDuckGo icons first, gstatic V2 second, and only reveal the `<img>` after `onLoad` so a failed fetch never shows a broken-image glyph.

## 1.2.4 — 2026-09-06

- Fix company logos: allow Google/DuckDuckGo favicon hosts in CSP `img-src`, cascade favicon → DuckDuckGo → initials so marks never render empty.
- Uniform job cards: fixed height, two-line title clamp, single-line meta row.

## 1.2.3 — 2026-09-06

- Canonical production host is now `https://lattice-devtechedge1.vercel.app` (shorter team alias). Updated site.json, SEO, robots, llms.txt, README, and related tests.

## 1.2.2 — 2026-09-06

- Faster hard refresh for live roles: skip Greenhouse `?content=true` on the list path (metadata pay still works; role detail still fetches full HTML), 4s per-board timeout, stale-while-revalidate + in-flight dedupe on server and client, and SSR loaders on home / roles / companies so the first paint is not an empty shell when the isolate is warm.

## 1.2.1 — 2026-09-06

- Show each company's real logo (site favicon) next to their postings, company strips, and company pages. Initials remain the fallback when the icon fails.

## 1.2.0 — 2026-09-05

- Extract real ATS pay from Greenhouse metadata / HTML and Ashby compensation. Inferred bands are marked `~`. Empty is an em dash. Never fill live rows from the salary observatory.
- Greenhouse lists fetch `?content=true` (fall back without content). Ashby lists request `includeCompensation=true`.
- Discovery: `site.json` description + origin, `/sitemap.xml`, `/llms.txt`, robots Sitemap line, shared `pageHead`.
- Share cards: on `*.vercel.app`, `og:image` uses baked `site.origin` so the custom card is not dropped.
- Home strips capped at 8 and diversified by company. Footer: “Public listings. Not an employer.”
- Refresh GitHub screenshots after the pay and home-density pass.

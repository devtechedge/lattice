# Changelog

## 1.2.1 — 2026-09-06

- Show each company's real logo (site favicon) next to their postings, company strips, and company pages. Initials remain the fallback when the icon fails.

## 1.2.0 — 2026-09-05

- Extract real ATS pay from Greenhouse metadata / HTML and Ashby compensation. Inferred bands are marked `~`. Empty is an em dash. Never fill live rows from the salary observatory.
- Greenhouse lists fetch `?content=true` (fall back without content). Ashby lists request `includeCompensation=true`.
- Discovery: `site.json` description + origin, `/sitemap.xml`, `/llms.txt`, robots Sitemap line, shared `pageHead`.
- Share cards: on `*.vercel.app`, `og:image` uses baked `site.origin` so the custom card is not dropped.
- Home strips capped at 8 and diversified by company. Footer: “Public listings. Not an employer.”
- Refresh GitHub screenshots after the pay and home-density pass.

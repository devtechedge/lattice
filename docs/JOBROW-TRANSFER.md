# Lattice ← Jobrow transfer hand-off

**Audience:** implementer (agent or human) working on [devtechedge/lattice](https://github.com/devtechedge/lattice)  
**Source of truth for learnings:** [devtechedge/job-board](https://github.com/devtechedge/job-board) (Jobrow), session ending ~2026-09-05  
**Live Jobrow:** https://jobrow.vercel.app  
**Live Lattice:** https://lattice-devtechedge1.vercel.app  

This doc transfers **product choices, UX patterns, and engineering fixes** from a deep Jobrow polish session into Lattice. It is not a blind port: Lattice is a **Web3 career lattice** (roles + gigs + talent + salaries + companies), while Jobrow is a **US-tech ATS register** of still-open employer-board roles. Apply only what fits.

**Status (2026-09-06):** P0/P1 shipped. Free SEO pass shipped (Search Console, role sitemap, /jobs hubs, /hiring, Jobrow cross-links, README). Remaining: P2 Closed roles, P3 polish. Custom domain deferred. See docs/SEO.md.

---

## 0. Product frames (do not confuse)

| | Jobrow | Lattice |
|---|--------|---------|
| Mission | Public register of **still-open US tech** roles from Greenhouse / Ashby / Lever JSON | **Web3** roles, gigs, talent, salary observatory, companies |
| Live data | Neon + twice-daily crawl of **50** boards | **Twenty** live crypto ATS boards (Greenhouse / Ashby / Lever) via in-memory TTL in `src/lib/server/live.ts` |
| Pay stance | **Never invent** — only ATS posted / text-inferred; show `—` when unknown | Live ATS rows: posted / inferred (`~`) / none only. Observatory `estimateSalary` is for **catalog/user** rows and the salaries page — never for `source: "ats"` |
| Closed roles | First-class `/closed` after successful crawl drop | Still deferred until durable multi-board crawl exists |
| Auth | None for browsing | Optional Better Auth (bookmarks, applications, profiles) |

**Non-negotiable transfer:** when showing pay on **live ATS** rows, follow Jobrow: **only real board data**, label inferred vs posted, never fill gaps with market averages or seed-style fake bands.

---

## 1. Session changelog to port (Jobrow 0.2.0)

Reference commits on `job-board` `main` (newest first among the session):

| Theme | Jobrow commits (approx) | Lattice status |
|-------|-------------------------|----------------|
| Sort freshness | `7bf620e` | **Done** — roles default `newest` → `publishedAt` |
| Screenshots / OG | `b8310e6` | **Done** in 1.2.0 — refresh again after future UI moves |
| Real pay extraction | `1254a62` | **Done** — `salary-ats.ts`; Greenhouse list omits content=true (speed); Ashby includeCompensation=true |
| Docs counts / honesty | `7bcdaac` | **Done** — README + CHANGELOG 1.2.0 |
| Discovery SEO | `a6511c3` | **Done** — plus 2026-09 free SEO (see docs/SEO.md) |
| Home density + nav | `e53a2fc` | **Done** — strips capped/diversified; Learn/Pulse last in NAV |
| Seed scale | `d9d2e61` | **Done** — 20 verified crypto boards in `boards.ts` |
| Closed roles | `d3490fe`, `93dcce9`, … | **Deferred** (P2) |
| Plain labels + masthead | `4fb9c60`, `e694c06` | **Done** — footer honesty line |
| Light theme lift | `a5a2896`, `6933a81` | **Optional** (P3) |
| Company list caps | `e81587a` | **Done** — company pages list all live roles (no 200 hard-cap) |

Full narrative: Jobrow [`CHANGELOG.md`](https://github.com/devtechedge/job-board/blob/main/CHANGELOG.md) §0.2.0.

---

## 2. Gap analysis (Lattice on main, 2026-09-06)

### Shipped (keep)

- Live pay: `src/lib/catalog/salary-ats.ts`; `JobCard` / table use `formatPay` for `source === "ats"` and do **not** call `estimateSalary` on ATS rows
- Greenhouse list `?content=true` (with fallback); Ashby `includeCompensation=true`
- Discovery: `site.json` description + origin, `/sitemap.xml`, `/llms.txt`, robots Sitemap line, shared `pageHead`; live host returns 200 for these
- Twenty boards in `src/lib/catalog/boards.ts` (Coinbase, Binance, OKX, Bybit, Ripple, Kraken, Fireblocks, Crypto.com, Chainalysis, Blockchain.com, BitGo, Gemini, Alchemy, Phantom, Circle, Uniswap Labs, Ledger, Consensys, Ethereum Foundation, Solana Labs)
- Home: latest + live preview + new-this-week + companies hiring capped (~8) with company diversity
- NAV: Roles · Gigs · Talent · Salaries · Companies · Learn · Pulse
- Screenshots refreshed with 1.2.0

### Still open

1. **Closed roles** — only after durable crawl + successful-fetch close semantics (Jobrow rule: failed fetch must not mass-close)
2. **Light-theme silver lift** — optional if light mode still feels muddy
3. **Public JSON API** (`/api/roles`) — optional (Jobrow `/api/jobs`); not required for transfer
4. **Ops** — Search Console / Bing sitemap submit

### Watch items (not blockers)

- Grok PWA share bake may omit `twitter:image` while `og:image` is present — confirm if Twitter cards matter
- Re-refresh `docs/screenshots/*` + `og.jpg` after any visible UI/copy change
- If seed/catalog roles remain in any surface, keep observatory estimates clearly labeled (already titled “Estimated from Lattice’s observatory…”)

---

## 3. Implementation plan (ordered) — historical

### P0 — Honesty + live pay — **SHIPPED (1.2.0)**

See CHANGELOG 1.2.0 and `af71e4a`. Acceptance from original plan met on live ATS path.

### P0 — Discovery / share cards — **SHIPPED (1.2.0)**

`/llms.txt`, `/sitemap.xml`, robots Sitemap, `site.json` origin, `pageHead` on key routes.

### P1 — Multi-board live crypto ATS — **SHIPPED (1.1.0 / dd16920)**

Twenty boards with verified public tokens. Company pages uncapped.

### P1 — Home + Roles UX density — **SHIPPED (1.2.0)**

Strips capped; NAV secondary destinations last; Posted/newest default sort preserved.

### P2 — Closed roles (only after durable multi-board crawl)

When Lattice stores ATS snapshots in DB:

- `/closed` (or `/roles/closed`) listing roles removed after successful crawl  
- API if public JSON is part of the product  
- Nav link last  
- Redirect any old `/expired` name to Closed  

Until then: skip.

### P2 — Docs / GitHub first visual

After implementing P0–P1 (done): README, CHANGELOG, screenshots were refreshed in 1.2.0. Re-run this checklist after future product moves.

### P3 — Optional polish

- Light-mode paper/sheen lift (Jobrow silver tokens) — only if Lattice light theme feels dull  
- Public JSON API for roles (`/api/roles`) if mobile/clients are planned  
- Search Console / Bing Webmaster + sitemap submit (ops, not code)

---

## 4. Concrete file map

| Jobrow reference | Lattice target | Status |
|------------------|----------------|--------|
| `src/lib/salary.ts` | `src/lib/catalog/salary-ats.ts` (observatory `salary.ts` separate) | Done |
| `src/lib/ats/greenhouse.ts` | `src/lib/catalog/greenhouse.ts` + `src/lib/server/live.ts` | Done |
| `src/lib/seo.ts` + route `head`s | `src/lib/seo.ts` + key routes | Done |
| `src/routes/sitemap[.]xml.ts` | same | Done |
| `public/llms.txt`, `public/robots.txt` | same | Done |
| `src/lib/og/site.json` | description + origin + image | Done |
| `scripts/grok-pwa-shared.mjs` | vercel origin fallback for og:image | Done |
| `src/lib/seed-companies.ts` | `src/lib/catalog/boards.ts` multi-board registry | Done |
| Home diversity helpers | home `diverse()` strips | Done |
| `/closed` routes | later | Deferred |

---

## 5. Pay rules (copy for implementers)

1. **ATS / live:** only employer-published numbers (structured or text).  
2. **Inferred:** mark `~` + source `inferred`; never present as exact offer.  
3. **None:** show `—` / “Not listed”.  
4. **Seed/demo / catalog:** must not be mistaken for ATS; badge or null pay; observatory estimates only off the ATS path.  
5. **Observatory (`salaryMatrix` / `estimateSalary`):** keep as **aggregate market UI**, never as a per-role band on an ATS card.  
6. **Hourly / tiny metadata amounts** (e.g. DoorDash-style 34–50): treat as non-salary (Jobrow `dollarsToCents` rejects <200).  
7. **Non-USD:** show ISO code; do not convert to USD.

---

## 6. Sort rules (copy for implementers)

| Sort | Meaning | Default? |
|------|---------|----------|
| Posted / newest | Employer `publishedAt` / `first_published` | **Yes** |
| First seen | When Lattice first stored the role | Optional |
| Last seen | Last successful crawl confirmation | Optional only — **bunches whole boards** |
| Pay / title / company | As today | Optional |

---

## 7. Acceptance checklist

- [x] Coinbase (and other GH) lists use `content=true` (or fallback) and extract real pay when present  
- [x] ATS roles never show seed/matrix invented pay (`salaryLabel` ATS branch → `formatPay` only)  
- [x] `/llms.txt`, `/sitemap.xml`, robots Sitemap line live on canonical host  
- [x] `site.json` has description + origin; og:image works on Vercel  
- [x] Home strips capped (~8) and not dominated by one company  
- [x] Roles default sort = newest/posted  
- [x] README + screenshots + social preview updated (1.2.0)  
- [x] (P1) Additional verified crypto ATS boards beyond Coinbase (20)  
- [ ] (P2) Closed roles only after durable crawl semantics exist  
- [ ] (P3) Optional light-theme lift / public JSON API / Search Console

---

## 8. Out of scope / do not blindly copy

- Jobrow US-tech-only classifier and US eligibility filters (Lattice is global Web3)  
- Jobrow Expo mobile app  
- Jobrow Bound pass / Promote waitlist pricing  
- Replacing Lattice gigs/talent/salaries observatory with Jobrow’s register-only IA  
- Cursor Cloud Agents (may be gated on plan) — use `gh` / API / authorized local clone as needed  

---

## 9. Handoff meta

- **Owner preference (Jobrow):** commit straight to `main` when asked; avoid PR ceremony unless requested. Confirm for Lattice.  
- **Canonical Jobrow learnings doc:** this file.  
- **Deep session themes in one line:** honesty on pay, Posted-first sorting, tight home strips, Closed when crawl-backed, discovery (`sitemap`/`llms.txt`/OG), scale boards only with verified public ATS tokens, refresh GitHub visuals after product moves.

When picking up again, prefer one PR/commit series per remaining phase (P2 closed → P3 polish → docs/screenshots if UI moved).

---

## SEO hand-off

See [docs/SEO.md](SEO.md).

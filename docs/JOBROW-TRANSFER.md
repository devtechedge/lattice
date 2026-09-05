# Lattice ← Jobrow transfer hand-off

**Audience:** implementer (agent or human) working on [devtechedge/lattice](https://github.com/devtechedge/lattice)  
**Source of truth for learnings:** [devtechedge/job-board](https://github.com/devtechedge/job-board) (Jobrow), session ending ~2026-09-05  
**Live Jobrow:** https://jobrow.vercel.app  
**Live Lattice (today):** https://lattice-beta-livid.vercel.app  

This doc transfers **product choices, UX patterns, and engineering fixes** from a deep Jobrow polish session into Lattice. It is not a blind port: Lattice is a **Web3 career lattice** (roles + gigs + talent + salaries + companies), while Jobrow is a **US-tech ATS register** of still-open employer-board roles. Apply only what fits.

---

## 0. Product frames (do not confuse)

| | Jobrow | Lattice |
|---|--------|---------|
| Mission | Public register of **still-open US tech** roles from Greenhouse / Ashby / Lever JSON | **Web3** roles, gigs, talent, salary observatory, companies |
| Live data | Neon + twice-daily crawl of **50** boards | Seeded demo catalog + **live Coinbase** Greenhouse list (in-memory TTL) |
| Pay stance | **Never invent** — only ATS posted / text-inferred; show `—` when unknown | README admits **seeded compensation is fictional**; Coinbase usually undisclosed |
| Closed roles | First-class `/closed` after successful crawl drop | No closed/expired surface yet |
| Auth | None for browsing | Optional Better Auth (bookmarks, applications, profiles) |

**Non-negotiable transfer:** when showing pay on **live ATS** rows (Coinbase today, more boards later), follow Jobrow: **only real board data**, label inferred vs posted, never fill gaps with market averages or seed-style fake bands.

---

## 1. Session changelog to port (Jobrow 0.2.0)

Reference commits on `job-board` `main` (newest first among the session):

| Theme | Jobrow commits (approx) | Lattice action |
|-------|-------------------------|----------------|
| Sort freshness | `7bf620e` | Keep / enforce **Posted** (`publishedAt`) as default; never sort live boards by “last crawl touch” alone |
| Screenshots / OG | `b8310e6` | Refresh `docs/screenshots/*` + `social-preview.png` + `public/og.jpg` after UI/copy changes |
| Real pay extraction | `1254a62` | Port Greenhouse `content=true` + metadata pay + safe text parse into `greenhouse.ts` / Coinbase loader |
| Docs counts / honesty | `7bcdaac` | Keep README numbers tied to live reality; CHANGELOG for meaningful drops |
| Discovery SEO | `a6511c3` | `sitemap.xml`, `pageHead`, `/llms.txt`, `robots.txt` Sitemap line, `site.json` description+origin |
| Home density + nav | `e53a2fc` | Cap home strips (≈8); put low-priority nav last |
| Seed scale | `d9d2e61` | Expand **live crypto ATS boards** (not only Coinbase), verify tokens publicly first |
| Closed roles | `d3490fe`, `93dcce9`, … | Optional: Closed / dropped ATS roles after multi-board crawl exists |
| Plain labels + masthead | `4fb9c60`, `e694c06` | Plain language; “Public listings. Not an employer.” style honesty |
| Light theme lift | `a5a2896`, `6933a81` | Only if Lattice light mode feels muddy — optional polish |
| Company list caps | `e81587a` | Don’t truncate large boards at 200 when showing company role lists |

Full narrative: Jobrow [`CHANGELOG.md`](https://github.com/devtechedge/job-board/blob/main/CHANGELOG.md) §0.2.0.

---

## 2. Gap analysis (Lattice today)

### Already aligned (keep)
- Roles default sort `newest` → `publishedAt` desc (`filter-roles.ts` `sortRoles`) — **same intent as Jobrow’s Posted default**.
- Coinbase list sorted by `publishedAt` in `loadCoinbaseList`.
- Apply leaves Lattice for Coinbase.com; copy already says Lattice does not invent a band for live Coinbase.
- TanStack Start + React 19 + TypeScript + Tailwind v4 stack (same family as Jobrow).
- Screenshots + `og.jpg` exist (will need refresh after changes).

### Gaps vs Jobrow learnings

1. **Live Greenhouse fetch omits job HTML**  
   `boardUrl()` lists `/v1/boards/coinbase/jobs` with **no `?content=true`**.  
   `mapGreenhouseJob` only uses `content` if present — so list ingest almost never has description text for pay inference.

2. **No ATS pay extraction on live roles**  
   `mapGreenhouseJob` never sets `salaryMin` / `salaryMax` from metadata or body. Jobrow learned boards often put pay in:
   - metadata: `Pay Transparency Range`, `Compensation Range (Job Posts)`, `Total Base Pay - Min/Max`, etc. (often **JSON objects** `{ unit, min_value, max_value }`)
   - HTML body: “Estimated annual salary of $X – $Y”
   - Ashby: `summaryComponents` + `scrapeableCompensationSalarySummary` (when Lattice adds Ashby boards)

3. **Seeded pay is fictional**  
   Product risk if visitors cannot tell seed vs live. Jobrow never mixes invented pay into live register rows.

4. **Discovery / SEO thin**  
   - `robots.txt`: `Allow: /` only — **no Sitemap line**, no `llms.txt` pointer  
   - No `sitemap.xml` route found  
   - No shared `pageHead` / canonical / full OG set on routes  
   - `src/lib/og/site.json` has title/card/color only — **missing `description` + `origin`**  
   - On `*.vercel.app`, Grok PWA middleware strips React OG tags and re-injects from baked `site.json`; without `origin`, **og:image often missing** on Vercel system hosts (Jobrow fixed this).

5. **Single live board**  
   Jobrow scaled 34→50 after probing public tokens. Lattice still “Coinbase strip + seed.” Crypto-native GH/Ashby/Lever boards are the natural expansion.

6. **Home strips**  
   Home mixes featured, live Coinbase preview (`slice(0,3)+…`), new-this-week (8), companies (14). Jobrow tightened Latest + Companies to **8** and **one company per Latest row** for a tighter first screen.

7. **No Closed surface**  
   Only matters once Lattice crawls many boards into durable storage and can detect removals after a **successful** fetch (Jobrow rule: failed fetch must not close roles).

8. **Nav density**  
   Lattice NAV: Roles, Gigs, Talent, Salaries, Companies, Learn, Pulse (+ Post, Sign in). Jobrow lesson: put secondary destinations last; keep primary path obvious. Optional later: bookmarks count like Jobrow Saved.

---

## 3. Implementation plan (ordered)

### P0 — Honesty + live pay (do first)

**Goal:** Live ATS roles never show invented compensation; extract real pay when the board publishes it.

1. **Coinbase list URL**  
   Change list fetch to:  
   `https://boards-api.greenhouse.io/v1/boards/coinbase/jobs?content=true`  
   (Jobrow: `greenhouseListUrl` uses `content=true`.)  
   Expect larger payloads (~MB); keep 8s timeout or raise carefully; cache TTL already 10m.

2. **Port pay helpers from Jobrow** (adapt into `src/lib/catalog/`):  
   - `payFromMetaValue` — structured GH metadata objects → cents + currency, source `posted`  
   - `parseSalaryFromText` — ranges / `$160k` with **pay-context** requirement; **reject** noise like “$124 trillion”  
   - `formatPay` — USD `$160k–$220k`; non-USD `COP 2480k–3100k` (ISO once, **no fake `$`**)  
   - Sources: `posted` | `inferred` | `none`  
   Reference: Jobrow `src/lib/salary.ts`, `src/lib/ats/greenhouse.ts`, commit `1254a62`.

3. **Wire `mapGreenhouseJob`**  
   - Prefer metadata pay → `posted`  
   - Else parse markdown/HTML text → `inferred`  
   - Else leave min/max null; UI shows em dash / “Not listed”  
   - Surface `salarySource` on `Role` type if missing

4. **UI**  
   - Job card / table / detail: show formatted pay; for `inferred`, prefix `~` and short note (“inferred from posting text”) like Jobrow  
   - **Never** fall back to `salaryMatrix` / seed averages for `source: "ats"` rows

5. **Seed catalog**  
   - Label demo pay clearly in UI (“Demo catalog”) **or** null out seed salaries for production demo honesty  
   - README already warns; reinforce in role badges

**Acceptance:** Spot-check Coinbase roles that mention salary in GH HTML/metadata show a band; roles without stay empty; no invented numbers on ATS rows.

---

### P0 — Discovery / share cards

1. **`src/lib/og/site.json`** (Jobrow pattern):
   ```json
   {
     "description": "Web3 roles, gigs, talent, and salaries. Public listings — not an employer.",
     "card": "custom",
     "color": "07080B",
     "image": "/og.jpg",
     "origin": "https://lattice-beta-livid.vercel.app"
   }
   ```
   Update `origin` when the production hostname is claimed (Jobrow: `jobrow.vercel.app`). Prefer dropping fixed `title` so document `<title>` wins for og:title.

2. If Lattice uses the same Grok PWA shared middleware: ensure **vercel host + site.origin** fallback for `og:image` (Jobrow patched `scripts/grok-pwa-shared.mjs`).

3. Add **`public/llms.txt`** describing Lattice, key routes, and any public JSON APIs; mention it in `robots.txt`.

4. Add **`/sitemap.xml`** (TanStack server route) listing home, roles, gigs, talent, salaries, companies, learn, about, login/post as appropriate, plus company/role slugs that are public. Cache ~1h.

5. Shared **`pageHead({ title, description, path })`** for canonical + OG fields on key routes (home, roles, role detail, companies, about). Remember Grok may strip share metas and re-inject from `site.json` — still set good `<title>` + `name=description` (those survive and feed document description).

6. **`robots.txt`**:
   ```
   User-agent: *
   Allow: /
   Disallow: /me
   Disallow: /studio   # if private
   Sitemap: https://<canonical-host>/sitemap.xml
   # https://<canonical-host>/llms.txt
   ```

**Acceptance:** View-source home shows useful description; `/llms.txt` and `/sitemap.xml` 200; share debugger shows image on production host.

---

### P1 — Multi-board live crypto ATS (Jobrow seed expansion pattern)

Jobrow process that worked:

1. Propose companies with **public** Greenhouse / Ashby / Lever tokens  
2. Probe JSON before seeding (`boards-api.greenhouse.io/...`, `api.ashbyhq.com/posting-api/job-board/...?includeCompensation=true`, Lever `mode=json`)  
3. Skip boards with no public API (Jobrow dropped Rippling/Uber/Netflix/Snap/Zoom; used replacements)  
4. Insert seed with `on conflict do nothing`; crawl/ensureIndex inserts new rows  
5. Prefer **direct commits to `main`** if that matches Devayan’s preference for this product too (confirm before PRs)

**Lattice adaptation:**
- Generalize `coinbase.ts` → `ats/` loaders keyed by `{ companyId, ats, boardToken }`  
- Persist open roles in Postgres when `DATABASE_URL` is set (don’t rely only on 10m memory cache once multi-board)  
- Crypto-leaning starter candidates to probe (examples only — **verify tokens live** before shipping): Coinbase (done), Kraken, Gemini, Circle, Consensys, Uniswap Labs, Chainlink, OpenSea, Magic Eden, Phantom, etc. Prefer boards that actually expose public JSON.

**Crawl discipline (from Jobrow):**
- Close a role only after a **successful** board fetch that omits it  
- Failed/timeout fetch must not mass-close  

**Acceptance:** ≥N live crypto boards (product pick N, e.g. 10–20) with verified tokens; company pages don’t hard-cap at 200.

---

### P1 — Home + Roles UX density

From Jobrow:

| Pattern | Jobrow | Lattice suggestion |
|---------|--------|-------------------|
| Latest strip | 8 roles, **one company per row** | Live / “New” strips: max 8; diversify by `companyId` |
| Companies strip | 8 | Cap “companies hiring” at 8 (today slice 14) |
| Nav order | Jobs · Search · Companies · About · Saved · **Closed** last | Keep primary career paths first; push Learn/Pulse last if crowded |
| Masthead honesty | “Public listings. Not an employer.” | Already close — keep visible on home + footer |
| Plain labels | Avoid internal jargon in UI | Prefer “Roles” / “Saved” over studio jargon in visitor chrome |

**Roles index:** default sort stays **newest / Posted**. If you ever add `lastSeenAt` for crawl confirmation, expose it as an explicit sort — **do not make it default** (Jobrow Twilio bunched after crawl).

---

### P2 — Closed roles (only after durable multi-board crawl)

When Lattice stores ATS snapshots in DB:

- `/closed` (or `/roles/closed`) listing roles removed after successful crawl  
- API if public JSON is part of the product  
- Nav link last  
- Redirect any old `/expired` name to Closed  

Until then: skip.

---

### P2 — Docs / GitHub first visual

After implementing P0–P1:

1. Update README live counts / board count / honesty on seed vs live pay  
2. Add `CHANGELOG.md` entry  
3. Refresh screenshots (desktop ~1440×900) + `social-preview.png` / `og.jpg` at **1200×630**  
4. GitHub About description + homepage URL  
5. Optional release tag (Jobrow: `v0.2.0`)

Avoid forbidden portfolio phrasing in public git/GitHub surfaces (see Jobrow presentation skill norms).

---

### P3 — Optional polish

- Light-mode paper/sheen lift (Jobrow silver tokens) — only if Lattice light theme feels dull  
- Public JSON API for roles (`/api/roles`) if mobile/clients are planned (Jobrow `/api/jobs`)  
- Search Console / Bing Webmaster + sitemap submit (ops, not code)

---

## 4. Concrete file map

| Jobrow reference | Lattice target |
|------------------|----------------|
| `src/lib/salary.ts` | `src/lib/catalog/salary-ats.ts` (keep existing observatory `salary.ts` separate — **do not mix invented matrix into ATS**) |
| `src/lib/ats/greenhouse.ts` | `src/lib/catalog/greenhouse.ts` + `src/lib/server/coinbase.ts` list URL |
| `src/lib/seo.ts` + route `head`s | new `src/lib/seo.ts` + `__root` / key routes |
| `src/routes/sitemap[.]xml.ts` | same pattern under `src/routes/` |
| `public/llms.txt`, `public/robots.txt` | same |
| `src/lib/og/site.json` | same path — add description, origin, image |
| `scripts/grok-pwa-shared.mjs` | if present, vercel `origin` fallback for og:image |
| `src/lib/seed-companies.ts` | multi-board registry (new) |
| `src/lib/search.ts` `listLatestDiverseJobs` | home live/new strips diversification |
| `/closed` routes | later |

---

## 5. Pay rules (copy for implementers)

1. **ATS / live:** only employer-published numbers (structured or text).  
2. **Inferred:** mark `~` + source `inferred`; never present as exact offer.  
3. **None:** show `—` / “Not listed”.  
4. **Seed/demo:** must not be mistaken for ATS; badge or null pay.  
5. **Observatory (`salaryMatrix`):** keep as **aggregate market UI**, never as a per-role band on an ATS card.  
6. **Hourly / tiny metadata amounts** (e.g. DoorDash-style 34–50): treat as non-salary (Jobrow `dollarsToCents` rejects &lt;200).  
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

## 7. Suggested acceptance checklist

- [ ] Coinbase list uses `content=true` (or per-job detail) and extracts real pay when present  
- [ ] ATS roles never show seed/matrix invented pay  
- [ ] `/llms.txt`, `/sitemap.xml`, robots Sitemap line live on canonical host  
- [ ] `site.json` has description + origin; og:image works on Vercel  
- [ ] Home strips capped (~8) and not dominated by one company  
- [ ] Roles default sort = newest/posted  
- [ ] README + screenshots + social preview updated  
- [ ] (P1) Additional verified crypto ATS boards beyond Coinbase  
- [ ] (P2) Closed roles only after durable crawl semantics exist  

---

## 8. Out of scope / do not blindly copy

- Jobrow US-tech-only classifier and US eligibility filters (Lattice is global Web3)  
- Jobrow Expo mobile app  
- Jobrow Bound pass / Promote waitlist pricing  
- Replacing Lattice gigs/talent/salaries observatory with Jobrow’s register-only IA  
- Cursor Cloud Agents (may be gated on plan) — use `gh` / local clone / API as Jobrow did  

---

## 9. Handoff meta

- **Owner preference (Jobrow):** commit straight to `main` when asked; avoid PR ceremony unless requested. Confirm for Lattice.  
- **Canonical Jobrow learnings doc:** this file.  
- **Deep session themes in one line:** honesty on pay, Posted-first sorting, tight home strips, Closed when crawl-backed, discovery (`sitemap`/`llms.txt`/OG), scale boards only with verified public ATS tokens, refresh GitHub visuals after product moves.

When implementation starts, prefer one PR/commit series per phase (P0 pay → P0 SEO → P1 boards → P1 home → docs/screenshots).

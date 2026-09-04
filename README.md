# Lattice

One lattice. Every Web3 career. Roles, gigs, talent, salaries, and companies — without five tabs and a paywall.

<p align="left">
  <img src="public/favicon.svg" width="48" height="48" alt="Lattice mark" />
</p>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://lattice-beta-livid.vercel.app)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-black)](https://tanstack.com/start)
[![React](https://img.shields.io/badge/React-19-0052CC?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Live Demo

**https://lattice-beta-livid.vercel.app**

> **Status:** Production is a **seeded demo catalog** (~149 roles, 50 teams, 34 talent profiles, 22 gigs). Compensation is fictional. Posted listings, applications, bookmarks, and salary submissions persist in Postgres when `DATABASE_URL` is set. Without it the app uses embedded PGLite and reseeds on cold start. Sign-in is optional (bookmarks, applications, and talent profiles). Not an offering. No wallet connect.

This is the **only** public repo for the product.

---

## Screenshots

| Home | Roles |
|------|-------|
| ![Editorial homepage](docs/screenshots/01-home.png) | ![Roles index with filters](docs/screenshots/02-roles.png) |

| Role | Salaries |
|------|----------|
| ![Role detail](docs/screenshots/03-role-detail.png) | ![Salary observatory](docs/screenshots/04-salaries.png) |

| Talent |
|--------|
| ![Talent directory](docs/screenshots/05-talent.png) |

Share card: [docs/screenshots/social-preview.png](docs/screenshots/social-preview.png)

---

## Features

- Editorial homepage: featured role, new-this-week, companies hiring, manifesto
- Roles index with table and card views, persisted locally
- Filters for chain, scene, department, seniority, remote region, benefits, pay-in-crypto
- Compensation as cash + token + equity, with vesting and cliff on the card
- Gigs marketplace and simulated digital contracts
- Public talent directory plus a privacy-flagged talent collective
- Salary observatory (mean / min / max, seniority, region, language sparkline)
- Anonymous salary submit, alerts / RSS view, market pulse, learn hub
- Free employer post (Markdown, preview, no account required)
- Apply flow with screening questions; studio desk for inbound applications
- Light / dark theme (persisted), command palette, hover-reveal scrollbars

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| App | TanStack Start, React 19, TypeScript, Tailwind v4 |
| Data | Seeded catalog in `src/lib/catalog`. Postgres when `DATABASE_URL` is set; embedded PGLite otherwise |
| Auth | Optional Better Auth session for bookmarks, applications, and profiles |
| Hosting | Vercel |
| License | MIT |

---

## Quick Start

```bash
git clone https://github.com/devtechedge/lattice.git
cd lattice
npm install
npm run dev
```

Without `DATABASE_URL` the app uses embedded PGLite and seeds the catalog on first load.

```bash
npm run typecheck
npm run build
```

Env template: [.env.example](.env.example). Never commit secrets.

| Variable | Where | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Vercel | Neon pooled URI (`sslmode=require`). Omit locally. |

---

## License

MIT. See [LICENSE](LICENSE).

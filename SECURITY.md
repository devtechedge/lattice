# Security Policy

## Reporting a vulnerability

Do **not** open a public GitHub issue for a security report.

Use [GitHub private vulnerability reporting](https://github.com/devtechedge/lattice/security/advisories/new) on this repository.

Include:

- The affected URL or code path
- Steps to reproduce
- What you expect vs what happens
- Whether an account, application, or talent profile is involved

We will acknowledge valid reports and patch production before any write-up.

## What this app is

Lattice is a free Web3 career board: live roles from twenty crypto teams’ public Greenhouse, Lever, and Ashby JSON, plus talent, gigs, and a salary observatory. Production is [lattice-devtechedge1.vercel.app](https://lattice-devtechedge1.vercel.app). Search does not require an account. ATS pay is whatever the employer publishes (usually undisclosed here). Lattice does not invent a band. Contracts on `/contracts` are a **demo state machine**, not on-chain escrow and not a financial product. Not an offering. No wallet connect.

## In scope

- https://lattice-devtechedge1.vercel.app and the `devtechedge/lattice` codebase
- Stored XSS via Markdown in role / gig / talent copy (including guest-posted listings)
- Auth bypass on bookmarks, applications, studio ATS, talent profiles, alerts, or contracts
- SQL injection in search, applications, or studio
- Leak of `DATABASE_URL` or Better Auth secrets
- Unauthenticated dump of another user's applications or talent profile marked `hidden` / `network`
- Open redirect or `javascript:` links in Markdown or `applyUrl`

## Out of scope

- Rate limits on Vercel Hobby (in-memory, per-instance)
- Seed-catalog talent / gig copy being editorial, and ATS pay being undisclosed unless the employer publishes it
- The simulated gig/project contract flow (status changes only; no chain, no custody)
- Missing `HSTS` until a custom domain is attached
- Self-XSS
- Reports that require physical access to the operator's Vercel / GitHub account
- Third-party apply URLs after the visitor leaves this origin

## Hardening already in the tree

- Parameterized SQL only (`getSql` tagged templates; no string-concatenated queries)
- Authed server functions use `authMiddleware`; rows are scoped by the verified `context.userId`
- Studio applications are limited to roles the signed-in user posted (`role_id IN (SELECT … posted_roles)`)
- Public talent directory returns only profiles with `privacy === "public"`
- Markdown links pass through `safeHref` (`http:` / `https:` / same-origin path). `javascript:`, `data:`, and protocol-relative URLs render as text
- `applyUrl` on a posted role must be `https:`
- Live ATS fetch is server-side only against `boards-api.greenhouse.io`, `api.lever.co`, and `api.ashbyhq.com`. Host allow-list, `redirect: error`, 12s abort, 10-minute in-memory cache. Greenhouse lists use `?content=true` (falls back without content). Ashby lists use `includeCompensation=true`. Apply URLs must be an ATS host or the company’s first-party careers host. ATS pay is only employer-published numbers.
- Guest and authed listing payloads are size-capped (title, Markdown, arrays)
- Application stage updates accept a fixed enum
- Security headers (CSP, `nosniff`, `SAMEORIGIN`, COOP, Permissions-Policy, Referrer-Policy) via `vercel.json`
- No file resume upload; applications are form fields only
- No payments, no wallet connect, no seed phrases

## Secrets the operator must set

| Name | Where | Why |
|---|---|---|
| `DATABASE_URL` | Vercel (Neon) | Persistent listings / applications. Without it, production falls back to embedded PGLite and reseeds on cold start. |
| Better Auth secrets | Vercel, when sign-in is on | Session cookies. Never commit them. |

Rotate any of the above if it was pasted into chat, a ticket, or a screenshot.

## Residual risk (honest)

No public internet app is “unhackable.” Remaining limits:

- **Guest posting is on.** `/post/role` can insert a listing with `user_id` null so a visitor can post without an account. That is product intent (free, non-paid tier) and also accepted spam / XSS residual risk. Markdown is sanitized; it is not a moderation queue.
- **Anonymous salary submissions** are on (no account). Figures are not verified. Size-capped.
- CSP still allows `'unsafe-inline'` scripts because of the theme boot + TanStack hydration, and `https://grok.com` for the app-builder badge.
- Vercel Hobby has no durable per-IP rate limit across isolates.
- Counsel has not reviewed the legal drafts on `/terms` and `/privacy`.

If you run a fork, set `DATABASE_URL` before exposing sign-in to the public internet.

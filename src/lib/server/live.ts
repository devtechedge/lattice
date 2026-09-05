import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BOARDS, BOARD_BY_ID, COMPANY_IDS, type LiveBoard } from "@/lib/catalog/boards";
import {
  mapAshbyJob,
  mapGreenhouseJob,
  mapLeverJob,
  parseLiveSlug,
  type AshbyJob,
  type GreenhouseJob,
  type LeverJob,
} from "@/lib/catalog/greenhouse";
import type { Role } from "@/lib/catalog/types";

/** Serve cached lists for 10 minutes. */
const TTL_MS = 10 * 60 * 1000;
/** Soft age: still return stale immediately while a refresh runs. */
const STALE_MS = 60 * 60 * 1000;
/** Per-board timeout for the list path (was 12s — too slow on hard refresh). */
const LIST_FETCH_MS = 4_000;
/** Detail fetches can afford a bit more. */
const DETAIL_FETCH_MS = 8_000;

type Cache<T> = { at: number; value: T };
let listCache: Cache<Role[]> | undefined;
let listInflight: Promise<Role[]> | undefined;
const jobCache = new Map<string, Cache<Role>>();

function httpsUrl(host: string, path: string): URL {
  const u = new URL(`https://${host}${path}`);
  if (u.hostname !== host || u.protocol !== "https:") throw new Error("blocked host");
  return u;
}

async function getJson(url: URL, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      redirect: "error",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`ats ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

function isGh(x: unknown): x is GreenhouseJob {
  if (!x || typeof x !== "object") return false;
  const j = x as GreenhouseJob;
  return (typeof j.id === "number" || typeof j.id === "string") && typeof j.title === "string";
}

function isLever(x: unknown): x is LeverJob {
  if (!x || typeof x !== "object") return false;
  const j = x as LeverJob;
  return typeof j.id === "string" && typeof j.text === "string";
}

function isAshby(x: unknown): x is AshbyJob {
  if (!x || typeof x !== "object") return false;
  const j = x as AshbyJob;
  return typeof j.id === "string" && typeof j.title === "string";
}

function ghUrl(token: string, extra = "", search = ""): URL {
  if (!/^[a-z0-9-]+$/i.test(token)) throw new Error("blocked token");
  const u = httpsUrl("boards-api.greenhouse.io", `/v1/boards/${token}/jobs${extra}${search}`);
  if (!u.pathname.startsWith("/v1/boards/")) throw new Error("blocked host");
  return u;
}

function leverUrl(token: string, extra = ""): URL {
  if (!/^[a-z0-9-]+$/i.test(token)) throw new Error("blocked token");
  return httpsUrl("api.lever.co", `/v0/postings/${token}${extra}`);
}

function ashbyUrl(token: string): URL {
  if (!/^[a-z0-9._-]+$/i.test(token)) throw new Error("blocked token");
  return httpsUrl("api.ashbyhq.com", `/posting-api/job-board/${token}?includeCompensation=true`);
}

/** List path: skip Greenhouse `?content=true` (multi-MB HTML). Metadata pay still works; detail fetch fills body. */
async function loadBoard(board: LiveBoard): Promise<Role[]> {
  if (board.ats === "greenhouse") {
    const data = (await getJson(ghUrl(board.board), LIST_FETCH_MS)) as { jobs?: unknown };
    const jobs = Array.isArray(data.jobs) ? data.jobs.filter(isGh) : [];
    return jobs.map((j) => mapGreenhouseJob(j, board));
  }
  if (board.ats === "lever") {
    const data = await getJson(leverUrl(board.board, "?mode=json"), LIST_FETCH_MS);
    const jobs = Array.isArray(data) ? data.filter(isLever) : [];
    return jobs.map((j) => mapLeverJob(j, board));
  }
  const data = (await getJson(ashbyUrl(board.board), LIST_FETCH_MS)) as { jobs?: unknown };
  const jobs = Array.isArray(data.jobs) ? data.jobs.filter(isAshby) : [];
  return jobs.map((j) => mapAshbyJob(j, board)).filter((r): r is Role => r !== null);
}

async function refreshAllLiveRoles(): Promise<Role[]> {
  if (listInflight) return listInflight;
  listInflight = (async () => {
    try {
      const results = await Promise.allSettled(BOARDS.map((b) => loadBoard(b)));
      const roles = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      roles.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
      listCache = { at: Date.now(), value: roles };
      return roles;
    } finally {
      listInflight = undefined;
    }
  })();
  return listInflight;
}

export async function loadAllLiveRoles(): Promise<Role[]> {
  const now = Date.now();
  if (listCache && now - listCache.at < TTL_MS) return listCache.value;
  // Stale-while-revalidate: return last good list immediately on warm isolates.
  if (listCache && now - listCache.at < STALE_MS) {
    void refreshAllLiveRoles();
    return listCache.value;
  }
  return refreshAllLiveRoles();
}

async function loadOne(board: LiveBoard, jobId: string): Promise<Role | null> {
  if (board.ats === "greenhouse") {
    if (!/^\d{4,12}$/.test(jobId)) return null;
    const data = await getJson(ghUrl(board.board, `/${jobId}`), DETAIL_FETCH_MS);
    if (!isGh(data)) return null;
    return mapGreenhouseJob(data, board);
  }
  if (board.ats === "lever") {
    if (!/^[a-z0-9-]{8,80}$/i.test(jobId)) return null;
    const data = await getJson(leverUrl(board.board, `/${jobId}?mode=json`), DETAIL_FETCH_MS);
    if (!isLever(data)) return null;
    return mapLeverJob(data, board);
  }
  const list = await loadAllLiveRoles();
  return list.find((r) => r.slug === `${board.id}-${jobId}`) ?? null;
}

function slim(role: Role): Role {
  if (role.descriptionMarkdown.length <= 400) return role;
  return { ...role, descriptionMarkdown: `${role.descriptionMarkdown.slice(0, 400).trim()}…` };
}

export const listLiveRoles = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const roles = await loadAllLiveRoles();
    return roles.map(slim);
  } catch {
    return [] as Role[];
  }
});

export const getLiveRole = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().max(120) }))
  .handler(async ({ data }) => {
    const parsed = parseLiveSlug(data.slug, COMPANY_IDS);
    if (!parsed) return null;
    const board = BOARD_BY_ID.get(parsed.companyId);
    if (!board) return null;
    const cached = jobCache.get(data.slug);
    if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
    try {
      const role = await loadOne(board, parsed.jobId);
      if (role) jobCache.set(data.slug, { at: Date.now(), value: role });
      return role;
    } catch {
      const list = await loadAllLiveRoles().catch(() => [] as Role[]);
      return list.find((r) => r.slug === data.slug) ?? null;
    }
  });

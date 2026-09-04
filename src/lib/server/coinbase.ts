import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mapGreenhouseJob, parseCoinbaseSlug, type GreenhouseJob } from "@/lib/catalog/greenhouse";
import type { Role } from "@/lib/catalog/types";

const BOARD_HOST = "boards-api.greenhouse.io";
const BOARD_PREFIX = "/v1/boards/coinbase/jobs";
const TTL_MS = 10 * 60 * 1000;

type Cache<T> = { at: number; value: T };
let listCache: Cache<Role[]> | undefined;
const jobCache = new Map<string, Cache<Role>>();

function boardUrl(path = ""): URL {
  const u = new URL(`https://${BOARD_HOST}${BOARD_PREFIX}${path}`);
  if (u.hostname !== BOARD_HOST || u.protocol !== "https:" || !u.pathname.startsWith(BOARD_PREFIX)) {
    throw new Error("blocked host");
  }
  return u;
}

async function getJson(url: URL): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      redirect: "error",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`greenhouse ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

function isJob(x: unknown): x is GreenhouseJob {
  if (!x || typeof x !== "object") return false;
  const j = x as GreenhouseJob;
  return (typeof j.id === "number" || typeof j.id === "string") && typeof j.title === "string";
}

export async function loadCoinbaseList(): Promise<Role[]> {
  if (listCache && Date.now() - listCache.at < TTL_MS) return listCache.value;
  const data = (await getJson(boardUrl())) as { jobs?: unknown };
  const jobs = Array.isArray(data.jobs) ? data.jobs.filter(isJob) : [];
  const roles = jobs.map(mapGreenhouseJob).sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  listCache = { at: Date.now(), value: roles };
  return roles;
}

export async function loadCoinbaseJob(id: string): Promise<Role | null> {
  const cached = jobCache.get(id);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
  const data = await getJson(boardUrl(`/${id}`));
  if (!isJob(data)) return null;
  const role = mapGreenhouseJob(data);
  jobCache.set(id, { at: Date.now(), value: role });
  return role;
}

export const listCoinbaseRoles = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await loadCoinbaseList();
  } catch {
    return [] as Role[];
  }
});

export const getCoinbaseRole = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().max(40) }))
  .handler(async ({ data }) => {
    const id = parseCoinbaseSlug(data.slug);
    if (!id) return null;
    try {
      return await loadCoinbaseJob(id);
    } catch {
      const list = await loadCoinbaseList().catch(() => [] as Role[]);
      return list.find((r) => r.slug === data.slug) ?? null;
    }
  });

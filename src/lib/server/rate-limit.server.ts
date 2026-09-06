import { getRequest } from "@tanstack/react-start/server";

/** In-memory, per-isolate. Honest on Vercel Hobby — not a global edge rate limit. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export class RateLimitError extends Error {
  readonly status = 429;
  constructor(message = "Too many requests") {
    super(message);
    this.name = "RateLimitError";
  }
}

export function clientIpKey(prefix: string): string {
  const req = getRequest();
  const xf = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = xf || req?.headers.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}

export function assertRateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  if (b.count > limit) throw new RateLimitError();
}

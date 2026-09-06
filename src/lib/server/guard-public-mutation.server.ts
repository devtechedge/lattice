import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { assertRateLimit, clientIpKey } from "./rate-limit.server";

/** Same-site + per-IP rate limit for unauthenticated mutating server functions. */
export function guardPublicMutation(bucket: string, limit: number, windowMs: number): void {
  assertSameSiteRequest();
  assertRateLimit(clientIpKey(bucket), limit, windowMs);
}

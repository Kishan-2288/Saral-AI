/**
 * Tiny in-memory sliding-window limiter.
 * LIMITATION: state is per server instance. On serverless/multi-instance hosting, replace with a shared
 * store (Upstash Redis, Cloudflare rate limiting rules) — see README "Security".
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { allowed: boolean; retryAfterMs: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { allowed: false, retryAfterMs: windowMs - (now - recent[0]) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimit() { hits.clear(); }

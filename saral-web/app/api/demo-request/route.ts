import { NextResponse, type NextRequest } from "next/server";
import { demoServerSchema, type DemoApiResponse } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND = (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const SECRET = process.env.TURNSTILE_SECRET_KEY ?? "";
const IS_PROD = process.env.NODE_ENV === "production";

const json = (body: DemoApiResponse, status = 200, headers?: Record<string, string>) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const body = new URLSearchParams({ secret: SECRET, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch { return false; }
}

/**
 * Proxies a validated demo request to the existing backend: POST {BACKEND_URL}/api/v1/demo-requests/
 * Success is reported ONLY if the backend confirms (res.ok && data.success), same contract as the old site.
 * Request bodies are never logged (they contain personal data).
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`demo:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) });

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ ok: false, error: "validation" }, 400); }

  const parsed = demoServerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] = i.message;
    return json({ ok: false, error: "validation", fieldErrors }, 400);
  }
  const { turnstileToken, website, ...lead } = parsed.data;

  // Honeypot filled: act as if it worked, send nothing.
  if (website) return json({ ok: true });

  if (SECRET) {
    if (!turnstileToken || !(await verifyTurnstile(turnstileToken, ip))) return json({ ok: false, error: "captcha" }, 403);
  } else if (IS_PROD) {
    return json({ ok: false, error: "unavailable" }, 503); // refuse to run unprotected in production
  }

  try {
    const res = await fetch(`${BACKEND}/api/v1/demo-requests/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name, email: lead.email, phone: lead.phone, organization: lead.organization,
        industry: lead.industry, monthly_conversations: lead.monthlyConversations, primary_challenge: lead.primaryChallenge,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; leadId?: string };
    if (res.ok && data.success) return json({ ok: true, leadId: data.leadId });
    return json({ ok: false, error: "unavailable" }, 502);
  } catch {
    return json({ ok: false, error: "unavailable" }, 502);
  }
}

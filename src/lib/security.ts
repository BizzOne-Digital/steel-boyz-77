import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { connectDB } from "@/lib/mongodb";
import { RateLimit } from "@/models";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return s;
}

/** Keyed hash so a leaked database cannot be used to forge session cookies. */
export function hmac(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function clientIp(headers: Headers) {
  return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * CSRF defence for state-changing requests: the Origin (or Referer) must match
 * the host serving the request. Combined with SameSite=Strict session cookies.
 */
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false;
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Fixed-window rate limiter stored in MongoDB so it holds across serverless instances. */
export async function rateLimit(bucket: string, id: string, limit: number, windowSeconds: number) {
  await connectDB();
  const windowStart = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `${bucket}:${hmac(id).slice(0, 32)}:${windowStart}`;
  const doc = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((windowStart + 1) * windowSeconds * 1000) } },
    { upsert: true, new: true, projection: { count: 1 } },
  ).lean<{ count: number }>();
  return { ok: (doc?.count ?? 0) <= limit, retryAfter: windowSeconds };
}

import "server-only";
import { NextResponse, connection } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentAdmin, type AdminIdentity } from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";
import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/models";

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

export function jsonOk(data: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status, headers: { "Cache-Control": "no-store" } });
}

type Handler<C> = (req: Request, ctx: C, admin: AdminIdentity) => Promise<Response>;

/**
 * Wraps every admin Route Handler: database-backed session check,
 * same-origin check for mutations, and uniform error handling.
 */
export function withAdmin<C = unknown>(handler: Handler<C>) {
  return async (req: Request, ctx: C) => {
    // Request-time only. Outside the try so Next's prerender bailout is not swallowed.
    await connection();
    try {
      if (req.method !== "GET" && req.method !== "HEAD" && !isSameOrigin(req)) {
        return jsonError("Invalid request origin", 403);
      }
      const admin = await getCurrentAdmin();
      if (!admin) return jsonError("Authentication required", 401);
      return await handler(req, ctx, admin);
    } catch (err) {
      if (err instanceof SyntaxError) return jsonError("Invalid JSON body", 400);
      if ((err as { status?: number }).status === 413) return jsonError("Payload too large", 413);
      console.error("[admin api]", err);
      const dup = (err as { code?: number })?.code === 11000;
      return jsonError(dup ? "That slug or value is already in use" : "Something went wrong. Please try again.", dup ? 409 : 500);
    }
  };
}

export async function audit(admin: AdminIdentity, action: string, resource: string, resourceId = "", summary = "") {
  try {
    await connectDB();
    await AuditLog.create({ adminId: admin.id, adminEmail: admin.email, action, resource, resourceId, summary: summary.slice(0, 200) });
  } catch (err) {
    console.error("[audit]", err);
  }
}

export const TAGS = {
  settings: "settings",
  page: (slug: string) => `page:${slug}`,
  services: "services",
  teams: "teams",
  leadership: "leadership",
  merchandise: "merchandise",
  faqs: "faqs",
} as const;

/** Route Handlers cannot call updateTag; expire: 0 makes the next request fetch fresh data. */
export function invalidate(...tags: string[]) {
  for (const t of tags) revalidateTag(t, { expire: 0 });
}

export function invalidateAllContent() {
  invalidate(TAGS.settings, TAGS.services, TAGS.teams, TAGS.leadership, TAGS.merchandise, TAGS.faqs, ...["home", "about", "services", "team", "contact"].map(TAGS.page));
}

export async function readJson(req: Request, maxBytes = 512 * 1024): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) throw Object.assign(new Error("Payload too large"), { status: 413 });
  return JSON.parse(text);
}

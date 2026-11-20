import { z } from "zod";
import { connectDB, isDbConfigured } from "@/lib/mongodb";
import { clientIp, isSameOrigin, rateLimit } from "@/lib/security";
import { createSession, verifyAgainstDummy, verifyPassword } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { AdminUser, AuditLog } from "@/models";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError("Invalid request origin", 403);
  if (!isDbConfigured()) return jsonError("Database is not configured", 503);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Enter a valid email and password", 422);
  const { email, password } = parsed.data;

  try {
    await connectDB();
    const ip = clientIp(req.headers);
    const [byIp, byEmail] = await Promise.all([rateLimit("login-ip", ip, 10, 900), rateLimit("login-email", email, 5, 900)]);
    if (!byIp.ok || !byEmail.ok) return jsonError("Too many login attempts. Please wait 15 minutes and try again.", 429);

    const user = await AdminUser.findOne({ email }).select("+passwordHash").lean<{ _id: unknown; passwordHash: string; email: string }>();
    if (!user) {
      await verifyAgainstDummy(password);
      return jsonError("Invalid email or password", 401);
    }
    if (!(await verifyPassword(password, user.passwordHash))) return jsonError("Invalid email or password", 401);

    await createSession(String(user._id), req.headers.get("user-agent") ?? "");
    await AdminUser.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    await AuditLog.create({ adminId: user._id, adminEmail: user.email, action: "login", resource: "auth" });
    return jsonOk();
  } catch (err) {
    console.error("[login]", err);
    return jsonError("Login failed. Please try again.", 500);
  }
}

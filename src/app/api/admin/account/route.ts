import { z } from "zod";
import { withAdmin, jsonError, jsonOk, audit, readJson } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { createSession, destroyAllSessions, hashPassword, passwordSchema, verifyPassword } from "@/lib/auth";
import { formatZodError } from "@/lib/fields";
import { AdminUser } from "@/models";

export const GET = withAdmin(async (_req, _ctx, admin) => jsonOk({ admin }));

const schema = z
  .object({
    name: z.string().trim().min(2).max(80),
    currentPassword: z.string().max(128).default(""),
    newPassword: z.union([z.literal(""), passwordSchema]).default(""),
  })
  .strict();

export const PUT = withAdmin(async (req, _ctx, admin) => {
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(formatZodError(parsed.error), 422);
  const { name, currentPassword, newPassword } = parsed.data;
  await connectDB();
  const update: Record<string, unknown> = { name };

  if (newPassword) {
    const user = await AdminUser.findById(admin.id).select("+passwordHash").lean<{ passwordHash: string }>();
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) return jsonError("Current password is incorrect", 403);
    update.passwordHash = await hashPassword(newPassword);
  }
  await AdminUser.updateOne({ _id: admin.id }, { $set: update });

  if (newPassword) {
    // Sign out every other device, then issue a fresh session for this one.
    await destroyAllSessions(admin.id);
    await createSession(admin.id, req.headers.get("user-agent") ?? "");
    await audit(admin, "password-change", "account", admin.id);
  } else {
    await audit(admin, "update", "account", admin.id, "Profile updated");
  }
  return jsonOk();
});

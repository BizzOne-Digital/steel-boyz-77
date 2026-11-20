import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { hmac, randomToken } from "@/lib/security";
import { SESSION_COOKIE, SESSION_TTL_HOURS } from "@/lib/constants";
import { AdminSession, AdminUser } from "@/models";
import { z } from "zod";

export type AdminIdentity = { id: string; name: string; email: string; role: string };

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128)
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/\d/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a symbol");

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Used to keep login timing similar whether or not the email exists.
let dummyHash: Promise<string> | null = null;
export async function verifyAgainstDummy(password: string) {
  dummyHash ??= bcrypt.hash(randomToken(16), 12);
  await bcrypt.compare(password, await dummyHash);
}

export async function createSession(userId: string, userAgent: string) {
  await connectDB();
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);
  await AdminSession.create({ userId, sessionTokenHash: hmac(token), expiresAt, userAgent: userAgent.slice(0, 300) });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

/** Database-backed session check. Use in Route Handlers and Server Components. */
export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  await connectDB();
  const session = await AdminSession.findOne({ sessionTokenHash: hmac(token), expiresAt: { $gt: new Date() } })
    .select({ userId: 1 })
    .lean<{ userId: unknown }>();
  if (!session) return null;
  const user = await AdminUser.findById(session.userId).select({ name: 1, email: 1, role: 1 }).lean<{
    _id: unknown;
    name: string;
    email: string;
    role: string;
  }>();
  if (!user) return null;
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await connectDB();
    await AdminSession.deleteOne({ sessionTokenHash: hmac(token) });
  }
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string) {
  await connectDB();
  await AdminSession.deleteMany({ userId });
}

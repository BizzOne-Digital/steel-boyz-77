/**
 * Creates the first administrator from server-side environment variables.
 *
 *   ADMIN_SETUP_EMAIL=... ADMIN_SETUP_PASSWORD=... npm run create-admin
 *
 * - Refuses weak passwords.
 * - Refuses to overwrite an existing admin with the same email
 *   (pass --reset-password to deliberately reset that admin's password).
 * - Remove ADMIN_SETUP_PASSWORD from your environment after running.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { z } from "zod";
import { AdminSession, AdminUser, AuditLog, RateLimit, StoredUpload, UploadChunk, ContactSubmission } from "../src/models";

const password = z
  .string()
  .min(12, "at least 12 characters")
  .regex(/[a-z]/, "a lowercase letter")
  .regex(/[A-Z]/, "an uppercase letter")
  .regex(/\d/, "a number")
  .regex(/[^A-Za-z0-9]/, "a symbol");

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_SETUP_EMAIL?.trim().toLowerCase();
  const pass = process.env.ADMIN_SETUP_PASSWORD ?? "";
  const name = process.env.ADMIN_SETUP_NAME?.trim() || "Administrator";
  const reset = process.argv.includes("--reset-password");

  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!email || !z.string().email().safeParse(email).success) throw new Error("ADMIN_SETUP_EMAIL must be a valid email");
  const check = password.safeParse(pass);
  if (!check.success) throw new Error(`ADMIN_SETUP_PASSWORD needs ${check.error.issues.map((i) => i.message).join(", ")}`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  await Promise.all([AdminUser, AdminSession, AuditLog, RateLimit, StoredUpload, UploadChunk, ContactSubmission].map((m) => m.syncIndexes()));

  const existing = await AdminUser.findOne({ email });
  const passwordHash = await bcrypt.hash(pass, 12);
  if (existing) {
    if (!reset) throw new Error(`An admin with ${email} already exists. Use --reset-password to reset it.`);
    await AdminUser.updateOne({ _id: existing._id }, { $set: { passwordHash } });
    await AdminSession.deleteMany({ userId: existing._id });
    console.log(`Password reset for ${email}. All of that admin's sessions were signed out.`);
  } else {
    const isFirst = (await AdminUser.estimatedDocumentCount()) === 0;
    await AdminUser.create({ name, email, passwordHash, role: isFirst ? "owner" : "admin" });
    console.log(`Admin created: ${email}${isFirst ? " (owner)" : ""}`);
  }
  console.log("Remove ADMIN_SETUP_PASSWORD from your environment now.");
}

main()
  .catch((err) => {
    console.error("create-admin failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

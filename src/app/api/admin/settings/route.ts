import { withAdmin, jsonError, jsonOk, audit, invalidateAllContent, readJson } from "@/lib/api";
import { connectDB, toPlain } from "@/lib/mongodb";
import { SETTINGS_FIELDS } from "@/lib/content/schema";
import { DEFAULT_SETTINGS } from "@/lib/content/defaults";
import { fieldsToZod, formatZodError } from "@/lib/fields";
import { deepMerge } from "@/lib/merge";
import { isSmtpConfigured } from "@/lib/mailer";
import { cleanupOrphans, removedUrls } from "@/lib/uploads";
import { SiteSettingsModel } from "@/models";

export const GET = withAdmin(async () => {
  await connectDB();
  const doc = await SiteSettingsModel.findOne({ key: "site" }).select({ _id: 0, __v: 0, key: 0, createdAt: 0 }).lean();
  return jsonOk({ settings: deepMerge(DEFAULT_SETTINGS, toPlain(doc ?? {})), smtpConfigured: isSmtpConfigured() });
});

export const PUT = withAdmin(async (req, _ctx, admin) => {
  const parsed = fieldsToZod(SETTINGS_FIELDS).safeParse(await readJson(req));
  if (!parsed.success) return jsonError(formatZodError(parsed.error), 422);
  await connectDB();
  const before = await SiteSettingsModel.findOne({ key: "site" }).lean();
  await SiteSettingsModel.updateOne({ key: "site" }, { $set: parsed.data }, { upsert: true });
  // Settings feed the header, footer and metadata of every page.
  invalidateAllContent();
  await cleanupOrphans(removedUrls(before, parsed.data));
  await audit(admin, "update", "settings", "site", "Site settings");
  return jsonOk();
});

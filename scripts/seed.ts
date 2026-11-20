/**
 * Idempotent seed: inserts verified starter content ONLY where it is missing.
 * Existing admin edits are never overwritten. Safe to run more than once.
 *
 *   npm run seed
 */
import mongoose from "mongoose";
import {
  DEFAULT_FAQS, DEFAULT_LEADERSHIP, DEFAULT_MERCHANDISE, DEFAULT_PAGES, DEFAULT_SERVICES, DEFAULT_SETTINGS, DEFAULT_TEAMS,
} from "../src/lib/content/defaults";
import { PAGE_LABELS, PAGE_SLUGS } from "../src/lib/content/schema";
import { FAQ, LeadershipMember, Merchandise, Page, Service, SiteSettingsModel, Team } from "../src/models";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local first.");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const report: string[] = [];

  // Insert-only upserts: $setOnInsert never touches an existing document.
  const s = await SiteSettingsModel.updateOne({ key: "site" }, { $setOnInsert: { key: "site", ...DEFAULT_SETTINGS } }, { upsert: true });
  report.push(`settings: ${s.upsertedCount ? "created" : "kept existing"}`);

  for (const slug of PAGE_SLUGS) {
    const r = await Page.updateOne(
      { slug },
      { $setOnInsert: { slug, title: PAGE_LABELS[slug].label, content: DEFAULT_PAGES[slug], published: true } },
      { upsert: true },
    );
    report.push(`page ${slug}: ${r.upsertedCount ? "created" : "kept existing"}`);
  }

  // Collections are only seeded when completely empty, so deleted items stay deleted.
  const collections = [
    ["services", Service, DEFAULT_SERVICES],
    ["teams", Team, DEFAULT_TEAMS],
    ["leadership", LeadershipMember, DEFAULT_LEADERSHIP],
    ["merchandise", Merchandise, DEFAULT_MERCHANDISE],
    ["faqs", FAQ, DEFAULT_FAQS],
  ] as const;
  for (const [name, model, rows] of collections) {
    const count = await model.estimatedDocumentCount();
    if (count === 0) {
      await model.insertMany(rows as unknown[]);
      report.push(`${name}: inserted ${rows.length}`);
    } else {
      report.push(`${name}: kept existing (${count})`);
    }
  }

  await Promise.all([Service, Team, LeadershipMember, Merchandise, FAQ, Page, SiteSettingsModel].map((m) => m.syncIndexes()));
  console.log(report.map((l) => `  • ${l}`).join("\n"));
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

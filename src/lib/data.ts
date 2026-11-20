import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB, isDbConfigured, toPlain } from "@/lib/mongodb";
import {
  DEFAULT_FAQS,
  DEFAULT_LEADERSHIP,
  DEFAULT_MERCHANDISE,
  DEFAULT_PAGES,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  DEFAULT_TEAMS,
  type PagesContent,
  type SiteSettings,
} from "@/lib/content/defaults";
import type { PageSlug } from "@/lib/content/schema";
import { FAQ, LeadershipMember, Merchandise, Page, Service, SiteSettingsModel, Team } from "@/models";
import { deepMerge } from "@/lib/merge";

export type ServiceItem = (typeof DEFAULT_SERVICES)[number] & { _id?: string };
export type TeamItem = (typeof DEFAULT_TEAMS)[number] & { _id?: string };
export type LeaderItem = (typeof DEFAULT_LEADERSHIP)[number] & { _id?: string };
export type MerchItem = (typeof DEFAULT_MERCHANDISE)[number] & { _id?: string };
export type FaqItem = (typeof DEFAULT_FAQS)[number] & { _id?: string };

/**
 * Public content is read through `use cache` with tags. Admin mutations call
 * revalidateTag(tag, { expire: 0 }) so the next visitor gets fresh content.
 * If the database is not configured or unreachable, verified defaults render
 * instead of an error page.
 */
async function safely<T>(label: string, fallback: T, run: () => Promise<T>): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    await connectDB();
    return await run();
  } catch (err) {
    console.error(`[data] ${label} failed, using defaults:`, (err as Error).message);
    return fallback;
  }
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  return safely("settings", DEFAULT_SETTINGS, async () => {
    const doc = await SiteSettingsModel.findOne({ key: "site" }).select({ _id: 0, __v: 0, key: 0 }).lean();
    return doc ? deepMerge(DEFAULT_SETTINGS, toPlain(doc)) : DEFAULT_SETTINGS;
  });
}

export async function getPage<S extends PageSlug>(slug: S): Promise<PagesContent[S]> {
  "use cache";
  cacheTag(`page:${slug}`);
  cacheLife("hours");
  const fallback = DEFAULT_PAGES[slug];
  return safely(`page:${slug}`, fallback, async () => {
    const doc = await Page.findOne({ slug }).select({ content: 1 }).lean<{ content?: unknown }>();
    return doc?.content ? deepMerge(fallback, toPlain(doc.content)) : fallback;
  });
}

function listGetter<T>(tag: string, label: string, fallback: T[], query: () => Promise<unknown[]>) {
  return safely(label, fallback, async () => {
    const docs = await query();
    return toPlain<T[]>(docs.map((d) => ({ ...(d as object), _id: String((d as { _id: unknown })._id) })));
  });
}

const PUBLIC = { __v: 0, createdAt: 0, updatedAt: 0 };

export async function getServices(): Promise<ServiceItem[]> {
  "use cache";
  cacheTag("services");
  cacheLife("hours");
  return listGetter("services", "services", DEFAULT_SERVICES, () =>
    Service.find({ active: true }).select(PUBLIC).sort({ displayOrder: 1 }).limit(20).lean(),
  );
}

export async function getTeams(): Promise<TeamItem[]> {
  "use cache";
  cacheTag("teams");
  cacheLife("hours");
  return listGetter("teams", "teams", DEFAULT_TEAMS, () =>
    Team.find({ active: true }).select(PUBLIC).sort({ displayOrder: 1 }).limit(20).lean(),
  );
}

export async function getLeadership(): Promise<LeaderItem[]> {
  "use cache";
  cacheTag("leadership");
  cacheLife("hours");
  return listGetter("leadership", "leadership", DEFAULT_LEADERSHIP, () =>
    LeadershipMember.find({ active: true }).select(PUBLIC).sort({ displayOrder: 1 }).limit(20).lean(),
  );
}

export async function getMerchandise(): Promise<MerchItem[]> {
  "use cache";
  cacheTag("merchandise");
  cacheLife("hours");
  return listGetter("merchandise", "merchandise", DEFAULT_MERCHANDISE, () =>
    Merchandise.find({ active: true }).select(PUBLIC).sort({ displayOrder: 1 }).limit(20).lean(),
  );
}

export async function getFaqs(): Promise<FaqItem[]> {
  "use cache";
  cacheTag("faqs");
  cacheLife("hours");
  return listGetter("faqs", "faqs", DEFAULT_FAQS, () =>
    FAQ.find({ active: true }).select(PUBLIC).sort({ displayOrder: 1 }).limit(40).lean(),
  );
}

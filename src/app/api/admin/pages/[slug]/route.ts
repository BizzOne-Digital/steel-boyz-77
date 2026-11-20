import { withAdmin, jsonError, jsonOk, audit, invalidate, readJson, TAGS } from "@/lib/api";
import { connectDB, toPlain } from "@/lib/mongodb";
import { PAGE_FIELDS, PAGE_LABELS, PAGE_SLUGS, HOME_SECTION_KEYS, type PageSlug } from "@/lib/content/schema";
import { DEFAULT_PAGES } from "@/lib/content/defaults";
import { fieldsToZod, formatZodError } from "@/lib/fields";
import { deepMerge } from "@/lib/merge";
import { cleanupOrphans, removedUrls } from "@/lib/uploads";
import { Page } from "@/models";

type Ctx = { params: Promise<{ slug: string }> };

function isSlug(v: string): v is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(v);
}

export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const { slug } = await params;
  if (!isSlug(slug)) return jsonError("Unknown page", 404);
  await connectDB();
  const doc = await Page.findOne({ slug }).select({ content: 1, updatedAt: 1 }).lean<{ content?: unknown; updatedAt?: Date }>();
  return jsonOk({ content: deepMerge(DEFAULT_PAGES[slug], toPlain(doc?.content ?? {})), updatedAt: doc?.updatedAt ?? null });
});

export const PUT = withAdmin<Ctx>(async (req, { params }, admin) => {
  const { slug } = await params;
  if (!isSlug(slug)) return jsonError("Unknown page", 404);
  const parsed = fieldsToZod(PAGE_FIELDS[slug]).safeParse(await readJson(req));
  if (!parsed.success) return jsonError(formatZodError(parsed.error), 422);
  const content = parsed.data as Record<string, unknown>;

  if (slug === "home") {
    const order = (content.sectionOrder as string[]).map((s) => s.trim()).filter(Boolean);
    const bad = order.filter((k) => !(HOME_SECTION_KEYS as readonly string[]).includes(k));
    if (bad.length) return jsonError(`Unknown section keys: ${bad.join(", ")}`, 422);
    content.sectionOrder = order;
  }

  await connectDB();
  const before = await Page.findOne({ slug }).select({ content: 1 }).lean<{ content?: unknown }>();
  await Page.updateOne({ slug }, { $set: { content, title: PAGE_LABELS[slug].label, published: true } }, { upsert: true });
  invalidate(TAGS.page(slug));
  await cleanupOrphans(removedUrls(before?.content, content));
  await audit(admin, "update", "page", slug, PAGE_LABELS[slug].label);
  return jsonOk();
});

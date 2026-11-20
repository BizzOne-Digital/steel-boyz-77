import { withAdmin, jsonError, jsonOk, audit, invalidate, readJson } from "@/lib/api";
import { connectDB, toPlain } from "@/lib/mongodb";
import { collectionSchema, isCollectionKey, REGISTRY } from "@/lib/admin/registry";
import { formatZodError } from "@/lib/fields";
import { COLLECTION_META } from "@/lib/content/schema";

type Ctx = { params: Promise<{ resource: string }> };

export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const { resource } = await params;
  if (!isCollectionKey(resource)) return jsonError("Unknown resource", 404);
  await connectDB();
  const { model, sort } = REGISTRY[resource];
  const items = await model.find({}).select({ __v: 0 }).sort(sort).limit(200).lean();
  return jsonOk({ items: toPlain(items) });
});

export const POST = withAdmin<Ctx>(async (req, { params }, admin) => {
  const { resource } = await params;
  if (!isCollectionKey(resource)) return jsonError("Unknown resource", 404);
  const parsed = collectionSchema(resource).safeParse(await readJson(req));
  if (!parsed.success) return jsonError(formatZodError(parsed.error), 422);
  await connectDB();
  const { model, tag } = REGISTRY[resource];
  const created = await model.create(parsed.data);
  invalidate(tag);
  const title = String((parsed.data as Record<string, unknown>)[COLLECTION_META[resource].titleField] ?? "");
  await audit(admin, "create", resource, String(created._id), title);
  return jsonOk({ item: toPlain(created.toObject()) }, 201);
});

import { isValidObjectId } from "mongoose";
import { withAdmin, jsonError, jsonOk, audit, invalidate, readJson } from "@/lib/api";
import { connectDB, toPlain } from "@/lib/mongodb";
import { collectionSchema, isCollectionKey, REGISTRY } from "@/lib/admin/registry";
import { formatZodError } from "@/lib/fields";
import { COLLECTION_META } from "@/lib/content/schema";
import { cleanupOrphans, removedUrls } from "@/lib/uploads";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export const PATCH = withAdmin<Ctx>(async (req, { params }, admin) => {
  const { resource, id } = await params;
  if (!isCollectionKey(resource) || !isValidObjectId(id)) return jsonError("Not found", 404);
  const parsed = collectionSchema(resource).safeParse(await readJson(req));
  if (!parsed.success) return jsonError(formatZodError(parsed.error), 422);

  await connectDB();
  const { model, tag } = REGISTRY[resource];
  const before = await model.findById(id).lean();
  if (!before) return jsonError("Not found", 404);
  const updated = await model.findByIdAndUpdate(id, { $set: parsed.data }, { new: true, runValidators: true }).lean();
  invalidate(tag);
  // New image saved first; only now is the replaced upload removed (if nothing else uses it).
  await cleanupOrphans(removedUrls(before, updated));
  const title = String((parsed.data as Record<string, unknown>)[COLLECTION_META[resource].titleField] ?? "");
  await audit(admin, "update", resource, id, title);
  return jsonOk({ item: toPlain(updated) });
});

export const DELETE = withAdmin<Ctx>(async (_req, { params }, admin) => {
  const { resource, id } = await params;
  if (!isCollectionKey(resource) || !isValidObjectId(id)) return jsonError("Not found", 404);
  await connectDB();
  const { model, tag } = REGISTRY[resource];
  const doc = await model.findByIdAndDelete(id).lean<Record<string, unknown>>();
  if (!doc) return jsonError("Not found", 404);
  invalidate(tag);
  await cleanupOrphans(removedUrls(doc, {}));
  await audit(admin, "delete", resource, id, String(doc[COLLECTION_META[resource].titleField] ?? ""));
  return jsonOk();
});

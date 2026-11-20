import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { withAdmin, jsonError, jsonOk, audit, invalidateAllContent, readJson } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { findReferences, parseUploadUrl, replaceReferences, uploadUrl } from "@/lib/uploads";
import { StoredUpload } from "@/models";

type Ctx = { params: Promise<{ id: string }> };
type Upload = { _id: unknown; folder: string; filename: string };

async function load(id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  return StoredUpload.findById(id).select({ folder: 1, filename: 1 }).lean<Upload>();
}

/** Where is this image used? */
export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const doc = await load((await params).id);
  if (!doc) return jsonError("Not found", 404);
  return jsonOk({ references: await findReferences(uploadUrl(doc.folder, doc.filename)) });
});

/**
 * Replace: every reference to this image is pointed at `newUrl` (an existing
 * managed upload), then this file is deleted. Order guarantees no broken images.
 */
export const PUT = withAdmin<Ctx>(async (req, { params }, admin) => {
  const doc = await load((await params).id);
  if (!doc) return jsonError("Not found", 404);
  const body = z.object({ newUrl: z.string() }).safeParse(await readJson(req));
  const target = body.success ? parseUploadUrl(body.data.newUrl) : null;
  if (!target) return jsonError("newUrl must be a managed upload URL", 422);
  if (!(await StoredUpload.exists(target))) return jsonError("Replacement image not found", 404);

  const oldUrl = uploadUrl(doc.folder, doc.filename);
  const newUrl = uploadUrl(target.folder, target.filename);
  if (oldUrl === newUrl) return jsonError("Choose a different image", 422);
  const changed = await replaceReferences(oldUrl, newUrl);
  invalidateAllContent();
  await StoredUpload.deleteOne({ _id: doc._id });
  await audit(admin, "replace", "media", `${doc.folder}/${doc.filename}`, `Replaced in ${changed} document(s)`);
  return jsonOk({ changed, url: newUrl });
});

/** Delete only when unused, unless the admin explicitly confirms (`?force=1`). */
export const DELETE = withAdmin<Ctx>(async (req, { params }, admin) => {
  const doc = await load((await params).id);
  if (!doc) return jsonError("Not found", 404);
  const url = uploadUrl(doc.folder, doc.filename);
  const refs = await findReferences(url);
  const force = new URL(req.url).searchParams.get("force") === "1";
  if (refs.length && !force) {
    return jsonError(`This image is used in ${refs.length} place(s). Replace it first, or confirm deletion.`, 409, { references: refs });
  }
  await StoredUpload.deleteOne({ _id: doc._id });
  if (refs.length) invalidateAllContent();
  await audit(admin, "delete", "media", `${doc.folder}/${doc.filename}`, refs.length ? `Forced; was used in ${refs.length} place(s)` : "");
  return jsonOk();
});

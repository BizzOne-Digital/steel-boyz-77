import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { withAdmin, jsonError, jsonOk, audit, readJson } from "@/lib/api";
import { connectDB, toPlain } from "@/lib/mongodb";
import { formatZodError } from "@/lib/fields";
import { ContactSubmission } from "@/models";

type Ctx = { params: Promise<{ id: string }> };

const patch = z
  .object({
    status: z.enum(["new", "read", "replied"]).optional(),
    internalNotes: z.string().max(5000).optional(),
  })
  .strict();

export const PATCH = withAdmin<Ctx>(async (req, { params }, admin) => {
  const { id } = await params;
  if (!isValidObjectId(id)) return jsonError("Not found", 404);
  const parsed = patch.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(formatZodError(parsed.error), 422);
  await connectDB();
  const doc = await ContactSubmission.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).select({ submissionKey: 0, __v: 0 }).lean();
  if (!doc) return jsonError("Not found", 404);
  await audit(admin, "update", "inquiry", id, parsed.data.status ? `Status: ${parsed.data.status}` : "Notes updated");
  return jsonOk({ item: toPlain(doc) });
});

export const DELETE = withAdmin<Ctx>(async (_req, { params }, admin) => {
  const { id } = await params;
  if (!isValidObjectId(id)) return jsonError("Not found", 404);
  await connectDB();
  const doc = await ContactSubmission.findByIdAndDelete(id).select({ _id: 1 }).lean();
  if (!doc) return jsonError("Not found", 404);
  await audit(admin, "delete", "inquiry", id);
  return jsonOk();
});

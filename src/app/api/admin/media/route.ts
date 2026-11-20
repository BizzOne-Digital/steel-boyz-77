import { z } from "zod";
import { withAdmin, jsonError, jsonOk } from "@/lib/api";
import { connectDB, toPlain } from "@/lib/mongodb";
import { UPLOAD_FOLDERS } from "@/lib/fields";
import { uploadUrl } from "@/lib/uploads";
import { StoredUpload } from "@/models";

const query = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  folder: z.enum(["all", ...UPLOAD_FOLDERS]).default("all"),
  q: z.string().trim().max(100).default(""),
});
const PAGE_SIZE = 24;

export const GET = withAdmin(async (req) => {
  const parsed = query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return jsonError("Invalid filters");
  const { page, folder, q } = parsed.data;
  const filter: Record<string, unknown> = {};
  if (folder !== "all") filter.folder = folder;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ filename: rx }, { originalName: rx }];
  }
  await connectDB();
  // `data` is select:false on the schema, so image buffers never load here.
  const [items, total] = await Promise.all([
    StoredUpload.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean<
      { _id: unknown; folder: string; filename: string }[]
    >(),
    StoredUpload.countDocuments(filter),
  ]);
  return jsonOk({
    items: toPlain(items.map((i) => ({ ...i, url: uploadUrl(i.folder, i.filename) }))),
    total,
    page,
    pageSize: PAGE_SIZE,
  });
});

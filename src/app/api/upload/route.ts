import { z } from "zod";
import { withAdmin, jsonError, jsonOk, audit } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { MAX_UPLOAD_BYTES, UPLOAD_CHUNK_BYTES } from "@/lib/constants";
import { detectImageType, isUploadFolder, makeFilename, uploadUrl } from "@/lib/uploads";
import { rateLimit } from "@/lib/security";
import { StoredUpload, UploadChunk } from "@/models";

/**
 * POST /api/upload  (multipart/form-data)
 *
 * Direct mode (files up to ~4 MB, under Vercel's 4.5 MB request-body limit):
 *   file, folder
 *
 * Chunked mode (files up to 8 MB): the client splits the file into 3 MB chunks
 * and sends each as its own request:
 *   file (chunk), folder, uploadId (32 hex), index, total, originalName
 * The final request assembles, validates and stores the image, then returns
 * the same response shape as direct mode.
 */
const chunkMeta = z.object({
  uploadId: z.string().regex(/^[a-f0-9]{32}$/),
  index: z.coerce.number().int().min(0).max(3),
  total: z.coerce.number().int().min(1).max(Math.ceil(MAX_UPLOAD_BYTES / UPLOAD_CHUNK_BYTES)),
});

export const POST = withAdmin(async (req, _ctx, admin) => {
  const len = Number(req.headers.get("content-length") ?? 0);
  // Mirrors Vercel's 4.5 MB function body limit so local and production behave the same.
  if (len > 4.4 * 1024 * 1024) {
    return jsonError("Request too large. Files above 3 MB are sent in chunks automatically by the admin uploader.", 413);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Expected multipart form data");
  }

  const folder = form.get("folder");
  const file = form.get("file");
  if (!isUploadFolder(folder)) return jsonError("Invalid folder. Use products, gallery, pages or misc.");
  if (!(file instanceof Blob) || file.size === 0) return jsonError("No file received");

  await connectDB();
  const limit = await rateLimit("upload", admin.id, 120, 3600);
  if (!limit.ok) return jsonError("Upload limit reached. Try again later.", 429);

  const originalName = String(form.get("originalName") ?? (file instanceof File ? file.name : "")).slice(0, 200);
  let buffer: Buffer;

  if (form.has("uploadId")) {
    const meta = chunkMeta.safeParse({ uploadId: form.get("uploadId"), index: form.get("index"), total: form.get("total") });
    if (!meta.success || meta.data.index >= meta.data.total) return jsonError("Invalid chunk metadata");
    if (file.size > UPLOAD_CHUNK_BYTES) return jsonError("Chunk too large", 413);
    const { uploadId, index, total } = meta.data;

    await UploadChunk.updateOne(
      { uploadId, index },
      { $set: { total, adminId: admin.id, data: Buffer.from(await file.arrayBuffer()), createdAt: new Date() } },
      { upsert: true },
    );
    if (index < total - 1) return jsonOk({ chunk: index, received: true });

    const chunks = await UploadChunk.find({ uploadId, adminId: admin.id }).sort({ index: 1 }).lean<{ index: number; data: { buffer: ArrayBuffer } | Buffer }[]>();
    if (chunks.length !== total || chunks.some((c, i) => c.index !== i)) {
      return jsonError("Upload incomplete. Please try again.", 409);
    }
    buffer = Buffer.concat(chunks.map((c) => (Buffer.isBuffer(c.data) ? c.data : Buffer.from((c.data as { buffer: ArrayBuffer }).buffer))));
    await UploadChunk.deleteMany({ uploadId });
  } else {
    buffer = Buffer.from(await file.arrayBuffer());
  }

  if (buffer.length > MAX_UPLOAD_BYTES) return jsonError("File is larger than 8 MB", 413);
  const mime = detectImageType(buffer);
  if (!mime) return jsonError("Unsupported or invalid image. Use JPEG, PNG, WEBP or GIF.", 415);

  const filename = makeFilename(mime);
  await StoredUpload.create({ folder, filename, originalName, mimeType: mime, size: buffer.length, data: buffer });
  await audit(admin, "upload", "media", `${folder}/${filename}`, originalName);

  return jsonOk({ url: uploadUrl(folder, filename), filename, size: buffer.length, folder }, 201);
});

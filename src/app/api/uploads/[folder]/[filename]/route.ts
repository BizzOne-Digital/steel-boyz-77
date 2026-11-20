import { connectDB, isDbConfigured } from "@/lib/mongodb";
import { FILENAME_RE, isUploadFolder } from "@/lib/uploads";
import { StoredUpload } from "@/models";

type Ctx = { params: Promise<{ folder: string; filename: string }> };

function notFound() {
  return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
}

/** Public delivery of MongoDB-stored images. Filenames are unique and immutable. */
export async function GET(_req: Request, { params }: Ctx) {
  const { folder, filename } = await params;
  if (!isUploadFolder(folder) || !FILENAME_RE.test(filename)) return notFound();
  if (!isDbConfigured()) return notFound();

  try {
    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename })
      .select({ data: 1, mimeType: 1, size: 1 })
      .lean<{ data: Buffer | { buffer: ArrayBuffer }; mimeType: string; size: number }>();
    if (!doc) return notFound();
    const buf = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from((doc.data as { buffer: ArrayBuffer }).buffer);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (err) {
    console.error("[uploads]", err);
    return new Response("Error", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

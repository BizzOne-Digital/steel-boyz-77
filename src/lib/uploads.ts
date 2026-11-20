import "server-only";
import { randomBytes } from "node:crypto";
import type { Model } from "mongoose";
import { UPLOAD_FOLDERS, type UploadFolder } from "@/lib/fields";
import { LeadershipMember, Merchandise, Page, Service, SiteSettingsModel, StoredUpload, Team } from "@/models";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

/** Identify the real image type from magic bytes. Declared MIME types are not trusted. */
export function detectImageType(buf: Buffer): keyof typeof EXT | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  const head6 = buf.subarray(0, 6).toString("ascii");
  if (head6 === "GIF87a" || head6 === "GIF89a") return "image/gif";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export function isUploadFolder(v: unknown): v is UploadFolder {
  return typeof v === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(v);
}

export const FILENAME_RE = /^\d{13}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/;

export function makeFilename(mime: string) {
  return `${Date.now()}-${randomBytes(8).toString("hex")}.${EXT[mime]}`;
}

export function uploadUrl(folder: string, filename: string) {
  return `/api/uploads/${folder}/${filename}`;
}

export function parseUploadUrl(url: string): { folder: UploadFolder; filename: string } | null {
  const m = /^\/api\/uploads\/([a-z]+)\/([^/]+)$/.exec(url);
  if (!m || !isUploadFolder(m[1]) || !FILENAME_RE.test(m[2])) return null;
  return { folder: m[1], filename: m[2] };
}

/** Every content collection that can hold image URLs. Upload buffers live only in StoredUpload. */
const CONTENT_MODELS: [string, Model<unknown>][] = [
  ["page", Page],
  ["settings", SiteSettingsModel],
  ["service", Service],
  ["team", Team],
  ["leadership", LeadershipMember],
  ["merchandise", Merchandise],
];

export function collectUploadUrls(value: unknown, out = new Set<string>()) {
  if (typeof value === "string") {
    if (value.startsWith("/api/uploads/")) out.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectUploadUrls(v, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectUploadUrls(v, out));
  }
  return out;
}

export type Reference = { resource: string; id: string; label: string };

export async function findReferences(url: string): Promise<Reference[]> {
  const refs: Reference[] = [];
  for (const [resource, model] of CONTENT_MODELS) {
    const docs = await model.find({}).lean<Record<string, unknown>[]>();
    for (const d of docs) {
      if (collectUploadUrls(d).has(url)) {
        refs.push({ resource, id: String(d._id), label: String(d.title ?? d.name ?? d.slug ?? d.key ?? resource) });
      }
    }
  }
  return refs;
}

function deepReplace(value: unknown, from: string, to: string): unknown {
  if (value === from) return to;
  if (Array.isArray(value)) return value.map((v) => deepReplace(v, from, to));
  if (value && typeof value === "object" && !(value instanceof Date) && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepReplace(v, from, to)]));
  }
  return value;
}

/** Point every reference at a new image, so the old one can be removed safely. */
export async function replaceReferences(from: string, to: string) {
  let changed = 0;
  for (const [, model] of CONTENT_MODELS) {
    const docs = await model.find({}).lean<Record<string, unknown>[]>();
    for (const d of docs) {
      if (!collectUploadUrls(d).has(from)) continue;
      const { _id, ...rest } = d;
      const next = deepReplace(JSON.parse(JSON.stringify(rest)), from, to) as Record<string, unknown>;
      delete next.createdAt;
      delete next.updatedAt;
      delete next.__v;
      await model.updateOne({ _id }, { $set: next });
      changed++;
    }
  }
  return changed;
}

/** After content changes, delete uploads that the change orphaned. Never deletes referenced files. */
export async function cleanupOrphans(candidates: Iterable<string>) {
  for (const url of candidates) {
    const parsed = parseUploadUrl(url);
    if (!parsed) continue;
    const refs = await findReferences(url);
    if (refs.length === 0) await StoredUpload.deleteOne(parsed);
  }
}

export function removedUrls(before: unknown, after: unknown) {
  const a = collectUploadUrls(before);
  const b = collectUploadUrls(after);
  return [...a].filter((u) => !b.has(u));
}

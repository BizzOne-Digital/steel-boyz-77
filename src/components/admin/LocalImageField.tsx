"use client";

import { useId, useRef, useState } from "react";
import { ImageOff, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, UPLOAD_CHUNK_BYTES } from "@/lib/constants";
import type { UploadFolder } from "@/lib/fields";
import { formatBytes } from "@/lib/utils";
import { useToast } from "./Toast";

type UploadResult = { success: true; url: string; filename: string; size: number; folder: string };

function randomHex(bytes: number) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function postForm(fd: FormData) {
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || `Upload failed (${res.status})`);
  return data;
}

/**
 * Uploads to MongoDB through /api/upload. Files up to 3 MB go in one request;
 * larger files (up to 8 MB) are sent in 3 MB chunks so every request stays under
 * Vercel's 4.5 MB serverless body limit.
 */
export async function uploadImage(file: File, folder: UploadFolder, onProgress?: (pct: number) => void): Promise<UploadResult> {
  if (file.size <= UPLOAD_CHUNK_BYTES) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    onProgress?.(30);
    const r = await postForm(fd);
    onProgress?.(100);
    return r;
  }
  const total = Math.ceil(file.size / UPLOAD_CHUNK_BYTES);
  const uploadId = randomHex(16);
  let result: UploadResult | null = null;
  for (let i = 0; i < total; i++) {
    const fd = new FormData();
    fd.append("file", file.slice(i * UPLOAD_CHUNK_BYTES, (i + 1) * UPLOAD_CHUNK_BYTES), file.name);
    fd.append("folder", folder);
    fd.append("uploadId", uploadId);
    fd.append("index", String(i));
    fd.append("total", String(total));
    fd.append("originalName", file.name);
    const r = await postForm(fd);
    onProgress?.(Math.round(((i + 1) / total) * 100));
    if (i === total - 1) result = r;
  }
  return result!;
}

export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) return "Use a JPEG, PNG, WEBP or GIF image.";
  if (file.size > MAX_UPLOAD_BYTES) return `Image is ${formatBytes(file.size)}. The maximum is 8 MB.`;
  return null;
}

export function LocalImageField({
  label,
  value,
  onChange,
  folder = "misc",
  help,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: UploadFolder;
  help?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [broken, setBroken] = useState(false);
  const toast = useToast();
  const legacy = value.startsWith("/uploads/");
  const showImage = value && !legacy && !broken;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      toast("error", problem);
      return;
    }
    setError("");
    setBusy(true);
    setProgress(5);
    try {
      const r = await uploadImage(file, folder, setProgress);
      setBroken(false);
      onChange(r.url);
      toast("success", "Image uploaded. Save to publish the change.");
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      toast("error", msg);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  return (
    <div>
      <p id={`${id}-label`} className="text-xs font-semibold uppercase tracking-wide text-white/80">
        {label}
      </p>
      <div className="mt-1.5 flex flex-col gap-3 border border-white/15 bg-ink p-3 sm:flex-row sm:items-center">
        <div className="relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden bg-charcoal sm:w-40">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={`Current ${label}`} className="h-full w-full object-cover" onError={() => setBroken(true)} />
          ) : (
            <div className="flex flex-col items-center gap-1 p-2 text-center text-xs text-muted">
              <ImageOff className="size-6" aria-hidden="true" />
              {legacy ? "Legacy image, please replace" : value ? "Image unavailable" : "No image"}
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 text-xs text-white">
              <Loader2 className="size-6 animate-spin text-brand" aria-hidden="true" />
              <span>{progress}%</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {value && <p className="truncate font-mono text-xs text-muted" title={value}>{value}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="sr-only"
              aria-labelledby={`${id}-label`}
              aria-describedby={`${id}-help`}
              onChange={onFile}
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 border border-white/20 px-3 py-1.5 font-condensed text-xs font-bold uppercase text-white hover:border-brand hover:text-brand disabled:opacity-50"
            >
              {value ? <RefreshCw className="size-3.5" aria-hidden="true" /> : <ImagePlus className="size-3.5" aria-hidden="true" />}
              {value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={busy}
                className="inline-flex items-center gap-1.5 border border-red-400/40 px-3 py-1.5 font-condensed text-xs font-bold uppercase text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" aria-hidden="true" /> Remove
              </button>
            )}
          </div>
          <p id={`${id}-help`} className="mt-2 text-xs text-muted">
            {help ? `${help} ` : ""}JPEG, PNG, WEBP or GIF, up to 8 MB.
          </p>
          {error && (
            <p role="alert" className="mt-1 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

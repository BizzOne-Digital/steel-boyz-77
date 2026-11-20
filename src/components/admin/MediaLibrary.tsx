"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Link2, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { ALLOWED_IMAGE_TYPES } from "@/lib/constants";
import { UPLOAD_FOLDERS, type UploadFolder } from "@/lib/fields";
import { formatBytes } from "@/lib/utils";
import { api, ApiError, fmtDate } from "./client";
import { uploadImage, validateImageFile } from "./LocalImageField";
import { useToast } from "./Toast";
import { Btn, EmptyState, PageHeader, Spinner, inputCls } from "./ui";

type Media = { _id: string; folder: string; filename: string; originalName: string; size: number; mimeType: string; createdAt: string; url: string };
type Ref = { resource: string; id: string; label: string };

export function MediaLibrary() {
  const toast = useToast();
  const [items, setItems] = useState<Media[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [folder, setFolder] = useState<"all" | UploadFolder>("all");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [uploadFolder, setUploadFolder] = useState<UploadFolder>("gallery");
  const [busy, setBusy] = useState<string | null>(null);
  const [refs, setRefs] = useState<Record<string, Ref[]>>({});
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<Media | null>(null);
  const pageSize = 24;

  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    const p = new URLSearchParams({ page: String(page), folder, q: query });
    api<{ items: Media[]; total: number }>(`/api/admin/media?${p}`)
      .then((r) => {
        if (!active) return;
        setItems(r.items);
        setTotal(r.total);
      })
      .catch((e) => toast("error", (e as Error).message));
    return () => {
      active = false;
    };
  }, [page, folder, query, toast, version]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) {
      const problem = validateImageFile(file);
      if (problem) {
        toast("error", `${file.name}: ${problem}`);
        continue;
      }
      setBusy("upload");
      try {
        await uploadImage(file, uploadFolder);
        toast("success", `${file.name} uploaded`);
      } catch (err) {
        toast("error", `${file.name}: ${(err as Error).message}`);
      }
    }
    setBusy(null);
    load();
  }

  async function onReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const target = replaceTarget.current;
    if (!file || !target) return;
    const problem = validateImageFile(file);
    if (problem) return toast("error", problem);
    setBusy(target._id);
    try {
      // 1) upload new file  2) repoint every reference  3) delete old file (server does 2 and 3 in order)
      const up = await uploadImage(file, target.folder as UploadFolder);
      const r = await api<{ changed: number }>(`/api/admin/media/${target._id}`, { method: "PUT", json: { newUrl: up.url } });
      toast("success", `Image replaced${r.changed ? ` in ${r.changed} place(s)` : ""}.`);
      load();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function showRefs(m: Media) {
    try {
      const r = await api<{ references: Ref[] }>(`/api/admin/media/${m._id}`);
      setRefs((x) => ({ ...x, [m._id]: r.references }));
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  async function remove(m: Media) {
    if (!window.confirm(`Delete ${m.originalName || m.filename}?`)) return;
    setBusy(m._id);
    try {
      await api(`/api/admin/media/${m._id}`, { method: "DELETE" });
      toast("success", "Image deleted");
      load();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const list = (e.data.references as Ref[]) ?? [];
        const ok = window.confirm(
          `${e.message}\n\nUsed in:\n${list.map((r) => `• ${r.resource}: ${r.label}`).join("\n")}\n\nDelete anyway? Those places will show a placeholder until a new image is chosen.`,
        );
        if (ok) {
          await api(`/api/admin/media/${m._id}?force=1`, { method: "DELETE" }).catch((err) => toast("error", err.message));
          toast("success", "Image deleted");
          load();
        }
      } else toast("error", (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Images stored in MongoDB. They persist across deployments."
        actions={
          <div className="flex items-end gap-2">
            <label className="text-xs text-muted">
              Upload to
              <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value as UploadFolder)} className={`${inputCls} mt-1 py-2`}>
                {UPLOAD_FOLDERS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
            <input ref={uploadRef} type="file" multiple accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" onChange={onUpload} aria-label="Upload images" />
            <Btn onClick={() => uploadRef.current?.click()} loading={busy === "upload"}>
              <Upload className="size-4" aria-hidden="true" /> Upload
            </Btn>
          </div>
        }
      />
      <input ref={replaceRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" onChange={onReplace} aria-label="Choose replacement image" />

      <form
        className="mb-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(q);
        }}
      >
        <label className="text-xs text-muted">
          Folder
          <select
            value={folder}
            onChange={(e) => {
              setPage(1);
              setFolder(e.target.value as "all" | UploadFolder);
            }}
            className={`${inputCls} mt-1 py-2`}
          >
            <option value="all">All folders</option>
            {UPLOAD_FOLDERS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-xs text-muted">
          Search file names
          <input value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} mt-1 py-2`} placeholder="e.g. helmet" />
        </label>
        <Btn type="submit" variant="secondary">
          <Search className="size-4" aria-hidden="true" /> Search
        </Btn>
      </form>

      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState>No images found.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((m) => (
            <li key={m._id} className="flex flex-col border border-white/10 bg-ink-2">
              <div className="aspect-video bg-charcoal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.originalName || m.filename} loading="lazy" className="h-full w-full object-contain" />
              </div>
              <div className="flex-1 space-y-1 p-3 text-xs">
                <p className="truncate font-medium text-white" title={m.originalName || m.filename}>
                  {m.originalName || m.filename}
                </p>
                <p className="text-muted">
                  {m.folder} · {formatBytes(m.size)} · {fmtDate(m.createdAt)}
                </p>
                {refs[m._id] && (
                  <p className="text-brand">
                    {refs[m._id].length ? `Used in: ${refs[m._id].map((r) => r.label).join(", ")}` : "Not used anywhere"}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1 border-t border-white/10 p-2">
                <Btn
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(m.url).then(() => toast("success", "URL copied"));
                  }}
                  aria-label="Copy URL"
                  title="Copy URL"
                >
                  <Copy className="size-4" aria-hidden="true" />
                </Btn>
                <Btn variant="ghost" onClick={() => showRefs(m)} aria-label="Show where used" title="Where used">
                  <Link2 className="size-4" aria-hidden="true" />
                </Btn>
                <Btn
                  variant="ghost"
                  loading={busy === m._id}
                  onClick={() => {
                    replaceTarget.current = m;
                    replaceRef.current?.click();
                  }}
                  aria-label="Replace image everywhere"
                  title="Replace everywhere"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                </Btn>
                <Btn variant="danger" className="ml-auto" onClick={() => remove(m)} aria-label="Delete image">
                  <Trash2 className="size-4" aria-hidden="true" />
                </Btn>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3 text-sm">
          <Btn variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Btn>
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          <Btn variant="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Next
          </Btn>
        </nav>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { COLLECTION_FIELDS, COLLECTION_META, type CollectionKey } from "@/lib/content/schema";
import { emptyRecord, fieldsToZod, formatZodError } from "@/lib/fields";
import { api } from "./client";
import { FormFields } from "./FormFields";
import { useToast } from "./Toast";
import { Badge, Btn, EmptyState, PageHeader, Spinner } from "./ui";

type Item = Record<string, unknown> & { _id: string };

const PUBLIC_PATH: Record<CollectionKey, string> = {
  services: "/services",
  teams: "/our-team",
  leadership: "/our-team",
  merchandise: "/",
  faqs: "/services",
};

export function CollectionManager({ resource }: { resource: CollectionKey }) {
  const meta = COLLECTION_META[resource];
  const fields = COLLECTION_FIELDS[resource];
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<{ id: string | null; value: Record<string, unknown> } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    api<{ items: Item[] }>(`/api/admin/collections/${resource}`)
      .then((r) => active && setItems(r.items))
      .catch((e) => toast("error", (e as Error).message));
    return () => {
      active = false;
    };
  }, [resource, toast, version]);

  function startNew() {
    const base = emptyRecord(fields);
    base.active = true;
    base.displayOrder = (items?.length ?? 0) + 1;
    setError("");
    setEditing({ id: null, value: base });
  }

  async function save() {
    if (!editing) return;
    const check = fieldsToZod(fields).safeParse(editing.value);
    if (!check.success) {
      setError(formatZodError(check.error));
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing.id) {
        await api(`/api/admin/collections/${resource}/${editing.id}`, { method: "PATCH", json: editing.value });
      } else {
        await api(`/api/admin/collections/${resource}`, { method: "POST", json: editing.value });
      }
      toast("success", `${meta.singular} saved. The website is updated.`);
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: Item) {
    try {
      const { _id, createdAt, updatedAt, __v, ...rest } = item;
      void createdAt; void updatedAt; void __v;
      await api(`/api/admin/collections/${resource}/${_id}`, { method: "PATCH", json: { ...rest, active: !item.active } });
      toast("success", item.active ? "Hidden from website" : "Now visible on website");
      await load();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  async function remove(item: Item) {
    const title = String(item[meta.titleField] ?? "");
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/collections/${resource}/${item._id}`, { method: "DELETE" });
      toast("success", `${meta.singular} deleted`);
      await load();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title={meta.label}
        description={`Changes appear on ${PUBLIC_PATH[resource]} right after saving.`}
        actions={
          <Btn onClick={startNew}>
            <Plus className="size-4" aria-hidden="true" /> Add {meta.singular}
          </Btn>
        }
      />

      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState>No {meta.label.toLowerCase()} yet. Use “Add {meta.singular}” to create one.</EmptyState>
      ) : (
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-ink-2 font-condensed text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">Order</th>
                <th scope="col" className="px-4 py-3">{meta.titleField === "question" ? "Question" : "Name"}</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-muted">{String(item.displayOrder ?? "")}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {String(item[meta.titleField] ?? "")}
                    {"priceLabel" in item && <span className="ml-2 text-xs text-brand">{String(item.priceLabel)}</span>}
                  </td>
                  <td className="px-4 py-3">{item.active ? <Badge tone="success">Visible</Badge> : <Badge>Hidden</Badge>}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Btn variant="ghost" onClick={() => toggleActive(item)} aria-label={item.active ? "Hide from website" : "Show on website"} title={item.active ? "Hide" : "Show"}>
                        {item.active ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                      </Btn>
                      <Btn variant="secondary" onClick={() => { setError(""); setEditing({ id: item._id, value: item }); }}>
                        <Pencil className="size-4" aria-hidden="true" /> Edit
                      </Btn>
                      <Btn variant="danger" onClick={() => remove(item)} aria-label={`Delete ${String(item[meta.titleField])}`}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="editor-title">
          <button type="button" aria-label="Close editor" className="absolute inset-0 bg-black/70" onClick={() => !saving && setEditing(null)} />
          <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-line bg-ink-2">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 id="editor-title" className="font-display text-3xl">
                {editing.id ? `Edit ${meta.singular}` : `New ${meta.singular}`}
              </h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close editor" className="text-white/70 hover:text-white">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <form
              className="flex-1 overflow-y-auto px-6 py-6"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
              id="collection-form"
            >
              <FormFields fields={fields} value={editing.value} onChange={(v) => setEditing({ ...editing, value: v })} />
            </form>
            <div className="border-t border-white/10 px-6 py-4">
              {error && (
                <p role="alert" className="mb-3 text-sm text-red-300">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Btn variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </Btn>
                <Btn type="submit" form="collection-form" loading={saving}>
                  Save {meta.singular}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

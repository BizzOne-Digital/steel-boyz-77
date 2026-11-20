"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { PAGE_FIELDS, PAGE_LABELS, type PageSlug } from "@/lib/content/schema";
import { fieldsToZod, formatZodError } from "@/lib/fields";
import { api, fmtDate } from "./client";
import { FormFields } from "./FormFields";
import { useToast } from "./Toast";
import { Btn, PageHeader, Spinner } from "./ui";

export function PageEditor({ slug }: { slug: PageSlug }) {
  const toast = useToast();
  const [value, setValue] = useState<Record<string, unknown> | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const label = PAGE_LABELS[slug];

  useEffect(() => {
    api<{ content: Record<string, unknown>; updatedAt: string | null }>(`/api/admin/pages/${slug}`)
      .then((r) => {
        setValue(r.content);
        setUpdatedAt(r.updatedAt);
      })
      .catch((e) => toast("error", e.message));
  }, [slug, toast]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    if (!value) return;
    const check = fieldsToZod(PAGE_FIELDS[slug]).safeParse(value);
    if (!check.success) {
      setError(formatZodError(check.error));
      toast("error", "Please fix the highlighted problems before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api(`/api/admin/pages/${slug}`, { method: "PUT", json: value });
      setDirty(false);
      setUpdatedAt(new Date().toISOString());
      toast("success", `${label.label} page saved and published.`);
    } catch (e) {
      setError((e as Error).message);
      toast("error", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={`${label.label} Page`}
        description={updatedAt ? `Last saved ${fmtDate(updatedAt)}` : "Showing starter content. Save to store your edits."}
        actions={
          <>
            <a href={label.path} target="_blank" rel="noopener" className="inline-flex min-h-10 items-center gap-2 border border-white/20 px-4 font-condensed text-sm font-bold uppercase text-white hover:border-brand hover:text-brand">
              <ExternalLink className="size-4" aria-hidden="true" /> View page
            </a>
            <Btn onClick={save} loading={saving} disabled={!value}>
              <Save className="size-4" aria-hidden="true" /> Save & publish
            </Btn>
          </>
        }
      />
      {!value ? (
        <Spinner />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="max-w-4xl"
        >
          <FormFields
            fields={PAGE_FIELDS[slug]}
            value={value}
            onChange={(v) => {
              setValue(v);
              setDirty(true);
            }}
          />
          <div className="sticky bottom-0 mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 bg-ink/95 py-4 backdrop-blur">
            {error && (
              <p role="alert" className="mr-auto text-sm text-red-300">
                {error}
              </p>
            )}
            {dirty && !error && <p className="mr-auto text-sm text-brand">Unsaved changes</p>}
            <Btn type="submit" loading={saving}>
              <Save className="size-4" aria-hidden="true" /> Save & publish
            </Btn>
          </div>
        </form>
      )}
    </>
  );
}

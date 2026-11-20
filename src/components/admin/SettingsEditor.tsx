"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Save, TriangleAlert } from "lucide-react";
import { SETTINGS_FIELDS } from "@/lib/content/schema";
import { fieldsToZod, formatZodError } from "@/lib/fields";
import { api } from "./client";
import { FormFields } from "./FormFields";
import { useToast } from "./Toast";
import { Btn, PageHeader, Panel, Spinner } from "./ui";

export function SettingsEditor() {
  const toast = useToast();
  const [value, setValue] = useState<Record<string, unknown> | null>(null);
  const [smtp, setSmtp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ settings: Record<string, unknown>; smtpConfigured: boolean }>("/api/admin/settings")
      .then((r) => {
        setValue(r.settings);
        setSmtp(r.smtpConfigured);
      })
      .catch((e) => toast("error", e.message));
  }, [toast]);

  async function save() {
    if (!value) return;
    const check = fieldsToZod(SETTINGS_FIELDS).safeParse(value);
    if (!check.success) {
      setError(formatZodError(check.error));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api("/api/admin/settings", { method: "PUT", json: value });
      toast("success", "Settings saved. Header, footer and metadata are updated.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Site Settings" description="Branding, contact details, social links, SEO defaults and privacy text." />
      <Panel className="mb-6 max-w-4xl">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-widest text-brand">Email notifications</h2>
        {smtp ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-emerald-300">
            <CheckCircle2 className="size-4" aria-hidden="true" /> SMTP is configured. New inquiries are emailed when notifications are enabled below.
          </p>
        ) : (
          <p className="mt-2 flex items-start gap-2 text-sm text-amber-300">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            SMTP is not configured (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM). Inquiries are still saved and appear in Contact Inquiries, but no email is sent.
          </p>
        )}
      </Panel>
      {!value ? (
        <Spinner />
      ) : (
        <form
          className="max-w-4xl"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <FormFields fields={SETTINGS_FIELDS} value={value} onChange={setValue} />
          <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 border-t border-white/10 bg-ink/95 py-4">
            {error && (
              <p role="alert" className="mr-auto text-sm text-red-300">
                {error}
              </p>
            )}
            <Btn type="submit" loading={saving}>
              <Save className="size-4" aria-hidden="true" /> Save settings
            </Btn>
          </div>
        </form>
      )}
    </>
  );
}

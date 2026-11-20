"use client";

import { useEffect, useState } from "react";
import { api } from "./client";
import { useToast } from "./Toast";
import { Btn, PageHeader, Panel, Spinner, inputCls } from "./ui";

export function AccountForm() {
  const toast = useToast();
  const [admin, setAdmin] = useState<{ name: string; email: string; role: string } | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ admin: { name: string; email: string; role: string } }>("/api/admin/account")
      .then((r) => {
        setAdmin(r.admin);
        setName(r.admin.name);
      })
      .catch((e) => toast("error", e.message));
  }, [toast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword && newPassword !== confirm) return setError("New passwords do not match.");
    setSaving(true);
    try {
      await api("/api/admin/account", { method: "PUT", json: { name, currentPassword, newPassword } });
      toast("success", newPassword ? "Password changed. Other devices were signed out." : "Profile updated");
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!admin) return <Spinner />;
  return (
    <>
      <PageHeader title="Account" description={`${admin.email} · ${admin.role}`} />
      <Panel className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="acc-name" className="text-xs font-semibold uppercase tracking-wide text-white/80">Display name</label>
            <input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} className={inputCls} />
          </div>
          <fieldset className="space-y-4 border border-white/10 p-4">
            <legend className="px-2 font-condensed text-sm font-bold uppercase tracking-widest text-brand">Change password</legend>
            <p className="text-xs text-muted">At least 12 characters with uppercase, lowercase, a number and a symbol. Leave blank to keep your current password.</p>
            <div>
              <label htmlFor="acc-cur" className="text-xs font-semibold uppercase tracking-wide text-white/80">Current password</label>
              <input id="acc-cur" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="acc-new" className="text-xs font-semibold uppercase tracking-wide text-white/80">New password</label>
              <input id="acc-new" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNew(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="acc-confirm" className="text-xs font-semibold uppercase tracking-wide text-white/80">Confirm new password</label>
              <input id="acc-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
            </div>
          </fieldset>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <Btn type="submit" loading={saving}>Save</Btn>
        </form>
      </Panel>
    </>
  );
}

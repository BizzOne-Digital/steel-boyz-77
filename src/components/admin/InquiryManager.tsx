"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Phone, Search, Trash2 } from "lucide-react";
import { INTEREST_OPTIONS, telHref } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api, fmtDate } from "./client";
import { useToast } from "./Toast";
import { Badge, Btn, EmptyState, PageHeader, Panel, Spinner, inputCls } from "./ui";

type Inquiry = {
  _id: string;
  guardianName: string;
  athleteName: string;
  athleteAge: number | null;
  email: string;
  phone: string;
  interest: string;
  product: string;
  message: string;
  consent: boolean;
  status: "new" | "read" | "replied";
  internalNotes: string;
  notification?: { attempted: boolean; sent: boolean; error: string };
  createdAt: string;
};

const interestLabel = (v: string) => INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v;
const tone = (s: string) => (s === "new" ? "brand" : s === "replied" ? "success" : "neutral") as "brand" | "success" | "neutral";

export function InquiryManager() {
  const toast = useToast();
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [interest, setInterest] = useState("all");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const pageSize = 20;

  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    const p = new URLSearchParams({ page: String(page), status, interest, q: query });
    api<{ items: Inquiry[]; total: number }>(`/api/admin/inquiries?${p}`)
      .then((r) => {
        if (!active) return;
        setItems(r.items);
        setTotal(r.total);
      })
      .catch((e) => toast("error", (e as Error).message));
    return () => {
      active = false;
    };
  }, [page, status, interest, query, toast, version]);

  async function update(id: string, patch: Partial<Pick<Inquiry, "status" | "internalNotes">>, msg?: string) {
    setSaving(true);
    try {
      const r = await api<{ item: Inquiry }>(`/api/admin/inquiries/${id}`, { method: "PATCH", json: patch });
      setSelected(r.item);
      setItems((list) => list?.map((x) => (x._id === id ? r.item : x)) ?? null);
      if (msg) toast("success", msg);
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function open(item: Inquiry) {
    setSelected(item);
    setNotes(item.internalNotes);
    if (item.status === "new") update(item._id, { status: "read" });
  }

  async function remove(item: Inquiry) {
    if (!window.confirm(`Permanently delete the inquiry from ${item.guardianName}?`)) return;
    try {
      await api(`/api/admin/inquiries/${item._id}`, { method: "DELETE" });
      toast("success", "Inquiry deleted");
      setSelected(null);
      load();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  async function purge() {
    if (!window.confirm("Permanently delete all inquiries older than the retention period set in Site Settings?")) return;
    try {
      const r = await api<{ deleted: number; days: number }>("/api/admin/inquiries", { method: "DELETE" });
      toast("success", `Deleted ${r.deleted} inquiries older than ${r.days} days`);
      load();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHeader
        title="Contact Inquiries"
        description="Private. Never shown on the public website."
        actions={
          <Btn variant="danger" onClick={purge}>
            Purge old inquiries
          </Btn>
        }
      />

      <form
        className="mb-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(q);
        }}
      >
        <label className="text-xs text-muted">
          Status
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className={`${inputCls} mt-1 py-2`}>
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </label>
        <label className="text-xs text-muted">
          Inquiry type
          <select value={interest} onChange={(e) => { setPage(1); setInterest(e.target.value); }} className={`${inputCls} mt-1 py-2`}>
            <option value="all">All types</option>
            {INTEREST_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-48 flex-1 text-xs text-muted">
          Search
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone or message" className={`${inputCls} mt-1 py-2`} />
        </label>
        <Btn type="submit" variant="secondary">
          <Search className="size-4" aria-hidden="true" /> Search
        </Btn>
      </form>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div>
          {items === null ? (
            <Spinner />
          ) : items.length === 0 ? (
            <EmptyState>No inquiries match these filters.</EmptyState>
          ) : (
            <ul className="divide-y divide-white/10 border border-white/10">
              {items.map((i) => (
                <li key={i._id}>
                  <button
                    type="button"
                    onClick={() => open(i)}
                    aria-current={selected?._id === i._id ? "true" : undefined}
                    className={cn("flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-white/[0.04]", selected?._id === i._id && "bg-brand/10")}
                  >
                    <div className="min-w-0">
                      <p className={cn("truncate text-sm text-white", i.status === "new" && "font-bold")}>{i.guardianName}</p>
                      <p className="truncate text-xs text-muted">
                        {interestLabel(i.interest)} · {fmtDate(i.createdAt)}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-white/60">{i.message}</p>
                    </div>
                    <Badge tone={tone(i.status)}>{i.status}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
              <Btn variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Btn>
              <span className="text-muted">
                Page {page} of {pages} · {total} total
              </span>
              <Btn variant="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                Next
              </Btn>
            </nav>
          )}
        </div>

        <Panel className="h-fit xl:sticky xl:top-6">
          {!selected ? (
            <p className="text-sm text-muted">Select an inquiry to view details.</p>
          ) : (
            <article aria-label={`Inquiry from ${selected.guardianName}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-4xl">{selected.guardianName}</h2>
                  <p className="text-xs text-muted">Received {fmtDate(selected.createdAt)}</p>
                </div>
                <Badge tone={tone(selected.status)}>{selected.status}</Badge>
              </div>
              <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Detail k="Athlete" v={selected.athleteName || "Not provided"} />
                <Detail k="Athlete age" v={selected.athleteAge ?? "Not provided"} />
                <Detail k="Interested in" v={`${interestLabel(selected.interest)}${selected.product ? ` · ${selected.product}` : ""}`} />
                <Detail k="Guardian consent" v={selected.consent ? "Given" : "No"} />
                <Detail k="Email" v={<a className="text-brand hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a>} />
                <Detail k="Phone" v={selected.phone ? <a className="text-brand hover:underline" href={telHref(selected.phone)}>{selected.phone}</a> : "Not provided"} />
                <Detail
                  k="Email notification"
                  v={!selected.notification?.attempted ? "Not sent" : selected.notification.sent ? "Delivered to mail server" : `Failed: ${selected.notification.error}`}
                />
              </dl>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Message</p>
                <p className="mt-1 whitespace-pre-wrap border-l-2 border-brand bg-black/30 p-3 text-sm text-white">{selected.message}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: Your STEEL BOYZ 7-7 inquiry")}`}
                  className="inline-flex min-h-10 items-center gap-2 bg-brand px-4 font-condensed text-sm font-bold uppercase text-black"
                >
                  <Mail className="size-4" aria-hidden="true" /> Reply by email
                </a>
                {selected.phone && (
                  <a href={telHref(selected.phone)} className="inline-flex min-h-10 items-center gap-2 border border-white/20 px-4 font-condensed text-sm font-bold uppercase text-white hover:border-brand">
                    <Phone className="size-4" aria-hidden="true" /> Call
                  </a>
                )}
              </div>
              <fieldset className="mt-5">
                <legend className="text-xs font-semibold uppercase tracking-wide text-white/70">Status</legend>
                <div className="mt-2 flex gap-2">
                  {(["new", "read", "replied"] as const).map((s) => (
                    <Btn key={s} variant={selected.status === s ? "primary" : "secondary"} onClick={() => update(selected._id, { status: s }, `Marked as ${s}`)} disabled={saving} aria-pressed={selected.status === s}>
                      {s}
                    </Btn>
                  ))}
                </div>
              </fieldset>
              <div className="mt-5">
                <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Internal notes (staff only)
                </label>
                <textarea id="notes" rows={4} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
                <div className="mt-2 flex justify-between">
                  <Btn variant="danger" onClick={() => remove(selected)}>
                    <Trash2 className="size-4" aria-hidden="true" /> Delete
                  </Btn>
                  <Btn onClick={() => update(selected._id, { internalNotes: notes }, "Notes saved")} loading={saving} disabled={notes === selected.internalNotes}>
                    Save notes
                  </Btn>
                </div>
              </div>
            </article>
          )}
        </Panel>
      </div>
    </>
  );
}

function Detail({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
      <dd className="mt-0.5 break-words text-white">{v}</dd>
    </div>
  );
}

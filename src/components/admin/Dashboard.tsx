"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelpCircle, Image as ImageIcon, Inbox, Shirt, Trophy, Users, Wrench } from "lucide-react";
import { INTEREST_OPTIONS } from "@/lib/constants";
import { api, fmtDate } from "./client";
import { Badge, PageHeader, Panel, Spinner } from "./ui";

type Stats = {
  counts: Record<string, number>;
  recent: { _id: string; adminEmail: string; action: string; resource: string; summary: string; timestamp: string }[];
  latestInquiries: { _id: string; guardianName: string; interest: string; status: string; createdAt: string }[];
};

const CARDS = [
  { key: "inquiries", label: "Contact Inquiries", href: "/admin/inquiries", icon: Inbox },
  { key: "services", label: "Services", href: "/admin/services", icon: Wrench },
  { key: "teams", label: "Programs / Teams", href: "/admin/teams", icon: Trophy },
  { key: "leadership", label: "Leadership", href: "/admin/leadership", icon: Users },
  { key: "merchandise", label: "Merchandise", href: "/admin/merchandise", icon: Shirt },
  { key: "faqs", label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { key: "media", label: "Media Uploads", href: "/admin/media", icon: ImageIcon },
];

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/admin/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageHeader title="Dashboard" description="Live totals from the database." />
      {error && <p role="alert" className="text-red-300">{error}</p>}
      {!stats && !error && <Spinner />}
      {stats && (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CARDS.map(({ key, label, href, icon: Icon }) => (
              <li key={key}>
                <Link href={href} className="group block border border-white/10 bg-ink-2 p-5 transition-colors hover:border-brand">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">{label}</span>
                    <Icon className="size-5 text-brand" aria-hidden="true" />
                  </div>
                  <p className="mt-2 font-display text-6xl text-white">{stats.counts[key] ?? 0}</p>
                  {key === "inquiries" && (
                    <p className="text-xs text-brand">{stats.counts.newInquiries} new</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <Panel>
              <h2 className="font-display text-3xl">Latest Inquiries</h2>
              {stats.latestInquiries.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No inquiries yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-white/10">
                  {stats.latestInquiries.map((q) => (
                    <li key={q._id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{q.guardianName}</p>
                        <p className="text-xs text-muted">
                          {INTEREST_OPTIONS.find((o) => o.value === q.interest)?.label} · {fmtDate(q.createdAt)}
                        </p>
                      </div>
                      <Badge tone={q.status === "new" ? "brand" : q.status === "replied" ? "success" : "neutral"}>{q.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/inquiries" className="mt-4 inline-block text-sm text-brand hover:underline">
                Open inbox →
              </Link>
            </Panel>
            <Panel>
              <h2 className="font-display text-3xl">Recent Activity</h2>
              {stats.recent.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No admin activity recorded yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-white/10">
                  {stats.recent.map((a) => (
                    <li key={a._id} className="py-3 text-sm">
                      <p className="text-white">
                        <span className="font-semibold capitalize">{a.action}</span> {a.resource}
                        {a.summary && <span className="text-muted"> · {a.summary}</span>}
                      </p>
                      <p className="text-xs text-muted">
                        {a.adminEmail} · {fmtDate(a.timestamp)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}

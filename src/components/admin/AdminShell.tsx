"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink, FileText, HelpCircle, Home, Image as ImageIcon, Inbox, LayoutDashboard, LogOut, Menu,
  Settings, Shirt, ShieldCheck, Trophy, UserCog, Users, Wrench, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "./Toast";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/pages/home", label: "Homepage", icon: Home },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/teams", label: "Teams", icon: Trophy },
  { href: "/admin/leadership", label: "Leadership", icon: Users },
  { href: "/admin/merchandise", label: "Merchandise", icon: Shirt },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/inquiries", label: "Contact Inquiries", icon: Inbox },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/account", label: "Account", icon: UserCog },
];

export function AdminShell({ admin, children }: { admin: { name: string; email: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/pages") return pathname === "/admin/pages" || (pathname.startsWith("/admin/pages/") && pathname !== "/admin/pages/home");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <ShieldCheck className="size-6 text-brand" aria-hidden="true" />
        <span className="font-display text-2xl text-white">
          STEEL BOYZ <span className="text-brand">Admin</span>
        </span>
      </Link>
      <ul className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "border-brand bg-brand/10 text-brand" : "border-transparent text-white/75 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="size-4.5 shrink-0" aria-hidden="true" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-2 border-t border-white/10 p-4">
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-muted hover:text-brand">
          <ExternalLink className="size-3.5" aria-hidden="true" /> View website
        </a>
        <p className="truncate text-xs text-white/60" title={admin.email}>
          Signed in as <span className="text-white">{admin.name}</span>
        </p>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 border border-white/15 py-2 font-condensed text-sm font-bold uppercase text-white hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <LogOut className="size-4" aria-hidden="true" /> {loggingOut ? "Signing out…" : "Logout"}
        </button>
      </div>
    </nav>
  );

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-ink text-white lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="sticky top-0 hidden h-dvh border-r border-white/10 bg-ink-2 lg:block">{sidebar}</aside>

        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-ink-2 px-4 py-3 lg:hidden">
          <span className="font-display text-2xl">
            STEEL BOYZ <span className="text-brand">Admin</span>
          </span>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" aria-expanded={open} className="inline-flex size-10 items-center justify-center border border-white/15 text-brand">
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button type="button" aria-label="Close admin menu" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 bg-ink-2">
              <button type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="absolute right-3 top-4 text-white/70 hover:text-white">
                <X className="size-5" aria-hidden="true" />
              </button>
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </ToastProvider>
  );
}

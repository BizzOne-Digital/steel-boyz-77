"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputCls =
  "mt-1.5 block w-full border border-white/15 bg-ink px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none";

export function Btn({
  children,
  variant = "primary",
  loading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; loading?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-brand text-black hover:bg-gold",
        variant === "secondary" && "border border-white/20 text-white hover:border-brand hover:text-brand",
        variant === "danger" && "border border-red-400/50 text-red-300 hover:bg-red-500/10",
        variant === "ghost" && "text-muted hover:text-white",
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-5xl text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border border-white/10 bg-ink-2 p-5 sm:p-6", className)}>{children}</div>;
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-10 text-muted">
      <Loader2 className="size-5 animate-spin text-brand" aria-hidden="true" /> {label}…
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="border border-dashed border-white/15 p-10 text-center text-sm text-muted">{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "brand" | "success" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 font-condensed text-xs font-bold uppercase tracking-wider",
        tone === "neutral" && "bg-white/10 text-white/80",
        tone === "brand" && "bg-brand text-black",
        tone === "success" && "bg-emerald-500/15 text-emerald-300",
        tone === "danger" && "bg-red-500/15 text-red-300",
      )}
    >
      {children}
    </span>
  );
}

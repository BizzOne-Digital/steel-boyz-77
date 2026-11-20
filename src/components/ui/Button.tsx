import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "dark";

const base =
  "group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden px-7 py-3 font-condensed text-base font-bold uppercase tracking-wide transition-[transform,color,background-color,border-color] duration-300 clip-angle focus-visible:outline-offset-4 active:translate-y-px";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-black hover:-translate-y-0.5 before:absolute before:inset-0 before:-translate-x-full before:bg-white/35 before:transition-transform before:duration-500 hover:before:translate-x-0",
  outline:
    "border-2 border-brand bg-black/40 text-white hover:-translate-y-0.5 hover:bg-brand hover:text-black",
  dark: "bg-ink text-brand hover:-translate-y-0.5 hover:bg-black",
  ghost: "px-0 text-brand underline-offset-4 hover:underline clip-path-none min-h-0",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  arrow = true,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const content = (
    <>
      <span className="relative">{children}</span>
      {arrow && <ChevronRight aria-hidden="true" className="relative size-5 transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  );
  const cls = cn(base, variants[variant], variant === "ghost" && "[clip-path:none]", className);
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={cls} {...rest} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {content}
    </Link>
  );
}

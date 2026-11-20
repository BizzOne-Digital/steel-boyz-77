import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 font-condensed text-sm font-bold uppercase tracking-[0.25em] text-brand", className)}>
      <span aria-hidden="true" className="h-0.5 w-8 bg-brand" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  text,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  text?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className={cn("mb-4", align === "center" && "justify-center")}>{eyebrow}</Eyebrow>}
      <Tag className="font-display text-5xl font-semibold text-white sm:text-6xl lg:text-7xl">
        {title} {highlight && <span className="text-brand">{highlight}</span>}
      </Tag>
      {text && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{text}</p>}
    </Reveal>
  );
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/** Animated yellow divider bar. */
export function Slash({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block h-1 w-24 origin-left -skew-x-[30deg] bg-brand animate-sweep", className)} />;
}

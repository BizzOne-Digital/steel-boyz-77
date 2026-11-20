import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { Container, Eyebrow } from "@/components/ui/Section";

export function InnerHero({
  eyebrow,
  heading,
  text,
  image,
  crumb,
}: {
  eyebrow?: string;
  heading: string;
  text?: string;
  image: string;
  crumb: string;
}) {
  const words = heading.split(" ");
  const split = Math.max(1, Math.ceil(words.length / 2));
  return (
    <section className="relative isolate overflow-hidden border-b-4 border-brand bg-ink grain">
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <SmartImage src={image} alt="" fill priority sizes="100vw" className="object-cover object-[75%_center] opacity-50 lg:opacity-100" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(95deg,#050505_25%,rgba(5,5,5,0.7)_50%,rgba(5,5,5,0.1)_80%)]" />
      <span aria-hidden="true" className="absolute -right-16 bottom-10 h-4 w-96 -rotate-[20deg] bg-brand motion-safe:animate-sweep" />
      <Container className="relative py-20 sm:py-28 lg:py-32">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-widest text-white/70">
            <li>
              <Link href="/" className="hover:text-brand">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-4 text-brand" />
            </li>
            <li aria-current="page" className="text-brand">
              {crumb}
            </li>
          </ol>
        </nav>
        {eyebrow && <Eyebrow className="mt-8 motion-safe:animate-rise">{eyebrow}</Eyebrow>}
        <h1 className="mt-4 max-w-4xl font-display text-6xl text-white sm:text-7xl lg:text-8xl motion-safe:animate-rise [animation-delay:100ms]">
          {words.slice(0, split).join(" ")} <span className="text-brand">{words.slice(split).join(" ")}</span>
        </h1>
        {text && <p className="mt-5 max-w-2xl text-lg text-white/85 motion-safe:animate-rise [animation-delay:220ms]">{text}</p>}
      </Container>
    </section>
  );
}

export function ClosingCTA({ heading, text, label, href }: { heading: string; text?: string; label: string; href: string }) {
  return (
    <section className="relative overflow-hidden bg-brand py-16 text-black sm:py-20">
      <span aria-hidden="true" className="absolute -left-10 top-0 h-full w-40 -skew-x-12 bg-black/10" />
      <span aria-hidden="true" className="absolute right-20 top-0 h-full w-10 -skew-x-12 bg-black/10" />
      <Container className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <h2 className="font-display text-5xl sm:text-6xl">{heading}</h2>
          {text && <p className="mt-3 max-w-2xl text-lg text-black/80">{text}</p>}
        </div>
        {label && (
          <Link
            href={href || "/contact"}
            className="group inline-flex min-h-14 shrink-0 items-center gap-2 bg-ink px-8 font-condensed text-lg font-bold uppercase text-brand clip-angle transition-transform hover:-translate-y-0.5"
          >
            {label} <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        )}
      </Container>
    </section>
  );
}

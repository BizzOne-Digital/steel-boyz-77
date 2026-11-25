"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";

function splitName(name: string) {
  const m = name.match(/^(.*?)(\s+[\d-]+)$/);
  return m ? [m[1], m[2].trim()] : [name, ""];
}

export function Header({ logo, name, affiliation }: { logo: string; name: string; affiliation: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [first, second] = splitName(name);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a,button");
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          toggleRef.current?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          toggleRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled ? "border-line bg-ink/95 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur" : "border-white/5 bg-ink",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-22 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${name} home`}>
          <SmartImage src={logo} alt="" width={64} height={61} priority className="h-12 w-auto shrink-0 lg:h-16" />
          <span className="hidden min-w-0 border-white/15 pr-4 min-[380px]:block lg:border-r">
            <span className="block font-display text-2xl leading-none text-white lg:text-[2.1rem]">
              {first} <span className="text-brand">{second}</span>
            </span>
            <span className="mt-0.5 hidden max-w-[16rem] truncate font-condensed text-[0.7rem] font-semibold uppercase tracking-wide text-white/80 sm:block">
              {affiliation}
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block whitespace-nowrap px-2 py-2 font-condensed text-base font-semibold xl:px-3 xl:text-lg uppercase tracking-wide transition-colors hover:text-brand",
                      "after:absolute after:inset-x-2 xl:after:inset-x-3 after:-bottom-0.5 after:h-[3px] after:origin-left after:bg-brand after:transition-transform after:duration-300",
                      active ? "text-brand after:scale-x-100" : "text-white after:scale-x-0 hover:after:scale-x-100",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/contact"
          className="group hidden items-center gap-1.5 bg-brand px-6 py-3 font-condensed text-base font-bold uppercase tracking-wide text-black clip-angle transition-transform hover:-translate-y-0.5 xl:inline-flex"
        >
          Get in Touch
          <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className="ml-auto inline-flex size-12 items-center justify-center border border-line text-brand lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-4.5rem)] overflow-y-auto bg-ink lg:hidden"
      >
        <nav aria-label="Mobile" className="flex min-h-full flex-col px-4 pb-10 pt-6">
          <ul className="space-y-1">
            {NAV_LINKS.map((l, i) => {
              const active = isActive(l.href);
              return (
                <li key={l.href} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between border-l-4 py-3 pl-4 font-display text-4xl",
                      active ? "border-brand text-brand" : "border-transparent text-white",
                    )}
                  >
                    {l.label}
                    <ChevronRight className="size-6 text-brand" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 bg-brand font-condensed text-lg font-bold uppercase text-black clip-angle"
          >
            Get in Touch <ChevronRight className="size-5" aria-hidden="true" />
          </Link>
          <p className="mt-auto pt-10 font-condensed text-xs uppercase tracking-widest text-muted">{affiliation}</p>
        </nav>
      </div>
    </header>
  );
}

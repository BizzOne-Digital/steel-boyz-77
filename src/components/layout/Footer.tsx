import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { NAV_LINKS, telHref } from "@/lib/constants";
import type { SiteSettings } from "@/lib/content/defaults";
import { SmartImage } from "@/components/ui/SmartImage";
import { Container } from "@/components/ui/Section";
import { CopyrightYear } from "./CopyrightYear";

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "Twitter / X",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  hudl: "Hudl",
};

export function Footer({ settings, services }: { settings: SiteSettings; services: { title: string; slug: string }[] }) {
  const { branding, contact, footer, social } = settings;
  const socials = Object.entries(social).filter(([, url]) => typeof url === "string" && url.startsWith("https://"));

  return (
    <footer className="relative border-t-4 border-brand bg-ink-2 grain">
      <div aria-hidden="true" className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(115deg,transparent_60%,rgba(255,217,0,0.06)_60%)]" />
      <Container className="relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <SmartImage src={branding.logo} alt={`${branding.businessName} logo`} width={84} height={80} className="h-20 w-auto" />
            <span className="font-display text-3xl text-white">{branding.businessName}</span>
          </Link>
          <p className="mt-3 font-condensed text-sm font-semibold uppercase tracking-wide text-brand">{branding.affiliation}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{footer.mission}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border border-line px-3 py-1.5 font-condensed text-sm uppercase text-white transition-colors hover:border-brand hover:text-brand"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-2xl text-white">Explore</h2>
          <ul className="mt-4 space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted transition-colors hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="text-sm text-muted transition-colors hover:text-brand">
                Privacy
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-2xl text-white">Services</h2>
          <ul className="mt-4 space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services#${s.slug}`} className="text-sm text-muted transition-colors hover:text-brand">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl text-white">Contact</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {contact.ownerName && (
              <li>
                <p className="font-semibold text-white">
                  {contact.ownerName} <span className="font-normal text-muted">· {contact.ownerTitle}</span>
                </p>
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="mt-1 flex items-center gap-2 break-all text-muted hover:text-brand">
                    <Mail className="size-4 shrink-0 text-brand" aria-hidden="true" /> {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a href={telHref(contact.phone)} className="mt-1 flex items-center gap-2 text-muted hover:text-brand">
                    <Phone className="size-4 shrink-0 text-brand" aria-hidden="true" /> {contact.phone}
                  </a>
                )}
              </li>
            )}
            {contact.opsName && (
              <li>
                <p className="font-semibold text-white">{contact.opsName}</p>
                <p className="text-xs text-muted">{contact.opsTitle}</p>
                {contact.opsPhone && (
                  <a href={telHref(contact.opsPhone)} className="mt-1 flex items-center gap-2 text-muted hover:text-brand">
                    <Phone className="size-4 shrink-0 text-brand" aria-hidden="true" /> {contact.opsPhone}
                  </a>
                )}
              </li>
            )}
          </ul>
        </div>
      </Container>

      <div className="relative border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-center md:flex-row md:text-left">
          <p className="font-display text-xl text-brand">{footer.tagline}</p>
          <p className="text-xs text-muted">
            © <CopyrightYear /> {branding.businessName}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}

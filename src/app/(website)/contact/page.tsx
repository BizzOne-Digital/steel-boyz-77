import { Suspense } from "react";
import { Mail, Phone } from "lucide-react";
import { getMerchandise, getPage, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/constants";
import { InnerHero } from "@/components/shared/InnerHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const generateMetadata = () => pageMetadata("contact");

export default async function ContactPage() {
  const [p, settings, merch] = await Promise.all([getPage("contact"), getSettings(), getMerchandise()]);
  const c = settings.contact;
  const products = merch.map((m) => ({ slug: m.slug, name: m.name }));

  return (
    <>
      <InnerHero {...p.hero} crumb="Contact" />
      <section className="bg-ink py-16 lg:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal direction="left">
            <h2 className="font-display text-5xl text-white sm:text-6xl">{p.details.heading}</h2>
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">{p.details.text}</p>

            <div className="mt-10 space-y-5">
              {c.ownerName && (
                <div className="border-l-4 border-brand bg-charcoal p-6">
                  <p className="font-condensed text-xs font-bold uppercase tracking-widest text-brand">{c.ownerTitle}</p>
                  <p className="font-display text-4xl text-white">{c.ownerName}</p>
                  <ul className="mt-3 space-y-2">
                    {c.email && (
                      <li>
                        <a href={`mailto:${c.email}`} className="flex items-center gap-3 break-all text-white hover:text-brand">
                          <Mail className="size-5 shrink-0 text-brand" aria-hidden="true" /> {c.email}
                        </a>
                      </li>
                    )}
                    {c.phone && (
                      <li>
                        <a href={telHref(c.phone)} className="flex items-center gap-3 text-white hover:text-brand">
                          <Phone className="size-5 shrink-0 text-brand" aria-hidden="true" /> {c.phone}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {c.opsName && (
                <div className="border-l-4 border-white/30 bg-charcoal p-6">
                  <p className="font-condensed text-xs font-bold uppercase tracking-widest text-brand">{c.opsTitle}</p>
                  <p className="font-display text-4xl text-white">{c.opsName}</p>
                  {c.opsPhone && (
                    <a href={telHref(c.opsPhone)} className="mt-3 flex items-center gap-3 text-white hover:text-brand">
                      <Phone className="size-5 shrink-0 text-brand" aria-hidden="true" /> {c.opsPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </Reveal>

          <div id="inquiry" className="scroll-mt-24 border border-line bg-ink-2 p-6 clip-card sm:p-10">
            <h2 className="font-display text-5xl text-white">{p.form.heading}</h2>
            <p className="mt-2 text-muted">{p.form.text}</p>
            <Suspense fallback={<div className="mt-8 h-[42rem] animate-pulse bg-charcoal/50" aria-hidden="true" />}>
              <ContactForm
                products={products}
                consentText={settings.privacy.consentText}
                privacyNotice={settings.privacy.formNotice}
                successMessage={p.form.successMessage}
              />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}

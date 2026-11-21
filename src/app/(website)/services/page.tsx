import Link from "next/link";
import { Check, ChevronRight, Info } from "lucide-react";
import { getFaqs, getPage, getServices } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { cn, paragraphs } from "@/lib/utils";
import { ClosingCTA, InnerHero } from "@/components/shared/InnerHero";
import { FaqList } from "@/components/shared/FaqList";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { Icon } from "@/components/ui/Icon";

export const generateMetadata = () => pageMetadata("services");

const INTEREST_BY_SLUG: Record<string, string> = {
  "team-play": "team-play",
  "player-training": "training",
  "media-review": "media-review",
  "nil-recruiting": "nil-recruiting",
  tryouts: "tryouts",
};

export default async function ServicesPage() {
  const [p, services, faqs] = await Promise.all([getPage("services"), getServices(), getFaqs()]);

  return (
    <>
      <InnerHero {...p.hero} crumb="Services" />

      <section className="bg-ink pb-6 pt-20 lg:pt-28">
        <Container>
          <SectionHeading eyebrow={p.intro.eyebrow} title={p.intro.heading} text={p.intro.text} />
          <nav aria-label="Services on this page" className="mt-10">
            <ul className="flex flex-wrap gap-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <a href={`#${s.slug}`} className="inline-flex items-center gap-2 border border-line px-4 py-2 font-condensed text-sm font-bold uppercase text-white transition-colors hover:border-brand hover:text-brand">
                    <Icon name={s.icon} className="size-4 text-brand" /> {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      <div className="bg-ink">
        {services.map((s, i) => (
          <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-title`} className="scroll-mt-24 py-14 lg:py-20">
            <Container className={cn("grid items-center gap-10 lg:grid-cols-2 lg:gap-16")}>
              <Reveal direction={i % 2 ? "right" : "left"} className={cn("relative", i % 2 && "lg:order-2")}>
                <div className="relative aspect-[4/3] overflow-hidden clip-card">
                  <SmartImage src={s.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover grayscale-[30%]" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
                </div>
                <span aria-hidden="true" className="absolute -bottom-4 left-6 font-display text-8xl text-brand drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Reveal>
              <Reveal direction={i % 2 ? "left" : "right"}>
                <span className="inline-flex size-14 items-center justify-center bg-brand text-black clip-angle">
                  <Icon name={s.icon} className="size-7" />
                </span>
                <h2 id={`${s.slug}-title`} className="mt-5 font-display text-5xl text-white sm:text-6xl">
                  {s.title}
                </h2>
                <div className="prose-brand mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                  {paragraphs(s.description || s.summary).map((t, k) => (
                    <p key={k}>{t}</p>
                  ))}
                </div>
                {s.benefits.length > 0 && (
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {s.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-white">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /> {b}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-7 border-l-4 border-brand bg-charcoal px-5 py-4">
                  <p className="font-condensed text-xs font-bold uppercase tracking-widest text-muted">Pricing</p>
                  <p className="font-display text-4xl text-brand">{s.priceLabel}</p>
                  {s.note && <p className="mt-1 text-sm text-white/70">{s.note}</p>}
                </div>
                <Link
                  href={s.slug === "tryouts" ? "/register" : `/contact?interest=${INTEREST_BY_SLUG[s.slug] ?? "general"}#inquiry`}
                  className="group mt-7 inline-flex min-h-12 items-center gap-2 bg-brand px-7 font-condensed text-base font-bold uppercase text-black clip-angle transition-transform hover:-translate-y-0.5"
                >
                  {s.ctaLabel || "Contact Us"} <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                {s.faqs.length > 0 && (
                  <div className="mt-8">
                    <FaqList items={s.faqs} />
                  </div>
                )}
              </Reveal>
            </Container>
          </section>
        ))}
      </div>

      {p.disclaimer && (
        <section aria-label="Disclaimer" className="bg-ink pb-16">
          <Container>
            <p className="flex gap-3 border border-line bg-charcoal p-5 text-sm leading-relaxed text-white/75">
              <Info className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <span>
                <strong className="text-white">Please note: </strong>
                {p.disclaimer}
              </span>
            </p>
          </Container>
        </section>
      )}

      {p.faq.visible && faqs.length > 0 && (
        <section aria-label={p.faq.heading} className="bg-ink-2 py-20 lg:py-28">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading eyebrow="FAQ" title={p.faq.heading} text={p.faq.text} />
            <FaqList items={faqs} />
          </Container>
        </section>
      )}

      <ClosingCTA heading={p.cta.heading} text={p.cta.text} label={p.cta.button.label} href={p.cta.button.href} />
    </>
  );
}

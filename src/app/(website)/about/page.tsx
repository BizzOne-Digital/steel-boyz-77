import { Check } from "lucide-react";
import { getPage } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { paragraphs } from "@/lib/utils";
import { ClosingCTA, InnerHero } from "@/components/shared/InnerHero";
import { StepsTimeline } from "@/components/shared/StepsTimeline";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { Icon } from "@/components/ui/Icon";

export const generateMetadata = () => pageMetadata("about");

export default async function AboutPage() {
  const p = await getPage("about");
  return (
    <>
      <InnerHero {...p.hero} crumb="About Us" />

      {p.story.visible && (
        <section aria-labelledby="story" className="bg-ink py-20 lg:py-28">
          <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal direction="left">
              <Eyebrow>{p.story.eyebrow}</Eyebrow>
              <h2 id="story" className="mt-4 font-display text-5xl text-white sm:text-6xl">
                {p.story.heading}
              </h2>
              <div className="prose-brand mt-6 text-base leading-relaxed text-white/80 sm:text-lg">
                {paragraphs(p.story.body).map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            </Reveal>
            <Reveal direction="right" className="relative">
              <div className="relative aspect-[4/3] overflow-hidden border-2 border-brand clip-card">
                <SmartImage src={p.story.image} alt="STEEL BOYZ football helmet" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </div>
              <span aria-hidden="true" className="absolute -bottom-5 -left-5 -z-10 h-full w-full border-2 border-brand/30" />
            </Reveal>
          </Container>
        </section>
      )}

      {p.mission.visible && (
        <section aria-labelledby="mission" className="relative overflow-hidden bg-brand py-20 text-black lg:py-24">
          <span aria-hidden="true" className="absolute -right-10 top-0 h-full w-56 -skew-x-12 bg-black/10" />
          <Container className="relative">
            <Reveal className="max-w-4xl">
              <p className="font-condensed text-sm font-bold uppercase tracking-[0.25em]">{p.mission.eyebrow}</p>
              <h2 id="mission" className="mt-3 font-display text-6xl sm:text-7xl">
                {p.mission.heading}
              </h2>
              <p className="mt-6 text-xl font-medium leading-relaxed sm:text-2xl">{p.mission.body}</p>
            </Reveal>
          </Container>
        </section>
      )}

      {p.values.visible && (
        <section aria-label={p.values.heading} className="bg-ink-2 py-20 lg:py-28 grain">
          <Container className="relative">
            <SectionHeading eyebrow={p.values.eyebrow} title={p.values.heading} align="center" />
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {p.values.items.map((v, i) => (
                <Reveal as="li" key={v.title} delay={i * 0.08}>
                  <div className="group h-full border border-white/10 bg-charcoal p-7 clip-card transition-[transform,border-color] duration-300 hover:-translate-y-1.5 hover:border-brand">
                    <span className="inline-flex size-14 items-center justify-center bg-brand text-black clip-angle">
                      <Icon name={v.icon} className="size-7" />
                    </span>
                    <h3 className="mt-5 font-display text-4xl text-white">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {p.why.visible && (
        <section aria-labelledby="why" className="bg-ink py-20 lg:py-28">
          <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal direction="left" className="relative hidden min-h-[28rem] overflow-hidden clip-card lg:block">
              <SmartImage src={p.why.image} alt="" fill sizes="40vw" className="object-cover object-top grayscale" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-brand/20" />
            </Reveal>
            <div>
              <SectionHeading eyebrow={p.why.eyebrow} title={p.why.heading} text={p.why.body} />
              <ul className="mt-10 grid gap-5 sm:grid-cols-2">
                {p.why.points.map((pt, i) => (
                  <Reveal as="li" key={pt.title} delay={i * 0.08} className="border-l-4 border-brand bg-charcoal/70 p-5">
                    <h3 className="flex items-center gap-2 font-condensed text-xl font-bold uppercase text-white">
                      <Check className="size-5 text-brand" aria-hidden="true" /> {pt.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{pt.text}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      {p.journey.visible && (
        <section aria-label={p.journey.heading} className="bg-ink-2 py-20 lg:py-28">
          <Container>
            <SectionHeading eyebrow={p.journey.eyebrow} title={p.journey.heading} text={p.journey.text} />
            <div className="mt-14">
              <StepsTimeline steps={p.journey.steps} detailed />
            </div>
            {p.journey.note && <p className="mt-10 border-l-2 border-brand pl-4 text-sm text-white/60">{p.journey.note}</p>}
          </Container>
        </section>
      )}

      <ClosingCTA heading={p.cta.heading} text={p.cta.text} label={p.cta.button.label} href={p.cta.button.href} />
    </>
  );
}

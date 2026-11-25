import { Mail, Phone } from "lucide-react";
import type { PagesContent, SiteSettings } from "@/lib/content/defaults";
import type { LeaderItem, MerchItem, ServiceItem, TeamItem } from "@/lib/data";
import { telHref } from "@/lib/constants";
import { paragraphs } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { LeaderCard, MerchCard, ServiceCard, TeamCard } from "@/components/shared/Cards";
import { StepsTimeline } from "@/components/shared/StepsTimeline";

type Home = PagesContent["home"];

export function AboutPreview({ data }: { data: Home["about"] }) {
  return (
    <section aria-labelledby="about-preview" className="relative overflow-hidden bg-ink py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-0 lg:px-8">
        <Reveal direction="left" className="relative">
          <div className="relative aspect-[5/4] overflow-hidden lg:[clip-path:polygon(0_0,100%_0,82%_100%,0_100%)]">
            <SmartImage src={data.image} alt="Black and yellow STEEL BOYZ football helmet on the field" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
          </div>
          <span aria-hidden="true" className="absolute -right-2 top-0 hidden h-full w-3 origin-top skew-x-[-10deg] bg-brand lg:block lg:right-[9%]" />
        </Reveal>
        <Reveal direction="right" className="lg:pl-6">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h2 id="about-preview" className="mt-4 font-display text-5xl text-white sm:text-6xl lg:text-7xl">
            {data.heading} <span className="text-brand">{data.highlight}</span>
          </h2>
          <div className="prose-brand mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {paragraphs(data.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {data.cta.label && (
            <ButtonLink href={data.cta.href || "/about"} className="mt-8">
              {data.cta.label}
            </ButtonLink>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function ServicesPreview({ data, services }: { data: Home["services"]; services: ServiceItem[] }) {
  return (
    <section aria-labelledby="services-preview" className="relative bg-ink-2 py-20 lg:py-28">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent" />
      <Container>
        <div id="services-preview">
          <SectionHeading eyebrow={data.eyebrow} title={data.heading} text={data.text} />
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={(i % 2) * 0.12}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function BrandStatement({ data }: { data: Home["statement"] }) {
  return (
    <section aria-labelledby="brand-statement" className="relative isolate overflow-hidden py-28 lg:py-40">
      <SmartImage src={data.image} alt="" fill sizes="100vw" className="-z-20 object-cover object-top grayscale" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(5,5,5,0.97)_35%,rgba(5,5,5,0.75)_65%,rgba(255,196,0,0.45))]" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 right-0 -z-10 select-none font-display text-[16rem] leading-none text-stroke opacity-40 sm:text-[22rem] lg:text-[28rem]">
        #ATD
      </span>
      <Container>
        <Reveal className="max-w-4xl">
          <h2 id="brand-statement" className="font-display text-5xl text-white sm:text-7xl lg:text-8xl">
            {data.line1}
            <span className="mt-2 block text-brand">{data.line2}</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/85">{data.text}</p>
          {data.cta.label && (
            <ButtonLink href={data.cta.href || "/contact"} className="mt-10">
              {data.cta.label}
            </ButtonLink>
          )}
        </Reveal>
      </Container>
    </section>
  );
}

export function DevelopmentProcess({ data }: { data: Home["process"] }) {
  return (
    <section aria-label={data.heading} className="relative bg-ink py-20 lg:py-28">
      <Container>
        <SectionHeading eyebrow={data.eyebrow} title={data.heading} text={data.text} />
        <div className="mt-14">
          <StepsTimeline steps={data.steps} />
        </div>
        {data.note && <p className="mt-10 border-l-2 border-brand pl-4 text-sm text-white/60">{data.note}</p>}
      </Container>
    </section>
  );
}

export function TeamPreview({ data, teams }: { data: Home["teams"]; teams: TeamItem[] }) {
  if (!teams.length) return null;
  return (
    <section aria-label={data.heading} className="relative bg-ink-2 py-20 lg:py-28 grain">
      <Container className="relative">
        <SectionHeading eyebrow={data.eyebrow} title={data.heading} text={data.text} />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t, i) => (
            <Reveal as="li" key={t._id ?? t.ageGroup} delay={i * 0.1}>
              <TeamCard team={t} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function LeadershipPreview({ data, leaders }: { data: Home["leadership"]; leaders: LeaderItem[] }) {
  const shown = leaders.filter((l) => l.showOnHome);
  if (!shown.length) return null;
  return (
    <section aria-label={data.heading} className="relative bg-ink py-20 lg:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={data.eyebrow} title={data.heading} text={data.text} />
          {data.cta.label && (
            <ButtonLink href={data.cta.href || "/our-team"} variant="outline" className="shrink-0 self-start lg:self-auto">
              {data.cta.label}
            </ButtonLink>
          )}
        </div>
        <ul className="mt-14 grid gap-6 lg:grid-cols-2">
          {shown.map((l, i) => (
            <Reveal as="li" key={l._id ?? l.name} delay={i * 0.1}>
              <LeaderCard leader={l} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function MerchandisePreview({ data, items }: { data: Home["merch"]; items: MerchItem[] }) {
  if (!items.length) return null;
  return (
    <section aria-label={data.heading} className="relative overflow-hidden bg-ink-2 py-20 lg:py-28">
      <div aria-hidden="true" className="absolute -left-40 top-0 h-full w-96 -skew-x-12 bg-brand/5" />
      <Container className="relative">
        <SectionHeading eyebrow={data.eyebrow} title={data.heading} text={data.text} />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m, i) => (
            <Reveal as="li" key={m.slug} delay={i * 0.1}>
              <MerchCard item={m} />
            </Reveal>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          {data.note && <p className="text-sm text-white/60">{data.note}</p>}
          <ButtonLink href="/team-store" variant="outline" className="shrink-0">
            Visit Team Store
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export function ContactCTA({ data, contact }: { data: Home["cta"]; contact: SiteSettings["contact"] }) {
  return (
    <section id="join" aria-labelledby="join-heading" className="relative isolate scroll-mt-24 overflow-hidden bg-brand">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <div className="relative px-4 py-20 sm:px-10 lg:py-28 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          <SmartImage src={data.image} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="-z-20 object-cover grayscale" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/90 lg:[clip-path:polygon(0_0,100%_0,88%_100%,0_100%)]" />
          <Reveal>
            <h2 id="join-heading" className="font-display text-6xl text-white sm:text-7xl lg:text-8xl">
              {data.heading.split(" ").slice(0, -1).join(" ")} <span className="text-brand">{data.heading.split(" ").slice(-1)}</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/85">{data.text}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              {data.primary.label && <ButtonLink href={data.primary.href || "/contact"}>{data.primary.label}</ButtonLink>}
              {data.secondary.label && (
                <ButtonLink href={data.secondary.href || "/services"} variant="outline">
                  {data.secondary.label}
                </ButtonLink>
              )}
            </div>
          </Reveal>
        </div>
        <div className="relative flex items-center px-4 py-14 text-black sm:px-10 lg:py-20">
          <Reveal direction="right" className="w-full max-w-md">
            <p className="font-display text-4xl">{contact.ownerName}</p>
            <p className="font-condensed text-sm font-bold uppercase tracking-widest">{contact.ownerTitle}</p>
            <ul className="mt-6 space-y-3">
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-3 break-all bg-ink px-5 py-4 font-condensed text-lg font-bold text-white transition-colors hover:text-brand">
                    <Mail className="size-5 shrink-0 text-brand" aria-hidden="true" /> {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={telHref(contact.phone)} className="flex items-center gap-3 bg-ink px-5 py-4 font-condensed text-lg font-bold text-white transition-colors hover:text-brand">
                    <Phone className="size-5 shrink-0 text-brand" aria-hidden="true" /> {contact.phone}
                  </a>
                </li>
              )}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

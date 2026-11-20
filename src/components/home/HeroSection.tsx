import { getImageProps } from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { PagesContent } from "@/lib/content/defaults";
import { ButtonLink } from "@/components/ui/Button";

type Hero = PagesContent["home"]["hero"];

/** Art-directed hero image: phones never download the wide desktop asset. */
function HeroPicture({ desktop, mobile }: { desktop: string; mobile: string }) {
  const common = { alt: "STEEL BOYZ athletes in black and yellow uniforms under stadium lights", fill: true, priority: true, quality: 80 };
  const {
    props: { srcSet: desktopSet },
  } = getImageProps({ ...common, src: desktop, sizes: "60vw" });
  const { props: mobileProps } = getImageProps({ ...common, src: mobile || desktop, sizes: "100vw" });
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopSet} sizes="60vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...mobileProps} className="h-full w-full object-cover object-[50%_20%] lg:object-[40%_30%] motion-safe:animate-drift" />
    </picture>
  );
}

export function HeroSection({ hero }: { hero: Hero }) {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-ink grain">
      {/* Stadium light glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[8%] top-0 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="smoke absolute inset-x-0 bottom-0 h-2/3" />
      </div>

      <div className="relative mx-auto grid max-w-[96rem] lg:min-h-[min(calc(100svh-5.5rem),860px)] lg:grid-cols-[45%_55%]">
        {/* Image: top on mobile, right 55% on desktop */}
        <div className="relative h-[56svh] min-h-80 lg:order-2 lg:h-auto">
          <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_60%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,#000_22%,#000_85%,transparent)]">
            <HeroPicture desktop={hero.image} mobile={hero.mobileImage} />
          </div>
          <span aria-hidden="true" className="absolute -right-10 top-8 hidden h-3 w-80 -rotate-[24deg] bg-brand lg:block motion-safe:animate-sweep" />
          <span aria-hidden="true" className="absolute bottom-24 right-6 hidden h-2 w-40 -rotate-[24deg] bg-gold/80 lg:block motion-safe:animate-sweep [animation-delay:300ms]" />
        </div>

        {/* Copy */}
        <div className="relative z-10 -mt-24 flex flex-col justify-center px-4 pb-14 sm:px-8 lg:order-1 lg:mt-0 lg:py-16 lg:pl-10 xl:pl-16">
          <h1 id="hero-heading" className="font-display font-bold">
            <span className="block -skew-x-6 text-[clamp(3.4rem,7vw,6rem)] text-white brush-text motion-safe:animate-rise">
              {hero.line1}
            </span>
            <span className="relative -mt-2 block -skew-x-6 text-[clamp(4rem,8.6vw,7.6rem)] text-brand brush-text motion-safe:animate-rise [animation-delay:120ms]">
              {hero.line2}
            </span>
            <span className="relative mt-1 flex items-center gap-4 text-[clamp(2.6rem,7vw,4.75rem)] text-white motion-safe:animate-rise [animation-delay:240ms]">
              <span aria-hidden="true" className="h-2 w-14 origin-left -skew-x-[30deg] bg-brand motion-safe:animate-sweep [animation-delay:500ms] sm:w-24" />
              <span className="-skew-x-6">{hero.line3}</span>
              <span aria-hidden="true" className="h-2 w-10 origin-left -skew-x-[30deg] bg-brand motion-safe:animate-sweep [animation-delay:650ms] sm:w-16" />
            </span>
            <span className="mt-3 block text-[clamp(1.9rem,4.4vw,3rem)] italic text-white motion-safe:animate-rise [animation-delay:360ms]">
              {hero.subheadline}
            </span>
          </h1>

          <p className="mt-6 font-condensed text-2xl font-bold text-brand motion-safe:animate-rise [animation-delay:480ms]">{hero.tagline}</p>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg motion-safe:animate-rise [animation-delay:560ms]">
            {hero.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {hero.primary.label && (
              <ButtonLink href={hero.primary.href || "/services"} className="motion-safe:animate-rise [animation-delay:680ms]">
                {hero.primary.label}
              </ButtonLink>
            )}
            {hero.secondary.label && (
              <ButtonLink href={hero.secondary.href || "/about"} variant="outline" className="motion-safe:animate-rise [animation-delay:780ms]">
                {hero.secondary.label}
              </ButtonLink>
            )}
          </div>
          {hero.tertiary.label && (
            <Link
              href={hero.tertiary.href || "#join"}
              className="mt-6 inline-flex w-fit items-center gap-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-white/80 hover:text-brand motion-safe:animate-rise [animation-delay:880ms]"
            >
              {hero.tertiary.label} <ChevronDown className="size-4 text-brand" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

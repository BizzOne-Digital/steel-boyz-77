import Link from "next/link";
import { ChevronRight, Mail, Phone, UserRound } from "lucide-react";
import type { LeaderItem, MerchItem, ServiceItem, TeamItem } from "@/lib/data";
import { telHref } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { SmartImage } from "@/components/ui/SmartImage";

export function ServiceCard({ service, headingLevel = "h3" }: { service: ServiceItem; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-charcoal clip-card transition-[transform,border-color] duration-300 hover:-translate-y-1.5 hover:border-brand">
      <div className="relative aspect-[16/9] overflow-hidden">
        <SmartImage
          src={service.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover grayscale-[35%] transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
        <span className="absolute left-5 top-5 inline-flex size-14 items-center justify-center bg-brand text-black clip-angle">
          <Icon name={service.icon} className="size-7" strokeWidth={2} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <H className="font-display text-3xl text-white sm:text-4xl">{service.title}</H>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted sm:text-base">{service.summary}</p>
        <p className="mt-5 font-condensed text-2xl font-bold uppercase text-brand">{service.priceLabel}</p>
        {service.note && <p className="mt-1 text-xs leading-relaxed text-white/60">{service.note}</p>}
        <Link
          href={`/services#${service.slug}`}
          className="mt-6 inline-flex w-fit items-center gap-1.5 font-condensed text-base font-bold uppercase tracking-wide text-white transition-colors hover:text-brand"
          aria-label={`Learn more about ${service.title}`}
        >
          Learn More <ChevronRight className="size-5 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
      <span aria-hidden="true" className="absolute bottom-0 right-0 size-7 bg-brand" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />
    </article>
  );
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  tba: "Details to be announced",
  development: "Under development",
};

export function TeamCard({ team }: { team: TeamItem }) {
  return (
    <article className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden border border-white/10 bg-charcoal clip-card transition-[transform,border-color] duration-300 hover:-translate-y-1.5 hover:border-brand">
      <SmartImage
        src={team.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover grayscale transition-transform duration-700 group-hover:scale-105"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/20" />
      <span aria-hidden="true" className="absolute right-4 top-2 font-display text-8xl text-brand/90 sm:text-9xl">
        {team.ageGroup}
      </span>
      <div className="relative p-6 sm:p-7">
        <p
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 font-condensed text-xs font-bold uppercase tracking-widest",
            team.status === "active" ? "bg-brand text-black" : "border border-white/40 text-white",
          )}
        >
          <span aria-hidden="true" className={cn("size-1.5 rounded-full", team.status === "active" ? "bg-black" : "bg-brand")} />
          {STATUS_LABEL[team.status] ?? team.status}
        </p>
        <h3 className="mt-4 font-display text-4xl text-white">{team.name}</h3>
        <p className="mt-1 font-condensed text-sm font-semibold uppercase tracking-wide text-brand">Age group: {team.ageGroup}</p>
        {team.coach && <p className="mt-2 text-sm text-white">Coach: {team.coach}</p>}
        {team.description && <p className="mt-2 text-sm leading-relaxed text-muted">{team.description}</p>}
        <Link
          href="/contact?interest=team-play"
          className="mt-5 inline-flex items-center gap-1.5 font-condensed text-base font-bold uppercase text-white hover:text-brand"
          aria-label={`Contact us about ${team.name}`}
        >
          Contact Us <ChevronRight className="size-5 text-brand" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function LeaderCard({ leader, showContact = false }: { leader: LeaderItem; showContact?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-charcoal clip-card transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-brand sm:flex-row">
      <div className="relative aspect-square shrink-0 overflow-hidden bg-ink-2 sm:w-48">
        {leader.image ? (
          <SmartImage src={leader.image} alt={`Photo of ${leader.name}`} fill sizes="12rem" className="object-cover" />
        ) : (
          <div role="img" aria-label="Photo coming soon" className="flex h-full items-end justify-center bg-[radial-gradient(circle_at_50%_30%,#2a2a2a,#0b0b0b)]">
            <UserRound className="size-36 translate-y-4 text-steel" strokeWidth={1} aria-hidden="true" />
          </div>
        )}
        <span aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-1 bg-brand sm:block" />
      </div>
      <div className="flex flex-1 flex-col justify-center p-6 sm:p-7">
        <h3 className="font-display text-4xl text-white">{leader.name}</h3>
        <p className="mt-1 font-condensed text-base font-bold uppercase tracking-wide text-brand">{leader.role}</p>
        {leader.bio && <p className="mt-3 text-sm leading-relaxed text-muted">{leader.bio}</p>}
        {showContact && (leader.email || leader.phone) && (
          <ul className="mt-4 space-y-1.5 text-sm">
            {leader.email && (
              <li>
                <a href={`mailto:${leader.email}`} className="inline-flex items-center gap-2 break-all text-white hover:text-brand">
                  <Mail className="size-4 shrink-0 text-brand" aria-hidden="true" /> {leader.email}
                </a>
              </li>
            )}
            {leader.phone && (
              <li>
                <a href={telHref(leader.phone)} className="inline-flex items-center gap-2 text-white hover:text-brand">
                  <Phone className="size-4 shrink-0 text-brand" aria-hidden="true" /> {leader.phone}
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}

const AVAILABILITY: Record<string, string> = {
  inquire: "Contact to Order",
  "coming-soon": "Coming Soon",
  unavailable: "Currently Unavailable",
};

export function MerchCard({ item }: { item: MerchItem }) {
  const orderable = item.availability === "inquire";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-charcoal clip-card transition-[transform,border-color] duration-300 hover:-translate-y-1.5 hover:border-brand">
      <div className="relative aspect-square overflow-hidden bg-white">
        <SmartImage
          src={item.image}
          alt={`${item.name}${item.illustrative ? " (illustrative mockup)" : ""}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />
        {item.illustrative && (
          <span className="absolute left-4 top-4 bg-black/80 px-2.5 py-1 font-condensed text-[0.7rem] font-bold uppercase tracking-widest text-white/80">
            Illustrative mockup
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-3xl text-white">{item.name}</h3>
          <p className="font-condensed text-3xl font-bold text-brand">{formatPrice(item.price)}</p>
        </div>
        {item.description && <p className="mt-2 flex-1 text-sm text-muted">{item.description}</p>}
        {orderable ? (
          <Link
            href={`/contact?interest=merchandise&product=${encodeURIComponent(item.slug)}#inquiry`}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 bg-brand px-5 font-condensed font-bold uppercase text-black clip-angle transition-transform hover:-translate-y-0.5"
          >
            Contact to Order <ChevronRight className="size-5" aria-hidden="true" />
          </Link>
        ) : (
          <p className="mt-6 inline-flex min-h-12 items-center justify-center border border-white/20 font-condensed font-bold uppercase text-white/70">
            {AVAILABILITY[item.availability]}
          </p>
        )}
      </div>
    </article>
  );
}

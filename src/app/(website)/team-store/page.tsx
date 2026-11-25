import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, PackageCheck, ShoppingBag } from "lucide-react";
import { getMerchandise, getSettings } from "@/lib/data";
import { telHref } from "@/lib/constants";
import { InnerHero } from "@/components/shared/InnerHero";
import { MerchCard } from "@/components/shared/Cards";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Team Store",
  description: "Official STEEL BOYZ 7-7 gear: shirts, polos, hats and team uniforms. Contact us to order.",
  alternates: { canonical: "/team-store" },
};

export default async function TeamStorePage() {
  const [items, settings] = await Promise.all([getMerchandise(), getSettings()]);
  const { phone, email } = settings.contact;

  const steps = [
    { icon: ShoppingBag, title: "Pick your gear", text: "Choose the items, sizes and colors you want." },
    { icon: MessageSquare, title: "Send an order request", text: "Tap “Contact to Order” and tell us what you need." },
    { icon: PackageCheck, title: "We confirm & arrange pickup", text: "Our team confirms availability, total and pickup or delivery." },
  ];

  return (
    <>
      <InnerHero
        eyebrow="Team Store"
        heading="Rep the Steel. Official Gear."
        text="Represent STEEL BOYZ 7-7 on and off the field."
        image="/images/site/hero-team.webp"
        crumb="Team Store"
      />

      <section className="bg-ink py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow="Shop" title="Official" highlight="STEEL BOYZ Gear" text="Orders are handled directly by our team. Choose an item and send us an order request." />
          {items.length === 0 ? (
            <p className="mt-12 border border-dashed border-white/20 p-10 text-center text-muted">New gear is coming soon. Check back shortly.</p>
          ) : (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((m, i) => (
                <Reveal as="li" key={m.slug} delay={(i % 4) * 0.08}>
                  <MerchCard item={m} />
                </Reveal>
              ))}
            </ul>
          )}
          <p className="mt-6 text-xs text-white/50">Items marked “Illustrative mockup” show the design; final products may vary slightly.</p>
        </Container>
      </section>

      <section aria-label="How ordering works" className="border-t border-white/10 bg-ink-2 py-16 lg:py-20">
        <Container>
          <h2 className="font-display text-5xl text-white">
            How <span className="text-brand">Ordering</span> Works
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="border-l-4 border-brand bg-charcoal p-6">
                <span className="font-display text-5xl leading-none text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 flex items-center gap-2 font-condensed text-xl font-bold uppercase text-white">
                  <s.icon className="size-5 text-brand" aria-hidden="true" /> {s.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/contact?interest=merchandise#inquiry"
              className="inline-flex min-h-12 items-center bg-brand px-7 font-condensed font-bold uppercase text-black clip-angle transition-transform hover:-translate-y-0.5"
            >
              Send an Order Request
            </Link>
            {phone && (
              <a href={telHref(phone)} className="font-condensed text-lg font-bold uppercase text-white hover:text-brand">
                Or call {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="text-sm text-muted hover:text-brand">
                {email}
              </a>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, ExternalLink, FileSignature, Shirt } from "lucide-react";
import { getServices, getSettings } from "@/lib/data";
import { InnerHero } from "@/components/shared/InnerHero";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Player Registration",
  description: "Register for STEEL BOYZ 7-7 tryouts through our online registration form.",
  alternates: { canonical: "/register" },
};

/** Google Forms only renders inside an iframe with ?embedded=true. */
function embedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname !== "docs.google.com" || !u.pathname.startsWith("/forms/")) return null;
    u.searchParams.delete("usp");
    u.searchParams.set("embedded", "true");
    return u.toString();
  } catch {
    return null;
  }
}

export default async function RegisterPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const reg = settings.registration;
  const tryouts = services.find((s) => s.slug === "tryouts");
  const hasForm = reg.url.startsWith("https://");
  const embed = hasForm ? embedUrl(reg.url) : null;

  const steps = [
    { icon: ClipboardCheck, title: "Fill in the form", text: "Complete the tryout registration form below. It takes about two minutes." },
    { icon: FileSignature, title: "Submit & hear from us", text: "Press Submit. Our team will contact you with next steps and any paperwork required." },
    { icon: Shirt, title: "Get ready for tryouts", text: tryouts ? `${tryouts.priceLabel}. ${tryouts.note}` : "Our team follows up with tryout details." },
  ];

  return (
    <>
      <InnerHero
        eyebrow="Player Registration"
        heading="Join the Steel. Register Today."
        text="Register for STEEL BOYZ 7-7 tryouts right here on this page."
        image="/images/site/service-tryouts.webp"
        crumb="Register"
      />

      <section className="bg-ink pb-8 pt-16 lg:pt-20">
        <Container>
          <h2 className="font-display text-5xl text-white sm:text-6xl">
            Tryout <span className="text-brand">Registration</span>
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 border-l-4 border-brand bg-charcoal p-5">
                <span className="font-display text-4xl leading-none text-brand">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="flex items-center gap-2 font-condensed text-lg font-bold uppercase text-white">
                    <s.icon className="size-5 shrink-0 text-brand" aria-hidden="true" /> {s.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="form" aria-label="Registration form" className="bg-ink pb-16 lg:pb-24">
        <Container>
          {embed ? (
            <>
              <div className="overflow-hidden border-2 border-brand bg-white">
                <iframe
                  src={embed}
                  title="STEEL BOYZ 7-7 player registration and waiver form"
                  className="block h-[1250px] w-full sm:h-[1150px]"
                  loading="lazy"
                >
                  Loading registration form…
                </iframe>
              </div>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
                Having trouble with the form above?
                <a href={reg.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                  Open it in a new tab <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </p>
            </>
          ) : hasForm ? (
            <a
              href={reg.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center gap-2 bg-brand px-8 font-condensed text-lg font-bold uppercase text-black clip-angle"
            >
              {reg.buttonLabel || "Register Now"} <ExternalLink className="size-5" aria-hidden="true" />
            </a>
          ) : (
            <p className="text-white/80">
              Online registration opens soon.{" "}
              <Link href="/contact?interest=tryouts#inquiry" className="text-brand underline">
                Contact us
              </Link>{" "}
              to reserve a spot.
            </p>
          )}
        </Container>
      </section>

      <section className="border-t border-white/10 bg-ink-2 py-12">
        <Container className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-white/80">Questions about registration, tryouts or waivers?</p>
          <Link href="/contact?interest=tryouts#inquiry" className="font-condensed text-lg font-bold uppercase text-brand hover:underline">
            Contact our team →
          </Link>
        </Container>
      </section>
    </>
  );
}

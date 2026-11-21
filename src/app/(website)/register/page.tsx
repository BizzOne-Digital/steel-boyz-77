import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, ExternalLink, FileSignature, QrCode, Shirt } from "lucide-react";
import { getServices, getSettings } from "@/lib/data";
import { InnerHero } from "@/components/shared/InnerHero";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";

export const metadata: Metadata = {
  title: "Player Registration",
  description: "Register for STEEL BOYZ 7-7 and complete the required waivers through our online registration form.",
  alternates: { canonical: "/register" },
};

export default async function RegisterPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const reg = settings.registration;
  const tryouts = services.find((s) => s.slug === "tryouts");
  const hasForm = reg.url.startsWith("https://");

  const steps = [
    { icon: ClipboardCheck, title: "Open the form", text: "Use the button or scan the QR code with your phone camera." },
    { icon: FileSignature, title: "Complete registration & waivers", text: "A parent or guardian fills in the athlete's details and signs the required waivers." },
    { icon: Shirt, title: "Get ready for tryouts", text: tryouts ? `${tryouts.priceLabel}. ${tryouts.note}` : "Our team follows up with tryout details." },
  ];

  return (
    <>
      <InnerHero
        eyebrow="Player Registration"
        heading="Join the Steel. Register Today."
        text="Registration and waivers are completed online in a few minutes."
        image="/images/site/service-tryouts.webp"
        crumb="Register"
      />

      <section className="bg-ink py-16 lg:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal direction="left">
            <h2 className="font-display text-5xl text-white sm:text-6xl">
              Registration <span className="text-brand">&amp; Waivers</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
              Complete player registration and the required waivers through our secure online form. A parent or guardian should
              complete the form for athletes under 18.
            </p>

            <ol className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4 border-l-4 border-brand bg-charcoal p-5">
                  <span className="font-display text-4xl leading-none text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="flex items-center gap-2 font-condensed text-xl font-bold uppercase text-white">
                      <s.icon className="size-5 text-brand" aria-hidden="true" /> {s.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            {hasForm ? (
              <a
                href={reg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex min-h-14 items-center gap-2 bg-brand px-8 font-condensed text-lg font-bold uppercase text-black clip-angle transition-transform hover:-translate-y-0.5"
              >
                {reg.buttonLabel || "Register Now"}
                <ExternalLink className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                <span className="sr-only">(opens the registration form in a new tab)</span>
              </a>
            ) : (
              <p className="mt-8 text-white/80">
                Online registration opens soon.{" "}
                <Link href="/contact?interest=tryouts#inquiry" className="text-brand underline">
                  Contact us
                </Link>{" "}
                to reserve a spot.
              </p>
            )}
            <p className="mt-3 text-xs text-muted">The registration form opens in Google Forms.</p>
          </Reveal>

          {hasForm && reg.qrImage && (
            <Reveal direction="right" className="mx-auto w-full max-w-sm">
              <div className="border-2 border-brand bg-ink-2 p-6 text-center clip-card">
                <p className="flex items-center justify-center gap-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-brand">
                  <QrCode className="size-4" aria-hidden="true" /> Scan to register
                </p>
                <div className="mt-4 bg-white p-5">
                  <SmartImage
                    src={reg.qrImage}
                    alt="QR code that opens the STEEL BOYZ 7-7 registration and waiver form"
                    width={700}
                    height={700}
                    sizes="(min-width: 1024px) 22rem, 80vw"
                    className="h-auto w-full"
                  />
                </div>
                <p className="mt-4 text-sm text-white/75">Point your phone camera at the code to open the form.</p>
              </div>
            </Reveal>
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

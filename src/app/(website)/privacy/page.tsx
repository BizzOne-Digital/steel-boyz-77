import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { InnerHero } from "@/components/shared/InnerHero";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How STEEL BOYZ 7-7 handles inquiry information.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <>
      <InnerHero heading="Privacy & Inquiries" text="How we handle the information you share with us." image="/images/site/hero-contact.webp" crumb="Privacy" />
      <section className="bg-ink py-16 lg:py-24">
        <Container className="max-w-3xl space-y-6 text-base leading-relaxed text-white/80">
          <p>{s.privacy.formNotice}</p>
          <p>
            Our inquiry form is designed for parents and guardians. We ask only for the details needed to respond: a parent or guardian name,
            contact details, the athlete&apos;s first name and age, and your message. We do not create public athlete profiles, and we never
            publish inquiry information.
          </p>
          <p>
            Inquiries are stored securely and are only accessible to authorized {s.branding.businessName} staff. We do not subscribe
            anyone to marketing messages through this form.
          </p>
          <p>
            To ask us to update or delete information you have sent, contact{" "}
            {s.contact.email ? (
              <a className="text-brand underline" href={`mailto:${s.contact.email}`}>
                {s.contact.email}
              </a>
            ) : (
              "our team"
            )}
            .
          </p>
        </Container>
      </section>
    </>
  );
}

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getServices, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const sameAs = Object.values(settings.social).filter((v) => v.startsWith("https://"));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: settings.branding.businessName,
    sport: "American football",
    url: siteUrl(),
    logo: `${siteUrl()}${settings.branding.logo}`,
    email: settings.contact.email || undefined,
    telephone: settings.contact.phone || undefined,
    description: settings.seo.defaultDescription,
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] bg-brand px-4 py-2 font-bold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header
        logo={settings.branding.logo}
        name={settings.branding.businessName}
        affiliation={settings.branding.affiliation}
      />
      <main id="main" className="overflow-x-clip">
        {children}
      </main>
      <Footer settings={settings} services={services.map((s) => ({ title: s.title, slug: s.slug }))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}

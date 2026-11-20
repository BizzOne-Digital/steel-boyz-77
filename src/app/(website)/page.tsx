import { HeroSection } from "@/components/home/HeroSection";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import {
  AboutPreview,
  BrandStatement,
  ContactCTA,
  DevelopmentProcess,
  LeadershipPreview,
  MerchandisePreview,
  ServicesPreview,
  TeamPreview,
} from "@/components/home/Sections";
import { getLeadership, getMerchandise, getPage, getServices, getSettings, getTeams } from "@/lib/data";
import { HOME_SECTION_KEYS } from "@/lib/content/schema";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("home");

export default async function HomePage() {
  const [home, settings, services, teams, leaders, merch] = await Promise.all([
    getPage("home"),
    getSettings(),
    getServices(),
    getTeams(),
    getLeadership(),
    getMerchandise(),
  ]);

  const sections: Record<(typeof HOME_SECTION_KEYS)[number], React.ReactNode> = {
    features: home.features.visible && <FeatureStrip data={home.features} />,
    about: home.about.visible && <AboutPreview data={home.about} />,
    services: home.services.visible && services.length > 0 && <ServicesPreview data={home.services} services={services} />,
    statement: home.statement.visible && <BrandStatement data={home.statement} />,
    process: home.process.visible && <DevelopmentProcess data={home.process} />,
    teams: home.teams.visible && <TeamPreview data={home.teams} teams={teams} />,
    leadership: home.leadership.visible && <LeadershipPreview data={home.leadership} leaders={leaders} />,
    merch: home.merch.visible && <MerchandisePreview data={home.merch} items={merch} />,
    cta: home.cta.visible && <ContactCTA data={home.cta} contact={settings.contact} />,
  };

  // Admin-defined order; any section missing from the list is appended in default order.
  const order = [
    ...home.sectionOrder.filter((k): k is keyof typeof sections => k in sections),
    ...HOME_SECTION_KEYS.filter((k) => !home.sectionOrder.includes(k)),
  ];
  const unique = [...new Set(order)];

  return (
    <>
      <HeroSection hero={home.hero} />
      {unique.map((key) => (
        <div key={key}>{sections[key]}</div>
      ))}
    </>
  );
}

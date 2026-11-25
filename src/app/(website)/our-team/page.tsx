import { getLeadership, getPage, getTeams } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { ClosingCTA, InnerHero } from "@/components/shared/InnerHero";
import { LeaderCard, TeamCard } from "@/components/shared/Cards";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const generateMetadata = () => pageMetadata("team");

export default async function OurTeamPage() {
  const [p, leaders, teams] = await Promise.all([getPage("team"), getLeadership(), getTeams()]);
  return (
    <>
      <InnerHero {...p.hero} crumb="Our Team" />

      {leaders.length > 0 && (
        <section aria-label={p.leadership.heading} className="bg-ink py-20 lg:py-28">
          <Container>
            <SectionHeading eyebrow={p.leadership.eyebrow} title={p.leadership.heading} text={p.leadership.text} />
            <ul className="mt-14 grid gap-6">
              {leaders.map((l, i) => (
                <Reveal as="li" key={l._id ?? l.name} delay={i * 0.1}>
                  <LeaderCard leader={l} showContact />
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {teams.length > 0 && (
        <section aria-label={p.programs.heading} className="bg-ink-2 py-20 lg:py-28 grain">
          <Container className="relative">
            <SectionHeading eyebrow={p.programs.eyebrow} title={p.programs.heading} text={p.programs.text} />
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((t, i) => (
                <Reveal as="li" key={t._id ?? t.ageGroup} delay={i * 0.1}>
                  <TeamCard team={t} />
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <ClosingCTA heading={p.cta.heading} text={p.cta.text} label={p.cta.button.label} href={p.cta.button.href} />
    </>
  );
}

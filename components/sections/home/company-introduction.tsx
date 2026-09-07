import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { Reveal } from '@/components/ui/reveal';
import { company, capabilityStatements } from '@/lib/config/company';
import { Icon } from '@/components/ui/icon';

export function CompanyIntroduction() {
  return (
    <Section tone="default">
      <Container size="xl">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionEyebrow>About {company.name}</SectionEyebrow>
              <SectionTitle className="mt-4">
                Technology. Engineering. Digital Growth.
              </SectionTitle>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <SectionLead className="text-base md:text-lg leading-relaxed">
                Founded in {company.foundedYear}, {company.name} has evolved from a focused software initiative into a growing technology organisation built around engineering, innovation and digital transformation.
              </SectionLead>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-6 space-y-5 text-base md:text-lg leading-relaxed text-ink-600">
                <p>
                  Today, our capabilities span software development, web and mobile platforms, artificial intelligence and machine learning, SaaS products, product design, automation and digital growth.
                </p>
                <p>
                  From Bangladesh to the wider digital economy, {company.name} works with businesses and organisations that need technology built for real-world impact.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {capabilityStatements.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-start gap-3 rounded-2xl border border-ink-200/70 bg-white p-4"
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-ink-900">{c.label}</div>
                      <div className="text-xs text-ink-500">{c.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';

const capabilities = [
  {
    title: 'AI Applications',
    description:
      'Copilots, intelligent search and AI-driven features engineered into real products.',
    icon: 'ai' as const,
  },
  {
    title: 'AI Automation',
    description:
      'Operational AI workflows that move manual processes into reliable systems.',
    icon: 'automation' as const,
  },
  {
    title: 'Machine Learning',
    description:
      'Prediction, classification and recommendation — built with rigorous evaluation.',
    icon: 'ml' as const,
  },
  {
    title: 'AI Assistants',
    description:
      'Conversational AI grounded in your data — for support, sales and internal knowledge.',
    icon: 'ai' as const,
  },
  {
    title: 'AI Integrations',
    description:
      'Bring AI capabilities into existing platforms without rebuilding from scratch.',
    icon: 'api' as const,
  },
  {
    title: 'Data-Driven Products',
    description:
      'Insight-led digital products that turn your data into compounding value.',
    icon: 'rocket' as const,
  },
];

export function AIFeature() {
  return (
    <Section tone="dark" className="overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(rgba(124,92,255,0.4)_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden />
      <div className="absolute -top-32 left-1/2 -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-accent-500/30 blur-[120px]" aria-hidden />
      <div className="absolute -bottom-32 right-1/4 -z-10 h-[320px] w-[480px] rounded-full bg-cyan-500/15 blur-[120px]" aria-hidden />

      <Container size="xl">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionEyebrow className="border-white/15 bg-white/5 text-white/80">
                AI · emerging technology
              </SectionEyebrow>
              <SectionTitle className="mt-4 text-white">
                Applied AI for real digital products — engineered, not demonstrated.
              </SectionTitle>
              <SectionLead className="text-white/70">
                We treat AI features like any other production system: clear scope, rigorous evaluation, cost-aware architecture and reliable observability.
              </SectionLead>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/services/ai-ml" variant="primary" size="lg">
                  Explore AI capabilities
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
                <Button href="/contact" variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Discuss an AI project
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {capabilities.map((c, idx) => (
                <Reveal
                  key={c.title}
                  delay={(idx % 4) * 70}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition-colors hover:bg-white/[0.06]"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon name={c.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg tracking-tight text-white">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{c.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
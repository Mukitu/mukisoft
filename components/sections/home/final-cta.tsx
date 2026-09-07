import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/config/company';
import { getTranslations } from 'next-intl/server';

export async function FinalCTA() {
  const t = await getTranslations('home.finalCta');
  return (
    <Section tone="default" spacing="lg">
      <Container size="xl">
        <div className="relative isolate overflow-hidden rounded-3xl bg-ink-950 px-8 py-16 md:px-16 md:py-24">
          <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(rgba(124,92,255,0.5)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />
          <div className="absolute -right-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-accent-500/30 blur-[120px]" aria-hidden />
          <div className="absolute -left-32 -bottom-32 -z-10 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]" aria-hidden />

          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-300" />
                {t('eyebrow')}
              </span>
              <h2 className="mt-5 font-display text-4xl md:text-5xl tracking-tighter text-white text-balance">
                {t('title')}
              </h2>
              <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-white/70">
                {t('lead')}
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
              <Button size="lg" href="/contact" variant="primary" className="w-full lg:w-auto px-6">
                {t('ctaPrimary')}
                <Icon name="arrow-right" className="h-4 w-4" />
              </Button>
              <Link
                href={`mailto:${company.contact.email}`}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white/80 hover:text-white"
              >
                {t('ctaPrimary')}
                <Icon name="arrow-up-right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

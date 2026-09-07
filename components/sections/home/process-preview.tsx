import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle } from '@/components/ui/section';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import { fetchPublishedProcess } from '@/lib/supabase/public';
import { getTranslations } from 'next-intl/server';
import { applyTranslations } from '@/lib/i18n/apply-translations';
import type { Locale } from '@/lib/i18n/config';

/**
 * Home-page process preview. Reads only from Supabase
 * (`public.process_steps`) and renders nothing when there are no
 * published steps — never falls back to a hardcoded array.
 */
export async function ProcessPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations('home.process');
  const raw = await fetchPublishedProcess();
  const steps = await applyTranslations(raw, 'process_step', locale);
  const list = steps.slice(0, 5);
  if (list.length === 0) return null;

  return (
    <Section tone="muted">
      <Container size="xl">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('title')}</SectionTitle>
          </div>
          <Link
            href="/process"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
          >
            {t('ctaAll')}
            <Icon name="arrow-up-right" className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          {list.map((step, idx) => (
            <Reveal
              key={step.id}
              delay={(idx % 5) * 50}
              className="relative rounded-2xl border border-ink-200/70 bg-white p-6"
            >
              <span className="font-mono text-xs tracking-tight text-accent-600">
                {step.step_number}
              </span>
              <h3 className="mt-3 font-display text-lg tracking-tight">{step.title}</h3>
              {step.short_description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.short_description}</p>
              ) : null}
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

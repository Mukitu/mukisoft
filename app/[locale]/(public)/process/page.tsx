import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils/cn';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedProcess } from '@/lib/supabase/public';
import type { ProcessStep } from '@/lib/supabase/types';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  await ensureCompanySettings();
  const t = await getTranslations('process');
  return {
    title: t('pageEyebrow'),
    description: t('lead'),
  };
}

const principleKeys = [
  { titleKey: 'principleWorkingTitle', descKey: 'principleWorkingDesc' },
  { titleKey: 'principleReportingTitle', descKey: 'principleReportingDesc' },
  { titleKey: 'principleQualityTitle', descKey: 'principleQualityDesc' },
];

export default async function ProcessPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('process');

  const cmsSteps = await fetchPublishedProcess(locale);

  const steps: Array<{
    number: string;
    title: string;
    description: string;
    activities: string[];
  }> =
    cmsSteps.length > 0
      ? cmsSteps.map((s: ProcessStep) => ({
          number: s.step_number,
          title: s.title,
          description: s.short_description ?? '',
          activities: (s.full_description ?? '')
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.startsWith('-'))
            .map((l) => l.replace(/^-\s*/, '')),
        }))
      : [];

  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle', { company: company.name })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('pageEyebrow') }]}
      />

      {steps.length === 0 ? (
        <Section tone="default">
          <Container size="xl">
            <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-10 text-center md:p-14">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                {t('preparingEyebrow')}
              </span>
              <h2 className="mt-4 font-display text-2xl md:text-3xl tracking-tight text-balance">
                {t('preparingTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-600">
                {t('preparingBody', { company: company.name })}
                <Link href="/contact" className="font-medium text-ink-900 underline-offset-4 hover:text-accent-600 hover:underline">
                  {t('preparingLink')}
                </Link>
                {t('preparingSuffix')}
              </p>
            </Reveal>
          </Container>
        </Section>
      ) : (
        <Section tone="default">
          <Container size="xl">
            <div className="relative">
              <div
                className="absolute left-6 top-2 bottom-2 hidden w-px bg-gradient-to-b from-accent-300 via-ink-200 to-transparent md:left-1/2 md:block"
                aria-hidden
              />
              <ol className="space-y-12 md:space-y-16">
                {steps.map((step, idx) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <li key={step.number} className="relative">
                      <Reveal delay={idx * 60} className={cn('grid gap-6 md:grid-cols-2 md:gap-12')}>
                        <div className={cn(isLeft ? 'md:text-right' : 'md:order-2 md:text-left')}>
                          <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                            {t('stageLabel', { number: step.number })}
                          </span>
                          <h3 className="mt-3 font-display text-2xl md:text-3xl tracking-tight text-balance">
                            {step.title}
                          </h3>
                          {step.description ? (
                            <p className="mt-3 text-base leading-relaxed text-ink-600">
                              {step.description}
                            </p>
                          ) : null}
                        </div>

                        <div className={cn(isLeft ? '' : 'md:order-1 md:text-right')}>
                          <div className="rounded-2xl border border-ink-200/70 bg-white p-6 md:p-7">
                            <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                              {t('activitiesEyebrow')}
                            </span>
                            {step.activities.length === 0 ? (
                              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                                {t('activitiesEmpty')}
                              </p>
                            ) : (
                              <ul className="mt-4 space-y-2">
                                {step.activities.map((a) => (
                                  <li
                                    key={a}
                                    className="flex items-start gap-2 text-sm text-ink-700"
                                  >
                                    <Icon name="check" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent-500" />
                                    <span>{a}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </Reveal>
                      <span
                        className={cn(
                          'absolute left-6 top-2 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-white ring-2 ring-accent-400 md:left-1/2 md:block',
                        )}
                        aria-hidden
                      />
                    </li>
                  );
                })}
              </ol>
            </div>
          </Container>
        </Section>
      )}

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('principlesEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('principlesTitle', { company: company.name })}</SectionTitle>
            <SectionLead className="mt-5">
              {t('principlesLead')}
            </SectionLead>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {principleKeys.map((c, i) => (
              <Reveal key={c.titleKey} delay={i * 50} className="rounded-2xl border border-ink-200/70 bg-white p-7">
                <h3 className="font-display text-lg tracking-tight">{t(c.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t(c.descKey)}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
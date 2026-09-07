import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { IconBox } from '@/components/ui/icon-box';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedCareers } from '@/lib/supabase/public';
import type { Career } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const t = await getTranslations('careers');
  return {
    title: t('metaTitle'),
    description: t('metaDescription', { company: company.name }),
  };
}

const benefitKeys = [
  { icon: 'globe' as const, titleKey: 'remoteTitle', descKey: 'remoteDesc' },
  { icon: 'users' as const, titleKey: 'seniorsTitle', descKey: 'seniorsDesc' },
  { icon: 'briefcase' as const, titleKey: 'ownershipTitle', descKey: 'ownershipDesc' },
  { icon: 'lightbulb' as const, titleKey: 'learningTitle', descKey: 'learningDesc' },
  { icon: 'shield' as const, titleKey: 'horizonTitle', descKey: 'horizonDesc' },
  { icon: 'rocket' as const, titleKey: 'internationalTitle', descKey: 'internationalDesc' },
];

const principleKeys = [
  { titleKey: 'craftTitle', descKey: 'craftDesc' },
  { titleKey: 'asyncTitle', descKey: 'asyncDesc' },
  { titleKey: 'feedbackTitle', descKey: 'feedbackDesc' },
  { titleKey: 'outcomesTitle', descKey: 'outcomesDesc' },
];

export default async function CareersPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('careers');

  const cmsJobs = await fetchPublishedCareers(locale);
  const tCommon = await getTranslations('common');
  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('heroTitle', { company: company.name })}
        subtitle={t('heroSubtitle', { company: company.name })}
        crumbs={[{ label: tCommon('home'), href: '/' }, { label: t('pageEyebrow') }]}
      />

      <Section tone="default">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('whyEyebrow', { company: company.name })}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('whyTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {t('whyLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefitKeys.map((b, i) => (
              <Reveal
                key={b.titleKey}
                delay={(i % 3) * 50}
                className="rounded-2xl border border-ink-200/70 bg-white p-7"
              >
                <IconBox name={b.icon} tone="accent" />
                <h3 className="mt-5 font-display text-lg tracking-tight">{t(`benefits.${b.titleKey}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t(`benefits.${b.descKey}`)}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('workEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('workTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {t('workLead')}
            </SectionLead>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {principleKeys.map((c, i) => (
              <Reveal
                key={c.titleKey}
                delay={(i % 2) * 60}
                className="rounded-2xl border border-ink-200/70 bg-white p-7"
              >
                <h3 className="font-display text-lg tracking-tight">{t(`principles.${c.titleKey}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t(`principles.${c.descKey}`)}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="default">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('openPositionsEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('openPositionsTitle', { company: company.name })}</SectionTitle>
            <SectionLead className="mt-5">
              {t('openPositionsLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4">
            {cmsJobs.length === 0 ? (
              <Reveal className="rounded-2xl border border-ink-200/70 bg-white p-8 text-center">
                <p className="text-base text-ink-600">
                  {t('emptyPositions')}
                </p>
              </Reveal>
            ) : (
              cmsJobs.map((j: Career) => (
                <Reveal
                  key={j.id}
                  className="group rounded-2xl border border-ink-200/70 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {j.department ? <Badge tone="accent">{j.department}</Badge> : null}
                        {j.location ? <Badge>{j.location}</Badge> : null}
                        {j.employment_type ? <Badge tone="outline">{j.employment_type}</Badge> : null}
                      </div>
                      <h3 className="mt-3 font-display text-xl tracking-tight">{j.job_title}</h3>
                      {j.description ? (
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
                          {j.description}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      href={`mailto:${j.application_email ?? company.contact.email}?subject=${encodeURIComponent(t('applySubject', { title: j.job_title }))}`}
                      variant="primary"
                      size="sm"
                    >
                      {t('applyButton')}
                      <Icon name="arrow-up-right" className="h-4 w-4" />
                    </Button>
                  </div>
                </Reveal>
              ))
            )}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <SectionEyebrow>{t('generalEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-3">
                  {t('generalTitle', { company: company.name })}
                </SectionTitle>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
                  {t('generalBody', { company: company.name })}
                </p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <Button
                  href={`mailto:${company.contact.email}?subject=${encodeURIComponent(t('generalSubject'))}`}
                  size="lg"
                  variant="primary"
                >
                  {t('generalButton')}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

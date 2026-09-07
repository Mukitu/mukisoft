import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section, SectionTitle } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Case study',
  robots: { index: false, follow: false },
};

export default async function CaseStudyPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations('caseStudy');
  const tCommon = await getTranslations('common');

  await ensureCompanySettings();
  return (
    <>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle', { company: company.name })}
        crumbs={[
          { label: tCommon('home'), href: '/' },
          { label: t('crumbSelectedWork'), href: '/portfolio' },
          { label: t('crumbCurrent') },
        ]}
      />

      <Section tone="default">
        <Container size="xl">
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-10 text-center">
            <h2 className="font-display text-2xl tracking-tight">
              {t('emptyTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-ink-600">
              {t('emptyBody', { company: company.name })}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/portfolio" variant="primary">
                {t('viewSelectedWork')}
              </Button>
              <Button href="/contact" variant="outline">
                {tCommon('startProject')}
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

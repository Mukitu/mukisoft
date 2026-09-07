import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { IconBox } from '@/components/ui/icon-box';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { serviceCategories } from '@/lib/data/services';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  await ensureCompanySettings();
  const t = await getTranslations('services');
  return {
    title: t('metaTitle'),
    description: t('metaDescription', { company: company.name }),
  };
}

const modelKeys = [
  { titleKey: 'modelFixedTitle', descKey: 'modelFixedDesc' },
  { titleKey: 'modelContinuousTitle', descKey: 'modelContinuousDesc' },
  { titleKey: 'modelEmbeddedTitle', descKey: 'modelEmbeddedDesc' },
];

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('services');
  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle', { company: company.name })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('pageEyebrow') }]}
      />

      <Section tone="default">
        <Container size="xl">
          <Reveal className="max-w-3xl">
            <SectionEyebrow>{t('organiseEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">
              {t('organiseTitle')}
            </SectionTitle>
            <SectionLead className="mt-5">
              {t('organiseLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          <div className="mt-14 space-y-20">
            {serviceCategories.map((cat, idx) => (
              <Reveal
                key={cat.slug}
                delay={idx * 60}
                className="grid gap-10 lg:grid-cols-12 lg:gap-14"
              >
                <div className="lg:col-span-5">
                  <div className="lg:sticky lg:top-28">
                    <IconBox name={cat.icon} tone="accent" />
                    <span className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                      {t('capabilityIndex', { number: String(idx + 1).padStart(2, '0') })}
                    </span>
                    <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tighter">
                      {cat.title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-ink-600">
                      {cat.description}
                    </p>
                    <Button
                      href={`/services/${cat.slug}`}
                      variant="outline"
                      className="mt-6"
                    >
                      {t('exploreCapability')}
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <ul className="divide-y divide-ink-200/70 rounded-3xl border border-ink-200/70 bg-white">
                    {cat.services.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/services/${s.slug}`}
                          className="group flex items-start justify-between gap-6 p-6 transition-colors hover:bg-ink-50/60"
                        >
                          <div>
                            <h3 className="font-display text-lg tracking-tight">
                              {s.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-ink-600">
                              {s.shortDescription}
                            </p>
                          </div>
                          <span
                            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-all group-hover:bg-ink-900 group-hover:text-white"
                            aria-hidden
                          >
                            <Icon name="arrow-up-right" className="h-4 w-4" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('engagesEyebrow', { shortName: company.shortName })}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('engagesTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {t('engagesLead', { company: company.name })}
            </SectionLead>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {modelKeys.map((m, i) => (
              <Reveal
                key={m.titleKey}
                delay={(i % 3) * 50}
                className="rounded-2xl border border-ink-200/70 bg-white p-7"
              >
                <h3 className="font-display text-lg tracking-tight">{t(m.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t(m.descKey)}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
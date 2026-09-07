import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { company, DOMAIN } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  await ensureCompanySettings();
  const t = await getTranslations('legal');
  return {
    title: t('termsMetaTitle'),
    description: t('termsMetaDescription', { company: company.name, domain: DOMAIN }),
  };
}

export default async function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('legal');

  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('termsMetaTitle')}
        subtitle={t('termsSubtitle', { company: company.name, domain: DOMAIN })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('crumbTerms') }]}
      />
      <Section tone="default">
        <Container size="md">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <strong>{t('reviewRequiredTitle')}</strong> {t('reviewRequiredTermsBody')}
          </div>

          <div className="mt-10 space-y-10 text-base leading-relaxed text-ink-700">
            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('terms.s1Title')}</h2>
              <p className="mt-3">
                {t('terms.s1Body', { company: company.name })}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('terms.s2Title')}</h2>
              <p className="mt-3">
                {t('terms.s2Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('terms.s3Title')}</h2>
              <p className="mt-3">
                {t('terms.s3Body', { company: company.name, legalName: company.legalName })}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('terms.s4Title')}</h2>
              <p className="mt-3">
                {t('terms.s4Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('terms.s5Title')}</h2>
              <p className="mt-3">
                {t('terms.s5Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('terms.s6Title')}</h2>
              <p className="mt-3">
                {t('terms.s6Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('terms.s7Title')}</h2>
              <p className="mt-3">
                {t('terms.s7Body', { legalName: company.legalName })}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('terms.s8Title')}</h2>
              <p className="mt-3">
                {t('terms.s8Body')} <a href={`mailto:${company.contact.email}`} className="text-accent-600 underline-offset-4 hover:underline">{company.contact.email}</a>.
              </p>
            </section>
          </div>

          <p className="mt-12 text-sm text-ink-500">{t('lastUpdatedSuffix', { date: lastUpdated })}</p>
        </Container>
      </Section>
    </>
  );
}
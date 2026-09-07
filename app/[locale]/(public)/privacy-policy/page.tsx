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
    title: t('privacyMetaTitle'),
    description: t('privacyMetaDescription', { company: company.name }),
  };
}

export default async function PrivacyPolicyPage({
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
        title={t('privacyMetaTitle')}
        subtitle={t('privacySubtitle', { company: company.name, domain: DOMAIN })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('crumbPrivacy') }]}
      />
      <Section tone="default">
        <Container size="md">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <strong>{t('reviewRequiredTitle')}</strong> {t('reviewRequiredBody')}
          </div>

          <div className="mt-10 space-y-10 text-base leading-relaxed text-ink-700">
            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('privacy.s1Title')}</h2>
              <p className="mt-3">
                {t('privacy.s1Body', { company: company.name, domain: DOMAIN })}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('privacy.s2Title')}</h2>
              <p className="mt-3">
                {t('privacy.s2Body1')}
              </p>
              <p className="mt-3">
                {t('privacy.s2Body2')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('privacy.s3Title')}</h2>
              <p className="mt-3">
                {t('privacy.s3Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('privacy.s4Title')}</h2>
              <p className="mt-3">
                {t('privacy.s4Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('privacy.s5Title')}</h2>
              <p className="mt-3">
                {t('privacy.s5Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('privacy.s6Title')}</h2>
              <p className="mt-3">
                {t('privacy.s6Body', { company: company.name, location: company.contact.location })}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('privacy.s7Title')}</h2>
              <p className="mt-3">
                {t('privacy.s7Body')} <a href={`mailto:${company.contact.email}`} className="text-accent-600 underline-offset-4 hover:underline">{company.contact.email}</a>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-tight text-ink-900">{t('privacy.s8Title')}</h2>
              <p className="mt-3">
                {t('privacy.s8Body')}
              </p>
            </section>
          </div>

          <p className="mt-12 text-sm text-ink-500">{t('lastUpdatedSuffix', { date: lastUpdated })}</p>
        </Container>
      </Section>
    </>
  );
}
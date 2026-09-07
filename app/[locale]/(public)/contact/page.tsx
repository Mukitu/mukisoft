import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { ContactForm } from '@/components/forms/contact-form';
import { company, socialLinks } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const t = await getTranslations('contact');
  return {
    title: t('title'),
    description: t('subtitle', { company: company.name }),
  };
}

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  await ensureCompanySettings();
  const t = await getTranslations('contact');

  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('title')}
        subtitle={t('subtitle', { company: company.name })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('pageEyebrow') }]}
      />

      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <SectionEyebrow>{t('formEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">{t('formTitle')}</SectionTitle>
                <SectionLead className="mt-5">
                  {t('formLead', { company: company.name })}
                </SectionLead>
              </Reveal>
              <Reveal delay={80}>
                <div className="mt-8">
                  <ContactForm contactEmail={company.contact.email} companyName={company.name} />
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={100}>
                <div className="sticky top-28 space-y-6">
                  <div className="rounded-3xl border border-ink-200/70 bg-white p-6 md:p-7">
                    <SectionEyebrow>{t('directContact')}</SectionEyebrow>
                    <ul className="mt-5 divide-y divide-ink-200/70">
                      <li className="flex items-start gap-3 py-4">
                        <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                          <Icon name="mail" className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">{t('email')}</div>
                          <a href={`mailto:${company.contact.email}`} className="block text-sm font-medium text-ink-900 hover:text-accent-600 break-all">
                            {company.contact.email}
                          </a>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 py-4">
                        <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                          <Icon name="phone" className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">{t('phone')}</div>
                          <a href={`tel:${company.contact.phone}`} className="block text-sm font-medium text-ink-900 hover:text-accent-600">
                            {company.contact.phoneDisplay ?? company.contact.phone}
                          </a>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 py-4">
                        <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                          <Icon name="location" className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">{t('hq')}</div>
                          <div className="text-sm font-medium text-ink-900">{company.contact.location}</div>
                          <div className="text-xs text-ink-500">{company.contact.country}</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 py-4">
                        <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                          <Icon name="globe" className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">{t('workingHours')}</div>
                          <div className="text-sm font-medium text-ink-900">{company.contact.hours}</div>
                        </div>
                      </li>
                    </ul>

                    <div className="mt-6 border-t border-ink-200/70 pt-5">
                      <a
                        href={`mailto:${company.contact.email}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
                      >
                        <Icon name="mail" className="h-4 w-4" />
                        {t('emailCompany', { company: company.name })}
                      </a>
                    </div>
                  </div>

                  {socialLinks.length > 0 ? (
                    <div className="rounded-3xl border border-ink-200/70 bg-white p-6 md:p-7">
                      <SectionEyebrow>{t('follow')}</SectionEyebrow>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {socialLinks.map((s) => (
                          <a
                            key={s.name}
                            href={s.href}
                            aria-label={`${company.shortName} on ${s.name}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                          >
                            <Icon name={s.icon as never} className="h-4 w-4" />
                            {s.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-3xl border border-ink-200/70 bg-ink-950 p-6 md:p-7 text-white">
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-300">
                      {t('internationalEyebrow')}
                    </span>
                    <h3 className="mt-3 font-display text-xl tracking-tight">
                      {t('internationalTitle')}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      {t('internationalBody', { company: company.name })}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80">
                        <Icon name="globe" className="h-3 w-3" />
                        {t('tagAsync')}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80">
                        <Icon name="users" className="h-3 w-3" />
                        {t('tagSenior')}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80">
                        <Icon name="shield" className="h-3 w-3" />
                        {t('tagPrivacy')}
                      </span>
                    </div>
                    <a
                      href={`mailto:${company.contact.email}`}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-accent-200"
                    >
                      {t('emailDirect', { company: company.name })}
                      <Icon name="arrow-up-right" className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('engagementEyebrow', { company: company.name })}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('engagementTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {t('engagementLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { titleKey: 'step1Title', descKey: 'step1Desc' },
              { titleKey: 'step2Title', descKey: 'step2Desc' },
              { titleKey: 'step3Title', descKey: 'step3Desc' },
            ].map((c, i) => (
              <Reveal
                key={c.titleKey}
                delay={(i % 3) * 50}
                className="rounded-2xl border border-ink-200/70 bg-white p-7"
              >
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

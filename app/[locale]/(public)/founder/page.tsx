import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { FounderImage } from '@/components/ui/brand-image';
import { ContactChip } from '@/components/ui/contact-chip';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedLeadership } from '@/lib/supabase/public';
import { renderRichText } from '@/lib/utils/rich-text';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const locale = (isLocale(params.locale) ? params.locale : 'en') as Locale;
  const settings = await ensureCompanySettings();
  const leaders = await fetchPublishedLeadership(locale);
  const primary = leaders[0];
  const name = primary?.name ?? 'Leadership';
  const role = primary?.position ?? 'Leadership';
  return {
    title: settings?.site_title ?? `${name} — ${company.name}`,
    description:
      settings?.meta_description ??
      `Meet ${name}, ${role} of ${company.name}.`,
  };
}

export default async function FounderPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('founder');

  await ensureCompanySettings();
  const leaders = await fetchPublishedLeadership(locale);

  // No published leadership rows → 404 the page so unpublishing hides it
  // completely from search engines and direct visitors.
  if (leaders.length === 0) {
    notFound();
  }

  const primary = leaders[0];
  const focus = primary.professional_focus ?? [];
  const photo = primary.image_url ?? null;
  const email = primary.email ?? company.contact.email;
  const location = primary.location ?? company.contact.location;
  const shortBio = primary.short_bio;
  const fullBio = primary.full_bio;
  const firstName = primary.name.split(' ')[0];

  const focusIcon = (label: string): 'code' | 'ai' | 'saas' | 'rocket' | 'cloud' | 'briefcase' => {
    const k = label.toLowerCase();
    if (k.includes('ai') || k.includes('machine learning')) return 'ai';
    if (k.includes('saas')) return 'saas';
    if (k.includes('cloud') || k.includes('platform')) return 'cloud';
    if (k.includes('full stack') || k.includes('web') || k.includes('mobile')) return 'code';
    if (k.includes('strategy') || k.includes('architect')) return 'briefcase';
    return 'rocket';
  };

  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('heroTitle', { company: company.name })}
        subtitle={t('heroSubtitle', { company: company.name, name: primary.name, role: primary.position, year: company.foundedYear })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('pageEyebrow') }]}
      />

      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-gradient-to-br from-ink-100 to-white p-10">
                  <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,17,21,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,17,21,0.06)_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden />
                  <div className="relative flex flex-col items-start">
                    <FounderImage
                      size="lg"
                      rounded="full"
                      priority
                      className="shadow-soft"
                      alt={primary.image_alt ?? `${primary.name} — ${primary.position} of ${company.name}`}
                      src={photo}
                      objectPosition={primary.image_focus}
                      companyName={company.name}
                    />
                    <div className="mt-6">
                      <div className="font-display text-2xl tracking-tight">{primary.name}</div>
                      <div className="text-sm text-ink-600">{primary.position}, {company.name}</div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="mt-6 rounded-3xl border border-ink-200/70 bg-white p-6">
                  <SectionEyebrow>{t('profileEyebrow')}</SectionEyebrow>
                  <dl className="mt-5 space-y-4 text-sm">
                    <ProfileRow label={t('profileRole')} value={primary.position} />
                    <ProfileRow label={t('profileCompany')} value={company.name} />
                    <ProfileRow label={t('profileLocation')} value={location} />
                    {primary.education ? (
                      <ProfileRow
                        label={t('profileEducation')}
                        value={
                          primary.university
                            ? t('profileEducationWithUniversity', { degree: primary.education, university: primary.university })
                            : t('profileEducationOngoing', { degree: primary.education })
                        }
                      />
                    ) : null}
                  </dl>

                  <div className="mt-6 border-t border-ink-200/70 pt-5">
                    <SectionEyebrow>{t('connectEyebrow')}</SectionEyebrow>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {primary.email ? (
                        <ContactChip
                          href={`mailto:${primary.email}`}
                          icon="mail"
                          label="Email"
                        />
                      ) : null}
                      {primary.phone ? (
                        <ContactChip
                          href={`tel:${primary.phone}`}
                          icon="phone"
                          label={primary.phone}
                        />
                      ) : null}
                      {primary.linkedin_url ? (
                        <ContactChip
                          href={primary.linkedin_url}
                          icon="linkedin"
                          label="LinkedIn"
                          external
                        />
                      ) : null}
                      {primary.github_url ? (
                        <ContactChip
                          href={primary.github_url}
                          icon="github"
                          label="GitHub"
                          external
                        />
                      ) : null}
                    </div>
                  </div>

                  <Button
                    href={`mailto:${email}?subject=${encodeURIComponent(t('inquirySubject', { company: company.name }))}`}
                    className="mt-6 w-full"
                    variant="primary"
                    size="lg"
                  >
                    {t('connectButton', { firstName })}
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal>
                <SectionEyebrow>{t('biographyEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">{t('biographyTitle')}</SectionTitle>
                <div className="mt-6 text-base md:text-lg leading-relaxed text-ink-600">
                  {renderRichText(fullBio ?? shortBio ?? null)}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {focus.length > 0 ? (
        <Section tone="muted">
          <Container size="xl">
            <Reveal className="max-w-2xl">
              <SectionEyebrow>{t('focusEyebrow')}</SectionEyebrow>
              <SectionTitle className="mt-4">{t('focusTitle')}</SectionTitle>
              <SectionLead className="mt-5">
                {t('focusLead', { name: primary.name, company: company.name })}
              </SectionLead>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {focus.map((title, i) => (
                <Reveal
                  key={title}
                  delay={(i % 3) * 50}
                  className="rounded-2xl border border-ink-200/70 bg-white p-7"
                >
                  <IconBoxLite name={focusIcon(title)} />
                  <h3 className="mt-5 font-display text-lg tracking-tight">{title}</h3>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow>{t('philosophyEyebrow')}</SectionEyebrow>
              <SectionTitle className="mt-4">{t('philosophyTitle', { company: company.name })}</SectionTitle>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-600">
                <p>{t('philosophyParagraph1')}</p>
                <p>{t('philosophyParagraph2')}</p>
                <p>{t('philosophyParagraph3')}</p>
              </div>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-5">
              <div className="rounded-3xl border border-ink-200/70 bg-white p-8">
                <SectionEyebrow>{t('recognitionEyebrow')}</SectionEyebrow>
                <p className="mt-4 text-base leading-relaxed text-ink-600">
                  {t('recognitionBody', { name: primary.name })}
                  <Link href="/about" className="font-medium text-ink-900 underline-offset-4 hover:underline">
                    {t('recognitionAboutLink')}
                  </Link>
                  {t('recognitionBodySuffix')}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="overflow-hidden rounded-3xl border border-ink-200/70 bg-ink-950 px-8 py-16 md:px-16 md:py-20">
            <div className="relative isolate">
              <div className="absolute -top-20 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent-500/20 blur-[100px]" aria-hidden />
              <div className="mx-auto max-w-3xl text-center">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-300">
                  {t('quoteEyebrow')}
                </span>
                <blockquote className="mt-5 font-display text-2xl md:text-3xl tracking-tight text-white text-balance">
                  &ldquo;{t('quote')}&rdquo;
                </blockquote>
                <div className="mt-6 text-sm text-white/60">{t('quoteAttribution', { name: primary.name, role: primary.position, company: company.name })}</div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="default">
        <Container size="xl">
          <Reveal className="overflow-hidden rounded-3xl border border-accent-200 bg-gradient-to-br from-accent-50 via-white to-white p-8 md:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                  {t('buildEyebrow')}
                </span>
                <h2 className="mt-3 font-display text-2xl md:text-3xl tracking-tight text-balance">
                  {t('buildTitle', { shortName: company.shortName })}
                </h2>
                <p className="mt-3 text-sm text-ink-600">
                  {t('buildBody')}
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
                <Button href="/contact" variant="primary" size="lg">
                  {t('buildStartButton')}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
                <Link
                  href={`mailto:${company.contact.email}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-accent-600"
                >
                  <Icon name="mail" className="h-4 w-4" />
                  {company.contact.email}
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink-900">{value}</dd>
    </div>
  );
}

function IconBoxLite({ name }: { name: 'code' | 'ai' | 'saas' | 'rocket' | 'cloud' | 'briefcase' }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-200">
      <Icon name={name} className="h-5 w-5" />
    </span>
  );
}
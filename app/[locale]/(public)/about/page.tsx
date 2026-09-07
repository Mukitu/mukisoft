import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { IconBox } from '@/components/ui/icon-box';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FounderImage } from '@/components/ui/brand-image';
import { ContactChip } from '@/components/ui/contact-chip';
import {
  company,
  DOMAIN,
  COPYRIGHT_RANGE,
  companyHistory,
} from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedAbout, fetchPublishedLeadership } from '@/lib/supabase/public';
import { renderRichText } from '@/lib/utils/rich-text';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { applyTranslations, applyJsonTranslation } from '@/lib/i18n/apply-translations';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const locale = (isLocale(params.locale) ? params.locale : 'en') as Locale;
  const settings = await ensureCompanySettings();
  const about = await fetchPublishedAbout(locale);
  const t = await getTranslations('about');
  return {
    title: about?.seo_title ?? settings?.site_title ?? t('title'),
    description:
      about?.seo_description ??
      settings?.meta_description ??
      t('lead'),
  };
}

type AboutIcon = 'code' | 'web' | 'mobile' | 'ai' | 'saas' | 'design' | 'rocket' | 'cloud' | 'shield' | 'sparkles' | 'briefcase' | 'lightbulb';

function asIcon(value: unknown, fallback: AboutIcon = 'sparkles'): AboutIcon {
  const allowed: AboutIcon[] = ['code', 'web', 'mobile', 'ai', 'saas', 'design', 'rocket', 'cloud', 'shield', 'sparkles', 'briefcase', 'lightbulb'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as AboutIcon) : fallback;
}

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale: Locale = params.locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('about');
  const tCommon = await getTranslations('common');

  const [about, leaders, settings] = await Promise.all([
    fetchPublishedAbout(locale),
    fetchPublishedLeadership(locale),
    ensureCompanySettings(),
  ]);
  const [aboutLocalized, leadersLocalized] = await Promise.all([
    about
      ? applyTranslations([about], 'about_page', locale).then((r) => r[0])
      : Promise.resolve(about),
    applyTranslations(leaders, 'leadership_member', locale),
  ]);
  const founder = leadersLocalized[0] ?? null;
  const values = Array.isArray(aboutLocalized?.values)
    ? (aboutLocalized!.values as Array<Record<string, unknown>>)
    : [];
  const capabilities = Array.isArray(aboutLocalized?.capabilities)
    ? (aboutLocalized!.capabilities as Array<Record<string, unknown>>)
    : [];
  return (
    <>
      <PageHeader
        eyebrow={about?.subtitle ?? `About ${company.shortName}`}
        title={about?.title ?? t('heroTitle')}
        subtitle={about?.hero_description ?? t('heroSubtitle', { company: company.name, year: company.foundedYear, location: company.contact.location })}
        crumbs={[{ label: tCommon('home'), href: '/' }, { label: t('pageEyebrow') }]}
      />

      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <SectionEyebrow>{about?.who_we_are_title ?? t('whoWeAreEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">
                  {t('whoWeAreTitle')}
                </SectionTitle>
              </Reveal>
              <Reveal delay={80}>
                <div className="mt-6 text-base leading-relaxed text-ink-600">
                  {about?.who_we_are_content ? (
                    renderRichText(about.who_we_are_content)
                  ) : (
                    <div className="space-y-5">
                      <p>
                        {t('whoWeAreParagraph1', { company: company.name, year: company.foundedYear, location: company.contact.location })}
                      </p>
                      <p>
                        {t('whoWeAreParagraph2')}
                      </p>
                      <p>
                        {t('whoWeAreParagraph3')}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <div className="rounded-3xl border border-ink-200/70 bg-white p-8">
                  <h3 className="font-display text-2xl tracking-tight">{t('atAGlanceTitle', { company: company.name })}</h3>
                  <dl className="mt-6 divide-y divide-ink-200/70">
                    <Definition label={t('glanceCompany')} value={company.legalName} />
                    <Definition label={t('glanceHeadquarters')} value={company.contact.location} />
                    <Definition label={t('glanceFounded')} value={String(company.foundedYear)} />
                    <Definition label={t('glanceWebsite')} value={DOMAIN} />
                    <Definition label={t('glanceOperatingModel')} value={t('operatingModelValue')} />
                    <Definition label={t('glanceWorkingLanguage')} value={t('workingLanguageValue')} />
                  </dl>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href="/contact" variant="primary" size="md">
                      {t('startProjectButton')}
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </Button>
                    <Button href="/founder" variant="outline" size="md">
                      {t('leadershipButton')}
                    </Button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-3xl">
            <SectionEyebrow>{t('storyEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">
              {t('storyTitle')}
            </SectionTitle>
            <SectionLead className="mt-5">
              {t('storyLead', { company: company.name, year: company.foundedYear })}
            </SectionLead>
          </Reveal>

          <ol className="mt-14 space-y-10">
            {companyHistory.map((m, idx) => (
              <Reveal
                key={m.year}
                delay={(idx % 4) * 60}
                className="relative grid gap-6 rounded-3xl border border-ink-200/70 bg-white p-8 md:grid-cols-12 md:gap-10 md:p-10"
              >
                <div className="md:col-span-3">
                  <div className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                    {t('phaseLabel', { phase: String(idx + 1).padStart(2, '0') })}
                  </div>
                  <div className="mt-2 font-display text-2xl tracking-tight text-ink-900">{m.year}</div>
                </div>
                <div className="md:col-span-9">
                  <h3 className="font-display text-xl tracking-tight text-ink-900">{m.title}</h3>
                  <p className="mt-3 text-sm md:text-base leading-relaxed text-ink-600">{m.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-10 md:grid-cols-2">
            <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-8 md:p-10">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                {t('missionEyebrow')}
              </span>
              <h2 className="mt-3 font-display text-2xl md:text-3xl tracking-tight text-balance">
                {about?.mission ??
                  t('missionDefault')}
              </h2>
            </Reveal>
            <Reveal delay={80} className="rounded-3xl border border-ink-200/70 bg-white p-8 md:p-10">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                {t('visionEyebrow')}
              </span>
              <h2 className="mt-3 font-display text-2xl md:text-3xl tracking-tight text-balance">
                {about?.vision ??
                  t('visionDefault')}
              </h2>
            </Reveal>
          </div>
        </Container>
      </Section>

      {values.length > 0 ? (
        <Section tone="muted">
          <Container size="xl">
            <Reveal className="max-w-3xl">
              <SectionEyebrow>{t('valuesEyebrow')}</SectionEyebrow>
              <SectionTitle className="mt-4">
                {t('valuesTitle')}
              </SectionTitle>
              <SectionLead className="mt-5">
                {t('valuesLead', { company: company.name })}
              </SectionLead>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <Reveal
                  key={`${String(v.title ?? i)}-${i}`}
                  delay={(i % 3) * 50}
                  className="rounded-2xl border border-ink-200/70 bg-white p-7"
                >
                  <IconBox name={asIcon(v.icon)} tone="accent" />
                  <h3 className="mt-5 font-display text-lg tracking-tight">
                    {typeof v.title === 'string' ? v.title : t('valueFallback')}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {typeof v.description === 'string' ? v.description : ''}
                  </p>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {capabilities.length > 0 ? (
        <Section tone="default">
          <Container size="xl">
            <Reveal className="max-w-3xl">
              <SectionEyebrow>{t('capabilitiesEyebrow')}</SectionEyebrow>
              <SectionTitle className="mt-4">
                {t('capabilitiesTitle')}
              </SectionTitle>
              <SectionLead className="mt-5">
                {t('capabilitiesLead', { company: company.name })}
              </SectionLead>
            </Reveal>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((c, i) => (
                <Reveal
                  key={`${String(c.title ?? i)}-${i}`}
                  delay={(i % 3) * 50}
                  className="rounded-2xl border border-ink-200/70 bg-white p-7"
                >
                  <IconBox name={asIcon(c.icon, 'code')} tone="accent" />
                  <h3 className="mt-4 font-display text-lg tracking-tight">
                    {typeof c.title === 'string' ? c.title : t('capabilityFallback')}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {typeof c.description === 'string' ? c.description : ''}
                  </p>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('approachEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">
              {t('approachTitle')}
            </SectionTitle>
            <SectionLead className="mt-5">
              {t('approachLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                titleKey: 'principleClarityTitle',
                descKey: 'principleClarityDesc',
              },
              {
                titleKey: 'principleUsabilityTitle',
                descKey: 'principleUsabilityDesc',
              },
              {
                titleKey: 'principleMaintainabilityTitle',
                descKey: 'principleMaintainabilityDesc',
              },
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

      <Section tone="muted">
        <Container size="xl">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow>{t('leadershipEyebrow')}</SectionEyebrow>
              <SectionTitle className="mt-4">
                {t('leadershipTitle', { company: company.name })}
              </SectionTitle>
              <SectionLead className="mt-5">
                {founder
                  ? (founder.short_bio ?? founder.full_bio ?? t('leadershipBioFallback'))
                  : t('leadershipPending')}
              </SectionLead>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/founder" variant="primary">
                  {t('leadershipReadButton')}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
                <Button href="/contact" variant="outline">
                  {t('leadershipDiscussButton')}
                </Button>
              </div>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-5">
              <div className="rounded-3xl border border-ink-200/70 bg-white p-8">
                {founder ? (
                  <>
                    <FounderImage
                      size="md"
                      rounded="2xl"
                      priority
                      className="mb-6"
                      alt={founder.image_alt ?? `${founder.name} — ${founder.position} of ${company.name}`}
                      src={founder.image_url ?? undefined}
                      objectPosition={founder.image_focus}
                      companyName={company.name}
                    />
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                      {t('leadershipPosition', { position: founder.position, company: company.name })}
                    </span>
                    <h3 className="mt-2 font-display text-2xl tracking-tight">{founder.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">
                      {founder.short_bio ?? founder.full_bio ?? ''}
                    </p>
                    <div className="mt-5 border-t border-ink-200/70 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {founder.email ? (
                          <ContactChip
                            href={`mailto:${founder.email}`}
                            icon="mail"
                            label="Email"
                          />
                        ) : null}
                        {founder.phone ? (
                          <ContactChip
                            href={`tel:${founder.phone}`}
                            icon="phone"
                            label={founder.phone}
                          />
                        ) : null}
                        {founder.linkedin_url ? (
                          <ContactChip
                            href={founder.linkedin_url}
                            icon="linkedin"
                            label="LinkedIn"
                            external
                          />
                        ) : null}
                        {founder.github_url ? (
                          <ContactChip
                            href={founder.github_url}
                            icon="github"
                            label="GitHub"
                            external
                          />
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-100 to-white text-2xl font-display tracking-tight text-ink-700 ring-1 ring-ink-200">
                      MS
                    </div>
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                      {t('leadershipBadge')}
                    </span>
                    <h3 className="mt-2 font-display text-2xl tracking-tight">{t('leadershipPlaceholderName')}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">
                      {t('leadershipPlaceholderBody')}
                    </p>
                    <div className="mt-5 border-t border-ink-200/70 pt-4">
                      <Link
                        href={`mailto:${company.contact.email}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
                      >
                        <Icon name="mail" className="h-4 w-4" />
                        {company.contact.email}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm font-medium text-ink-900 text-right">{value}</dd>
    </div>
  );
}

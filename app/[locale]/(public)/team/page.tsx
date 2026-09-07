import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { IconBox } from '@/components/ui/icon-box';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedTeam, fetchPublishedLeadership } from '@/lib/supabase/public';
import { TeamAvatar, FounderImage } from '@/components/ui/brand-image';
import { ContactChip } from '@/components/ui/contact-chip';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  await ensureCompanySettings();
  return {
    title: 'Team',
    description: `People behind the technology at ${company.name} — the engineering capability, practices and accountability that power every ${company.name} engagement.`,
  };
}

const capabilityKeys = [
  { icon: 'rocket' as const, titleKey: 'capabilityEngineeringTitle', descKey: 'capabilityEngineeringDesc' },
  { icon: 'code' as const, titleKey: 'capabilityProductTitle', descKey: 'capabilityProductDesc' },
  { icon: 'design' as const, titleKey: 'capabilityDesignTitle', descKey: 'capabilityDesignDesc' },
  { icon: 'ai' as const, titleKey: 'capabilityAiTitle', descKey: 'capabilityAiDesc' },
  { icon: 'cloud' as const, titleKey: 'capabilityCloudTitle', descKey: 'capabilityCloudDesc' },
  { icon: 'shield' as const, titleKey: 'capabilityQualityTitle', descKey: 'capabilityQualityDesc' },
];

export default async function TeamPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('team');

  const [teamMembers, leaders] = await Promise.all([
    fetchPublishedTeam(locale),
    fetchPublishedLeadership(locale),
  ]);
  const visibleMembers = [...leaders, ...teamMembers.filter((m) => !leaders.some((l) => l.name === m.name))];
  const founder = leaders[0];
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
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <SectionEyebrow>{t('leadershipEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">
                  {t('leadershipTitle')}
                </SectionTitle>
              </Reveal>
              <Reveal delay={80}>
                <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-600">
                  <p>
                    {founder ? (
                      <>
                        {t('leadershipFounderParagraph', { company: company.name, name: founder.name, position: founder.position })}
                      </>
                    ) : (
                      <>
                        {t('leadershipGenericParagraph', { company: company.name })}
                      </>
                    )}
                  </p>
                  <p>
                    {t('leadershipFollowup', { company: company.name })}
                  </p>
                  <p>
                    {t('leadershipFuture')}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <div className="rounded-3xl border border-ink-200/70 bg-white p-8">
                  {founder ? (
                    <>
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                        {founder.position}
                      </span>
                      <h3 className="mt-5 font-display text-xl tracking-tight">{founder.name}</h3>
                      {(founder.short_bio ?? founder.full_bio) ? (
                        <p className="mt-5 text-sm leading-relaxed text-ink-600">
                          {founder.short_bio ?? founder.full_bio}
                        </p>
                      ) : null}
                      <div className="mt-6 border-t border-ink-200/70 pt-5">
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
                      <Button href="/founder" variant="outline" className="mt-5 w-full">
                        {t('readLeadershipProfile')}
                        <Icon name="arrow-right" className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                        {t('leadershipBadge')}
                      </span>
                      <h3 className="mt-5 font-display text-xl tracking-tight">{t('leadershipPlaceholderName')}</h3>
                      <p className="mt-5 text-sm leading-relaxed text-ink-600">
                        {t('leadershipPlaceholderBody')}
                      </p>
                      <div className="mt-6 border-t border-ink-200/70 pt-5">
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
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('capabilityEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('capabilityTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {t('capabilityLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {capabilityKeys.map((c, i) => (
              <Reveal
                key={c.titleKey}
                delay={(i % 3) * 50}
                className="rounded-2xl border border-ink-200/70 bg-white p-7"
              >
                <IconBox name={c.icon} tone="accent" />
                <h3 className="mt-5 font-display text-lg tracking-tight">{t(c.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t(c.descKey)}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-7">
              <SectionEyebrow>{t('founderPhotoEyebrow')}</SectionEyebrow>
              <SectionTitle className="mt-4">{t('founderPhotoTitle')}</SectionTitle>
              <SectionLead className="mt-5">
                {t('founderPhotoLead', { company: company.name })}
              </SectionLead>
              {founder ? (
                <p className="mt-6 font-display text-xl tracking-tight text-ink-900">
                  {founder.name}
                  <span className="ml-3 text-base font-normal text-ink-500">
                    — {t('founderPhotoAlt', { name: founder.name })}
                  </span>
                </p>
              ) : null}
            </Reveal>

            <Reveal delay={120} className="lg:col-span-5">
              <figure className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-white shadow-sm">
                <div className="flex items-center justify-center bg-gradient-to-br from-accent-50 via-white to-ink-50 p-8">
                  {founder ? (
                    <FounderImage
                      src={founder.image_url ?? null}
                      companyName={founder.name}
                      alt={t('founderPhotoAlt', { name: founder.name })}
                      size="xl"
                      rounded="2xl"
                      objectPosition={founder.image_focus ?? 'center top'}
                    />
                  ) : (
                    <FounderImage
                      companyName={company.name}
                      alt={company.name}
                      size="xl"
                      rounded="2xl"
                    />
                  )}
                </div>
                {founder ? (
                  <figcaption className="flex items-center justify-between gap-4 border-t border-ink-200/70 bg-white px-6 py-4">
                    <div>
                      <p className="font-display text-base tracking-tight text-ink-900">
                        {founder.name}
                      </p>
                      <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-500">
                        {founder.position}
                      </p>
                    </div>
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="default">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('peopleEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('peopleTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {visibleMembers.length === 0
                ? t('peopleLeadEmpty')
                : t('peopleLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          {visibleMembers.length === 0 ? (
            <Reveal className="mt-10 rounded-2xl border border-ink-200/70 bg-white p-8 text-center">
              <p className="text-base text-ink-600">
                {t('peopleEmptyBody')}
              </p>
            </Reveal>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleMembers.map((m, i) => {
                const memberRole =
                  'role' in m && m.role
                    ? m.role
                    : 'position' in m && (m as { position?: string }).position
                      ? (m as { position?: string }).position ?? ''
                      : '';
                const memberBio =
                  'bio' in m && typeof (m as { bio?: string | null }).bio === 'string'
                    ? (m as { bio?: string | null }).bio
                    : 'short_bio' in m && typeof (m as { short_bio?: string | null }).short_bio === 'string'
                      ? (m as { short_bio?: string | null }).short_bio
                      : null;
                return (
                  <Reveal
                    key={m.id}
                    delay={(i % 3) * 50}
                    className="flex flex-col rounded-2xl border border-ink-200/70 bg-white p-7"
                  >
                    <TeamAvatar
                      name={m.name}
                      image={m.image_url ?? undefined}
                      size="lg"
                      objectPosition={m.image_focus ?? 'center top'}
                    />
                    <h3 className="mt-5 font-display text-lg tracking-tight">{m.name}</h3>
                    <p className="text-sm text-ink-600">{memberRole}</p>
                    {memberBio ? (
                      <p className="mt-3 text-sm leading-relaxed text-ink-600">{memberBio}</p>
                    ) : null}
                    {m.email && 'role' in m ? (
                      <Link
                        href={`mailto:${m.email}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
                      >
                        <Icon name="mail" className="h-4 w-4" />
                        {m.email}
                      </Link>
                    ) : null}
                    {(m.linkedin_url || m.github_url || ('x_url' in m && m.x_url)) ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.linkedin_url ? (
                          <ContactChip
                            href={m.linkedin_url}
                            icon="linkedin"
                            label="LinkedIn"
                            external
                          />
                        ) : null}
                        {m.github_url ? (
                          <ContactChip
                            href={m.github_url}
                            icon="github"
                            label="GitHub"
                            external
                          />
                        ) : null}
                        {'x_url' in m && m.x_url ? (
                          <ContactChip
                            href={m.x_url}
                            icon="x"
                            label="X"
                            external
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </Section>

      <Section tone="default">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('operateEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('operateTitle')}</SectionTitle>
            <p className="mt-5 text-base leading-relaxed text-ink-600">
              {t('operateBody')}
              <Link href="/about" className="font-medium text-ink-900 underline-offset-4 hover:underline">
                {t('operateAboutLink')}
              </Link>
              {t('operateBodySuffix')}
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <SectionEyebrow>{t('workWithEyebrow', { company: company.name })}</SectionEyebrow>
                <SectionTitle className="mt-3">
                  {t('workWithTitle')}
                </SectionTitle>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
                  {t('workWithBody', { company: company.name })}
                </p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <Button href="/contact" size="lg" variant="primary">
                  {t('workWithButton')}
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
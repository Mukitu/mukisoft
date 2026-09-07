import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedTeam, fetchPublishedLeadership } from '@/lib/supabase/public';
import { TeamAvatar } from '@/components/ui/brand-image';

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

  // Leadership always renders FIRST. De-dupe members that already appear
  // in the leadership row so we don't show the same person twice in the
  // members grid below. We dedupe on name only because TeamMember has
  // `role` while Leadership has `position` — names are the canonical key.
  const leaderNames = new Set(leaders.map((l) => l.name.trim().toLowerCase()));
  const otherMembers = teamMembers.filter((m) => !leaderNames.has(m.name.trim().toLowerCase()));
  const allMembers = [...leaders, ...otherMembers];

  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle', { company: company.name })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('pageEyebrow') }]}
      />

      {/*
        Section 1 — Leadership
        Single horizontal row of compact leadership cards so the
        senior team is visually front-and-centre. Each card opens the
        founder/leadership profile; the founder card uses the "View
        profile" CTA, the rest of leadership use the chip-strip below.
      */}
      {leaders.length > 0 ? (
        <Section tone="default">
          <Container size="xl">
            <Reveal className="max-w-2xl">
              <SectionEyebrow>{t('leadershipEyebrow')}</SectionEyebrow>
              <SectionTitle className="mt-4">{t('leadershipTitle')}</SectionTitle>
              <SectionLead className="mt-5">
                {t('leadershipFollowup', { company: company.name })}
              </SectionLead>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {leaders.map((leader, i) => (
                <Reveal
                  key={leader.id}
                  delay={(i % 3) * 50}
                  className="group flex flex-col rounded-2xl border border-ink-200/70 bg-white p-7 transition-colors hover:border-accent-300"
                >
                  <div className="flex items-start gap-4">
                    <TeamAvatar
                      name={leader.name}
                      image={leader.image_url ?? undefined}
                      size="lg"
                      objectPosition={leader.image_focus ?? 'center top'}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-700 ring-1 ring-inset ring-accent-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                        {t('leadershipEyebrow')}
                      </span>
                      <h3 className="mt-3 truncate font-display text-lg tracking-tight">
                        {leader.name}
                      </h3>
                      <p className="truncate text-sm text-ink-600">{leader.position}</p>
                    </div>
                  </div>
                  {leader.short_bio ?? leader.full_bio ? (
                    <p className="mt-5 text-sm leading-relaxed text-ink-600 line-clamp-3">
                      {leader.short_bio ?? leader.full_bio}
                    </p>
                  ) : null}
                  <Button
                    href="/founder"
                    variant="outline"
                    size="sm"
                    className="mt-5 self-start"
                  >
                    {t('viewProfile')}
                    <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
                  </Button>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/*
        Section 2 — Everyone
        ALL published team members render here as a uniform grid.
        Leadership is already shown above, so this section is purely
        the wider engineering / operations / design team. The grid
        is dense and member-focused — no extra marketing copy.
      */}
      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('peopleEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('peopleTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {allMembers.length === 0
                ? t('peopleLeadEmpty')
                : t('peopleLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          {allMembers.length === 0 ? (
            <Reveal className="mt-10 rounded-2xl border border-ink-200/70 bg-white p-8 text-center">
              <p className="text-base text-ink-600">{t('peopleEmptyBody')}</p>
            </Reveal>
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {allMembers.map((m, i) => {
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
                    delay={(i % 4) * 40}
                    className="flex flex-col rounded-2xl border border-ink-200/70 bg-white p-6"
                  >
                    <TeamAvatar
                      name={m.name}
                      image={m.image_url ?? undefined}
                      size="md"
                      objectPosition={m.image_focus ?? 'center top'}
                    />
                    <h3 className="mt-4 truncate font-display text-base tracking-tight">
                      {m.name}
                    </h3>
                    <p className="truncate text-xs text-ink-600">{memberRole}</p>
                    {memberBio ? (
                      <p className="mt-3 text-sm leading-relaxed text-ink-600 line-clamp-2">
                        {memberBio}
                      </p>
                    ) : null}
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </Section>

      {/*
        Section 3 — Closing CTA
        A single, focused call-to-action so the page ends with one
        clear next step.
      */}
      <Section tone="default">
        <Container size="xl">
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <SectionEyebrow>
                  {t('workWithEyebrow', { company: company.name })}
                </SectionEyebrow>
                <SectionTitle className="mt-3">{t('workWithTitle')}</SectionTitle>
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
import type { Metadata } from 'next';
import Link from 'next/link';
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
import { fetchPublishedTeam } from '@/lib/supabase/public';
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

  // Only render the team_members grid. The leadership section used to
  // live above this grid but was removed in favour of a single,
  // member-focused roster.
  const teamMembers = await fetchPublishedTeam(locale);

  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle', { company: company.name })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('pageEyebrow') }]}
      />

      {/*
        Section — The team
        All published team members render here as a uniform grid.
        No leadership section above, no marketing copy — just the
        roster.
      */}
      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('peopleEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('peopleTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {teamMembers.length === 0
                ? t('peopleLeadEmpty')
                : t('peopleLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          {teamMembers.length === 0 ? (
            <Reveal className="mt-10 rounded-2xl border border-ink-200/70 bg-white p-8 text-center">
              <p className="text-base text-ink-600">{t('peopleEmptyBody')}</p>
            </Reveal>
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {teamMembers.map((m, i) => (
                <Reveal
                  key={m.id}
                  delay={(i % 4) * 40}
                  className="group flex flex-col rounded-2xl border border-ink-200/70 bg-white p-6 transition-colors hover:border-accent-300"
                >
                  <Link href={`/team/${m.id}`} className="flex flex-col">
                    <TeamAvatar
                      name={m.name}
                      image={m.image_url ?? undefined}
                      size="md"
                      objectPosition={m.image_focus ?? 'center top'}
                    />
                    <h3 className="mt-4 truncate font-display text-base tracking-tight group-hover:text-accent-700">
                      {m.name}
                    </h3>
                    <p className="truncate text-xs text-ink-600">{m.role}</p>
                    {m.bio ? (
                      <p className="mt-3 text-sm leading-relaxed text-ink-600 line-clamp-2">
                        {m.bio}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent-700">
                      {t('viewProfile')}
                      <Icon name="arrow-up-right" className="h-3 w-3" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/*
        Section — Closing CTA
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
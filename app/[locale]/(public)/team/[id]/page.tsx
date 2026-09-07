import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedTeamMember, fetchPublishedTeam } from '@/lib/supabase/public';
import { TeamAvatar } from '@/components/ui/brand-image';

type Params = { id: string; locale: string };

export const revalidate = 60;

/**
 * Pre-render the detail pages for every published team member at
 * build time. Next.js will use this list to statically generate the
 * `[id]` routes; any new member published later gets picked up on
 * the next ISR regeneration (60 s).
 */
export async function generateStaticParams() {
  const members = await fetchPublishedTeam('en');
  return members.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const locale = (isLocale(params.locale) ? params.locale : 'en') as Locale;
  const member = await fetchPublishedTeamMember(params.id, locale);
  const t = await getTranslations('teamDetail');
  if (!member) {
    return {
      title: t('notFoundTitle'),
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${member.name} — ${member.role} · ${company.name}`,
    description:
      member.bio ??
      `${member.name} works as ${member.role} at ${company.name}.`,
  };
}

export default async function TeamMemberPage({ params }: { params: Params }) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('teamDetail');
  await ensureCompanySettings();
  const member = await fetchPublishedTeamMember(params.id, locale);
  if (!member) notFound();

  return (
    <>
      <PageHeader
        eyebrow={member.department ?? company.name}
        title={member.name}
        subtitle={`${member.role}${member.department ? ` · ${member.department}` : ''}`}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: t('crumbTeam'), href: '/team' },
          { label: member.name },
        ]}
      />

      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            <Reveal className="md:col-span-4">
              <div className="rounded-3xl border border-ink-200/70 bg-white p-6">
                <TeamAvatar
                  name={member.name}
                  image={member.image_url ?? undefined}
                  size="lg"
                  className="!h-32 !w-32 mx-auto"
                  objectPosition={member.image_focus ?? 'center top'}
                />
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-ink-500">{t('departmentLabel')}</dt>
                    <dd className="font-medium text-ink-900">
                      {member.department ?? '—'}
                    </dd>
                  </div>
                  {member.email ? (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-ink-500">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${member.email}`}
                          className="font-medium text-accent-700 underline-offset-2 hover:underline"
                        >
                          {member.email}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-6 flex flex-wrap gap-2">
                  {member.linkedin_url ? (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink-200/70 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-accent-300 hover:text-accent-700"
                    >
                      LinkedIn
                      <Icon name="arrow-up-right" className="h-3 w-3" />
                    </a>
                  ) : null}
                  {member.github_url ? (
                    <a
                      href={member.github_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink-200/70 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-accent-300 hover:text-accent-700"
                    >
                      GitHub
                      <Icon name="arrow-up-right" className="h-3 w-3" />
                    </a>
                  ) : null}
                  {member.x_url ? (
                    <a
                      href={member.x_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink-200/70 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-accent-300 hover:text-accent-700"
                    >
                      X
                      <Icon name="arrow-up-right" className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              </div>
            </Reveal>

            <Reveal className="md:col-span-8" delay={100}>
              {member.bio ? (
                <article className="prose prose-ink max-w-none">
                  <p className="text-lg leading-relaxed text-ink-700">{member.bio}</p>
                </article>
              ) : (
                <p className="text-base text-ink-600">
                  {member.name} works as {member.role} at {company.name}.
                </p>
              )}

              <div className="mt-10">
                <Link
                  href="/team"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 hover:underline"
                >
                  {t('backToTeam')}
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <SectionEyebrow>{t('contactEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-3">
                  {t('connectHeading', { name: member.name.split(' ')[0] || member.name })}
                </SectionTitle>
              </div>
              <div className="md:col-span-4 md:text-right">
                {member.email ? (
                  <Button href={`mailto:${member.email}`} size="lg" variant="primary">
                    {t('emailButton', { name: member.name.split(' ')[0] || member.name })}
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button href="/contact" size="lg" variant="primary">
                    Discuss your project
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { fetchPortfolioBySlug } from '@/lib/supabase/public';
import { renderRichText } from '@/lib/utils/rich-text';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';

type Params = { slug: string; locale: string };

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const locale = (isLocale(params.locale) ? params.locale : 'en') as Locale;
  const project = await fetchPortfolioBySlug(params.slug, locale);
  const t = await getTranslations('portfolioDetail');
  if (!project) return { title: t('notFoundTitle'), robots: { index: false, follow: false } };
  return {
    title: project.title,
    description: project.short_description ?? project.description ?? '',
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('portfolioDetail');
  await ensureCompanySettings();
  const project = await fetchPortfolioBySlug(params.slug, locale);
  if (!project) notFound();

  const techs = project.technology ?? [];
  const outcomes = project.outcome ?? [];

  return (
    <>
      <PageHeader
        eyebrow={project.category ?? t('heroEyebrowFallback')}
        title={project.title}
        subtitle={project.short_description ?? ''}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: t('crumbSelectedWork'), href: '/portfolio' },
          { label: project.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3">
          {project.project_url ? (
            <Button href={project.project_url} size="lg" variant="primary">
              {t('visitProject')}
              <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
          ) : null}
          <Button href="/contact" size="lg" variant="outline">
            {t('discussProject')}
          </Button>
        </div>
      </PageHeader>

      <Section tone="default">
        <Container size="xl">
          {project.image_url ? (
            <div className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image_url}
                alt={project.alt_text ?? t('heroImageAlt', { title: project.title })}
                style={{ width: '100%', aspectRatio: '16 / 8', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div
              className="rounded-3xl border border-ink-200/70 bg-ink-50"
              style={{ aspectRatio: '16 / 8' }}
              aria-hidden="true"
            />
          )}

          <div className="mt-12 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <SectionEyebrow>{t('overviewEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">{t('overviewTitle')}</SectionTitle>
                {project.description ? (
                  <SectionLead className="mt-5">{project.description}</SectionLead>
                ) : null}
              </Reveal>

              {project.challenge ? (
                <Reveal delay={80} className="mt-16">
                  <SectionEyebrow>{t('challengeEyebrow')}</SectionEyebrow>
                  <SectionTitle className="mt-4">{t('challengeTitle')}</SectionTitle>
                  <p className="mt-5 text-base leading-relaxed text-ink-600">{project.challenge}</p>
                </Reveal>
              ) : null}

              {project.approach ? (
                <Reveal delay={120} className="mt-16">
                  <SectionEyebrow>{t('approachEyebrow')}</SectionEyebrow>
                  <SectionTitle className="mt-4">{t('approachTitle', { company: company.name })}</SectionTitle>
                  <p className="mt-5 text-base leading-relaxed text-ink-600">{project.approach}</p>
                </Reveal>
              ) : null}

              {project.solution ? (
                <Reveal delay={140} className="mt-16">
                  <SectionEyebrow>{t('solutionEyebrow')}</SectionEyebrow>
                  <SectionTitle className="mt-4">{t('solutionTitle')}</SectionTitle>
                  <div className="mt-5">{renderRichText(project.solution)}</div>
                </Reveal>
              ) : null}

              {outcomes.length > 0 ? (
                <Reveal delay={160} className="mt-16">
                  <SectionEyebrow>{t('outcomeEyebrow')}</SectionEyebrow>
                  <SectionTitle className="mt-4">{t('outcomeTitle')}</SectionTitle>
                  <ul className="mt-6 space-y-3">
                    {outcomes.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-3 rounded-xl border border-ink-200/70 bg-white p-4"
                      >
                        <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                          <Icon name="check" className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm leading-relaxed text-ink-700">{r}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
            </div>

            <div className="lg:col-span-4">
              <Reveal delay={100}>
                <div className="sticky top-28 space-y-6">
                  <div className="rounded-2xl border border-ink-200/70 bg-white p-6">
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">{t('projectDetailsEyebrow')}</span>
                    <dl className="mt-4 divide-y divide-ink-200/70">
                      <DetailRow label="Category" value={project.category ?? '—'} />
                      <DetailRow label="Industry" value={project.industry ?? '—'} />
                    </dl>
                  </div>
                  {techs.length > 0 ? (
                    <div className="rounded-2xl border border-ink-200/70 bg-white p-6">
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">{t('technologiesEyebrow')}</span>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {techs.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">{value}</dd>
    </div>
  );
}
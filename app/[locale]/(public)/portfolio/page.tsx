import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedPortfolio } from '@/lib/supabase/public';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const t = await getTranslations('portfolio');
  return {
    title: t('metaTitle'),
    description: t('metaDescription', { company: company.name }),
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('portfolio');
  const tCommon = await getTranslations('common');

  const cmsProjects = await fetchPublishedPortfolio(locale);
  const projects = cmsProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category ?? '',
    industry: p.industry ?? '',
    shortDescription: p.short_description ?? '',
    description: p.description ?? '',
    image: p.image_url ?? '',
    imageAlt: p.alt_text ?? p.title,
    technologies: p.technology ?? [],
    outcomes: p.outcome ?? [],
    projectUrl: p.project_url ?? undefined,
  }));
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
  const industries = Array.from(new Set(projects.map((p) => p.industry).filter(Boolean)));

  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle', { company: company.name })}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('crumbSelectedWork') }]}
      />

      <Section tone="default">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('patternsTitle')}</SectionTitle>
            <SectionLead className="mt-5">
              {t('patternsLead', { company: company.name })}
            </SectionLead>
          </Reveal>

          {projects.length === 0 ? (
            <Reveal className="mt-10 rounded-3xl border border-ink-200/70 bg-white p-10 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                {t('emptyLabel')}
              </span>
              <h2 className="mt-3 font-display text-2xl tracking-tight">
                {t('emptyStateTitle')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-ink-600">
                {t('emptyStateBody', { company: company.name })}
              </p>
            </Reveal>
          ) : (
            <>
              {categories.length > 0 ? (
                <div className="mt-10 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">{t('categoriesLabel')}</span>
                  {categories.map((c) => (
                    <span key={c} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">{c}</span>
                  ))}
                </div>
              ) : null}
              {industries.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">{t('industriesLabel')}</span>
                  {industries.map((c) => (
                    <span key={c} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">{c}</span>
                  ))}
                </div>
              ) : null}

              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((p, i) => (
                  <Reveal
                    key={p.id}
                    delay={(i % 3) * 50}
                    className="flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white"
                  >
                    {p.image ? (
                      <div
                        style={{
                          aspectRatio: '16 / 10',
                          background: `url(${p.image}) center/cover`,
                        }}
                        role="img"
                        aria-label={p.imageAlt}
                      />
                    ) : (
                      <div style={{ aspectRatio: '16 / 10', background: '#eef0f2' }} aria-hidden="true" />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                        {p.category || t('categoryFallback')}
                        {p.industry ? ` · ${p.industry}` : ''}
                      </span>
                      <h3 className="mt-3 font-display text-lg tracking-tight">
                        <Link href={`/portfolio/${p.slug}`} className="hover:text-accent-700">
                          {p.title}
                        </Link>
                      </h3>
                      {p.shortDescription ? (
                        <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.shortDescription}</p>
                      ) : null}
                      <div className="mt-auto flex flex-wrap gap-3 pt-5">
                        <Link href={`/portfolio/${p.slug}`} className="admin-btn sm">
                          {t('viewProject')}
                        </Link>
                        {p.projectUrl ? (
                          <a
                            href={p.projectUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="admin-btn sm ghost"
                          >
                            {t('liveLabel')}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-8 md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-12">
              <div className="md:col-span-8">
                <SectionEyebrow>{t('ctaEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-3">
                  {t('ctaTitle')}
                </SectionTitle>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
                  {t('ctaBody', { company: company.name })}
                </p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <Button href="/contact" variant="primary" size="lg">
                  {t('ctaButton')}
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
import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { fetchPublishedResearchPapers } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const t = await getTranslations('research');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: { canonical: '/research' },
    openGraph: {
      title: `${t('pageTitle')} — ${company.displayName}`,
      description: t('pageDescription'),
      type: 'website',
      url: '/research',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('pageTitle')} — ${company.displayName}`,
      description: t('pageDescription'),
    },
  };
}

export default async function ResearchIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('research');

  await ensureCompanySettings();
  const papers = await fetchPublishedResearchPapers(locale);

  const featured = papers.find((p) => p.is_featured) ?? papers[0] ?? null;
  const rest = papers.filter((p) => p.id !== featured?.id);

  return (
    <>
      <PageHeader
        eyebrow={t('pageEyebrow')}
        title={t('heroTitle')}
        subtitle={t('pageDescription')}
        crumbs={[{ label: 'Home', href: '/' }, { label: t('pageEyebrow') }]}
      />

      <Section tone="default">
        <Container size="xl">
          {papers.length === 0 ? (
            <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-10 text-center">
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
              {featured ? (
                <Reveal>
                  <Link
                    href={`/research/${featured.slug}`}
                    className="group grid gap-8 overflow-hidden rounded-3xl border border-ink-200/70 bg-white transition hover:border-accent-300 md:grid-cols-12"
                  >
                    <div className="md:col-span-5">
                      {featured.cover_public_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featured.cover_public_url}
                          alt={featured.cover_image_alt ?? featured.title}
                          className="h-full w-full"
                          style={{ aspectRatio: '4 / 5', objectFit: 'cover' }}
                          loading="eager"
                        />
                      ) : (
                        <div
                          style={{ aspectRatio: '4 / 5', background: 'var(--ink-100, #eef0f2)' }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-8 md:col-span-7 md:p-10">
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                        {t('featuredPrefix')} · {formatDate(featured.publication_date)}
                        {featured.journal_name
                          ? ` · ${featured.journal_name}`
                          : featured.conference_name
                            ? ` · ${featured.conference_name}`
                            : ''}
                      </span>
                      <h2 className="mt-3 font-display text-3xl tracking-tight text-ink-900 group-hover:text-accent-700">
                        {featured.title}
                      </h2>
                      {featured.authors ? (
                        <p className="mt-3 text-sm font-medium uppercase tracking-[0.12em] text-ink-500">
                          {featured.authors}
                        </p>
                      ) : null}
                      {featured.abstract ? (
                        <p className="mt-4 text-base leading-relaxed text-ink-600">
                          {featured.abstract}
                        </p>
                      ) : null}
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 group-hover:text-accent-600">
                        {t('readPaper')} <Icon name="arrow-right" className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ) : null}

              {rest.length > 0 ? (
                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((paper, i) => (
                    <Reveal
                      key={paper.id}
                      delay={(i % 3) * 50}
                      className="flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white"
                    >
                      <Link
                        href={`/research/${paper.slug}`}
                        className="block overflow-hidden"
                      >
                        {paper.cover_public_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={paper.cover_public_url}
                            alt={paper.cover_image_alt ?? paper.title}
                            style={{
                              aspectRatio: '16 / 10',
                              width: '100%',
                              objectFit: 'cover',
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            style={{ aspectRatio: '16 / 10', background: 'var(--ink-100, #eef0f2)' }}
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col p-6">
                        <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                          {formatDate(paper.publication_date)}
                          {paper.category ? ` · ${paper.category}` : ''}
                        </span>
                        <h3 className="mt-3 font-display text-lg tracking-tight text-ink-900">
                          <Link href={`/research/${paper.slug}`} className="hover:text-accent-700">
                            {paper.title}
                          </Link>
                        </h3>
                        {paper.authors ? (
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-500">
                            {paper.authors}
                          </p>
                        ) : null}
                        {paper.abstract ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">
                            {paper.abstract}
                          </p>
                        ) : null}
                        <Link
                          href={`/research/${paper.slug}`}
                          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-ink-900 hover:text-accent-600"
                        >
                          {t('readPaper')} <Icon name="arrow-right" className="h-4 w-4" />
                        </Link>
                      </div>
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </Container>
      </Section>

      {papers.length > 0 ? (
        <Section tone="muted">
          <Container size="xl">
            <Reveal className="max-w-3xl">
              <SectionEyebrow>{t('aboutEyebrow', { company: company.name })}</SectionEyebrow>
              <SectionTitle className="mt-4">
                {t('aboutTitle')}
              </SectionTitle>
              <SectionLead className="mt-5">
                {t('aboutLead', { company: company.name })}
              </SectionLead>
            </Reveal>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

function formatDate(value: string | null) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return value;
  }
}
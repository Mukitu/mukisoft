import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { siteConfig } from '@/lib/config/site';
import { fetchPublishedResearchPapers, fetchResearchPaperBySlug } from '@/lib/supabase/public';

export const revalidate = 60;

type Params = { slug: string; locale: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const locale = (isLocale(params.locale) ? params.locale : 'en') as Locale;
  const paper = await fetchResearchPaperBySlug(params.slug, locale);
  const t = await getTranslations('researchDetail');
  if (!paper) {
    return {
      title: t('notFoundTitle'),
      robots: { index: false, follow: false },
    };
  }
  const description = paper.abstract ?? paper.description ?? '';
  const url = `${siteConfig.url.replace(/\/$/, '')}/research/${paper.slug}`;
  return {
    title: paper.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: paper.title,
      description,
      type: 'article',
      url,
      images: paper.cover_public_url ? [paper.cover_public_url] : undefined,
      publishedTime: paper.publication_date ?? undefined,
      modifiedTime: paper.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: paper.title,
      description,
      images: paper.cover_public_url ? [paper.cover_public_url] : undefined,
    },
  };
}

export default async function ResearchPaperPage({ params }: { params: Params }) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('researchDetail');
  await ensureCompanySettings();
  const paper = await fetchResearchPaperBySlug(params.slug, locale);
  if (!paper) {
    notFound();
  }

  const all = await fetchPublishedResearchPapers(locale);
  const related = all
    .filter((p) => p.id !== paper.id)
    .filter((p) => !paper.category || !p.category || p.category === paper.category)
    .slice(0, 3);

  const url = `${siteConfig.url.replace(/\/$/, '')}/research/${paper.slug}`;
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: paper.title,
    abstract: paper.abstract ?? undefined,
    description: paper.description ?? paper.abstract ?? '',
    image: paper.cover_public_url ?? undefined,
    datePublished: paper.publication_date ?? paper.updated_at,
    dateModified: paper.updated_at,
    inLanguage: 'en',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: paper.authors_list.map((a) => ({
      '@type': 'Person',
      name: a.name,
      affiliation: a.affiliation
        ? { '@type': 'Organization', name: a.affiliation }
        : undefined,
    })),
    publisher: {
      '@type': 'Organization',
      name: company.displayName,
      url: siteConfig.url,
    },
    isPartOf: paper.journal_name
      ? {
          '@type': 'PublicationVolume',
          name: paper.journal_name,
        }
      : undefined,
    sameAs: paper.doi ? [`https://doi.org/${paper.doi}`] : undefined,
    identifier: paper.doi ? `doi:${paper.doi}` : undefined,
  };

  const authorNames =
    paper.authors_list.length > 0
      ? paper.authors_list.map((a) => a.name).join(', ')
      : paper.authors ?? '';

  const pdfName = paper.pdf_path ? paper.pdf_path.split('/').pop() ?? t('pdfFallback') : t('pdfFallback');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <PageHeader
        eyebrow={paper.category ?? paper.publication_type ?? t('heroEyebrowFallback')}
        title={paper.title}
        subtitle={paper.abstract ?? undefined}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: t('crumbResearch'), href: '/research' },
          { label: paper.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-600">
          {paper.publication_date ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" className="h-4 w-4 text-accent-600" />
              {t('publishedPrefix', { date: formatDate(paper.publication_date) })}
            </span>
          ) : null}
          {paper.journal_name ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="sparkles" className="h-4 w-4 text-accent-600" />
              {paper.journal_name}
            </span>
          ) : paper.conference_name ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="sparkles" className="h-4 w-4 text-accent-600" />
              {paper.conference_name}
            </span>
          ) : null}
          {paper.doi ? (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-ink-900 hover:text-accent-600"
            >
              <Icon name="arrow-up-right" className="h-4 w-4 text-accent-600" />
              {t('doiPrefix', { doi: paper.doi })}
            </a>
          ) : null}
        </div>
      </PageHeader>

      <Section tone="default">
        <Container size="md">
          <Reveal>
            <article className="prose prose-ink max-w-none">
              {paper.cover_public_url ? (
                <figure style={{ margin: '0 0 2rem' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paper.cover_public_url}
                    alt={paper.cover_image_alt ?? paper.title}
                    style={{
                      width: '100%',
                      borderRadius: 16,
                      aspectRatio: '16 / 9',
                      objectFit: 'cover',
                    }}
                    loading="eager"
                  />
                </figure>
              ) : null}

              {authorNames ? (
                <p
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontSize: '0.75rem',
                    color: 'var(--ink-500, #6b7280)',
                    margin: 0,
                  }}
                >
                  {authorNames}
                </p>
              ) : null}

              {paper.abstract ? (
                <>
                  <h2>{t('abstractTitle')}</h2>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{paper.abstract}</p>
                </>
              ) : null}

              {paper.description ? (
                <>
                  <h2>{t('summaryTitle')}</h2>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{paper.description}</div>
                </>
              ) : null}

              {paper.authors_list.length > 0 ? (
                <>
                  <h2>{t('authorsTitle')}</h2>
                  <ul>
                    {paper.authors_list.map((a) => (
                      <li key={a.id}>
                        <strong>{a.name}</strong>
                        {a.affiliation ? ` — ${a.affiliation}` : ''}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </article>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {paper.pdf_public_url ? (
                <>
                  <Button href={paper.pdf_public_url} variant="primary" target="_blank">
                    {t('viewPdf')}
                    <Icon name="arrow-up-right" className="h-4 w-4" />
                  </Button>
                  <Button
                    href={paper.pdf_public_url}
                    variant="outline"
                    download={pdfName}
                  >
                    {t('downloadPdf')}
                  </Button>
                </>
              ) : null}
              {paper.external_url ? (
                <Button href={paper.external_url} variant="outline" target="_blank">
                  {t('viewPublication')}
                  <Icon name="arrow-up-right" className="h-4 w-4" />
                </Button>
              ) : null}
              {!paper.pdf_public_url && !paper.external_url ? (
                <p className="text-sm text-ink-500">
                  {t('noPdfFallback')}
                </p>
              ) : null}
            </div>
          </Reveal>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="muted">
          <Container size="xl">
            <h2 className="font-display text-2xl tracking-tight">{t('moreTitle')}</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Reveal
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white"
                >
                  <Link href={`/research/${p.slug}`} className="block overflow-hidden">
                    {p.cover_public_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover_public_url}
                        alt={p.cover_image_alt ?? p.title}
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
                      {formatDate(p.publication_date)}
                      {p.category ? ` · ${p.category}` : ''}
                    </span>
                    <h3 className="mt-3 font-display text-lg tracking-tight">
                      <Link href={`/research/${p.slug}`} className="hover:text-accent-700">
                        {p.title}
                      </Link>
                    </h3>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-10">
              <Link
                href="/research"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
              >
                <Icon name="arrow-right" className="h-4 w-4" style={{ transform: 'rotate(180deg)' }} />
                {t('allLink')}
              </Link>
            </div>
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
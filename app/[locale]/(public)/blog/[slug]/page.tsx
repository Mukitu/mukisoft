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
import {
  fetchBlogPostBySlug,
  fetchPublishedBlogPosts,
} from '@/lib/supabase/public';
import { renderRichText } from '@/lib/utils/rich-text';

export const dynamic = 'force-dynamic';

type Params = { slug: string; locale: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const locale = (isLocale(params.locale) ? params.locale : 'en') as Locale;
  const post = await fetchBlogPostBySlug(params.slug, locale);
  const t = await getTranslations('blogDetail');
  if (!post) {
    return {
      title: t('notFoundTitle'),
      robots: { index: false, follow: false },
    };
  }
  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt ?? '';
  const ogImage = post.og_image ?? post.featured_image ?? undefined;
  const canonical = post.canonical_url ?? `${siteConfig.url.replace(/\/$/, '')}/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: post.og_title ?? title,
      description: post.og_description ?? description,
      type: 'article',
      url: canonical,
      images: ogImage ? [ogImage] : undefined,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.og_title ?? title,
      description: post.og_description ?? description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Params }) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('blogDetail');
  const tBlog = await getTranslations('blog');
  await ensureCompanySettings();
  const post = await fetchBlogPostBySlug(params.slug, locale);
  if (!post) {
    notFound();
  }

  const related = await fetchPublishedBlogPosts({
    limit: 3,
    excludeId: post.id,
    categorySlug: post.category?.slug,
  });

  const url = `${siteConfig.url.replace(/\/$/, '')}/blog/${post.slug}`;

  // Schema.org BlogPosting structured data.
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? '',
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: post.published_at ?? post.updated_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: post.author_email
      ? {
          '@type': 'Person',
          name: post.author_email,
          email: post.author_email,
          jobTitle: `Founder & CEO, ${company.name}`,
          worksFor: {
            '@type': 'Organization',
            name: company.name,
          },
        }
      : {
          '@type': 'Organization',
          name: company.name,
        },
    publisher: {
      '@type': 'Organization',
      name: company.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url.replace(/\/$/, '')}/assets/logo/logo.png`,
      },
    },
    articleSection: post.category?.name ?? tBlog('articleFallback'),
    keywords: post.tags.map((tg) => tg.name).join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <PageHeader
        eyebrow={post.category?.name ?? t('heroEyebrowFallback')}
        title={post.title}
        subtitle={post.excerpt ?? undefined}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: t('crumbBlog'), href: '/blog' },
          { label: post.title },
        ]}
      />

      <Section tone="default">
        <Container size="md">
          <Reveal>
            {post.featured_image ? (
              <figure style={{ margin: '0 0 2rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.featured_image}
                  alt={post.featured_image_alt ?? post.title}
                  style={{ width: '100%', borderRadius: 16, aspectRatio: '16 / 9', objectFit: 'cover' }}
                  loading="eager"
                />
                {post.featured_image_alt ? (
                  <figcaption
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.85rem',
                      color: 'var(--ink-500, #6b7280)',
                    }}
                  >
                    {post.featured_image_alt}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
                fontSize: '0.85rem',
                color: 'var(--ink-500, #6b7280)',
                marginBottom: '1.5rem',
              }}
            >
              <span>{formatDate(post.published_at ?? post.updated_at)}</span>
              <span aria-hidden="true">·</span>
              <span>
                {t('byPrefix')}
                {post.author_email ? (
                  <strong>{post.author_email}</strong>
                ) : (
                  <strong>{company.name}</strong>
                )}
              </span>
              {post.tags.length > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </span>
                </>
              ) : null}
            </div>

            <article className="prose prose-ink max-w-none">
              {post.content ? renderRichText(post.content) : <p>{t('noContent')}</p>}
            </article>
          </Reveal>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="muted">
          <Container size="xl">
            <h2 className="font-display text-2xl tracking-tight">{t('relatedTitle')}</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Reveal
                  key={p.id}
                  className="flex flex-col rounded-2xl border border-ink-200/70 bg-white p-7"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                    {p.category?.name ?? tBlog('articleFallback')} · {formatDate(p.published_at ?? p.updated_at)}
                  </span>
                  <h3 className="mt-3 font-display text-lg tracking-tight">
                    <Link href={`/blog/${p.slug}`} className="hover:text-accent-700">
                      {p.title}
                    </Link>
                  </h3>
                  {p.excerpt ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.excerpt}</p>
                  ) : null}
                  <Link
                    href={`/blog/${p.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-ink-900 hover:text-accent-600"
                  >
                    {tBlog('readArticle')} <Icon name="arrow-right" className="h-4 w-4" />
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="mt-10">
              <Button href="/blog" variant="outline">
                {t('allArticlesButton')}
              </Button>
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
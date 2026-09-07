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
import { fetchPublishedBlogPosts, fetchBlogCategories } from '@/lib/supabase/public';
import { renderRichText } from '@/lib/utils/rich-text';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 9;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const t = await getTranslations('blog');
  const description = t('metaDescription');
  return {
    title: t('metaTitle'),
    description,
    alternates: { canonical: '/blog' },
    openGraph: {
      title: t('metaTitle'),
      description,
      type: 'website',
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('blog');
  const tCommon = await getTranslations('common');

  await ensureCompanySettings();
  const [posts, categories] = await Promise.all([
    fetchPublishedBlogPosts({ limit: 100, locale }),
    fetchBlogCategories(locale),
  ]);
  const total = posts.length;
  const featured = posts.find((p) => p.is_featured) ?? posts[0] ?? null;
  const rest = posts.filter((p) => p.id !== featured?.id).slice(0, PAGE_SIZE);

  return (
    <>
      <PageHeader
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        subtitle={t('heroSubtitle', { company: company.name })}
        crumbs={[{ label: tCommon('home'), href: '/' }, { label: t('heroEyebrow') }]}
      />

      <Section tone="default">
        <Container size="xl">
          {total === 0 ? (
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
                    href={`/blog/${featured.slug}`}
                    className="group grid gap-8 overflow-hidden rounded-3xl border border-ink-200/70 bg-white transition hover:border-accent-300 md:grid-cols-12"
                  >
                    <div className="md:col-span-7">
                      {featured.featured_image ? (
                        <div
                          style={{
                            aspectRatio: '16 / 10',
                            background: `url(${featured.featured_image}) center/cover`,
                          }}
                          role="img"
                          aria-label={featured.featured_image_alt ?? featured.title}
                        />
                      ) : (
                        <div
                          style={{ aspectRatio: '16 / 10', background: 'var(--ink-100, #eef0f2)' }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-8 md:col-span-5 md:p-10">
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                        {featured.category?.name ?? t('featuredFallback')} ·{' '}
                        {formatDate(featured.published_at ?? featured.updated_at)}
                      </span>
                      <h2 className="mt-3 font-display text-3xl tracking-tight text-ink-900 group-hover:text-accent-700">
                        {featured.title}
                      </h2>
                      {featured.excerpt ? (
                        <p className="mt-4 text-base leading-relaxed text-ink-600">{featured.excerpt}</p>
                      ) : null}
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 group-hover:text-accent-600">
                        {t('readArticle')} <Icon name="arrow-right" className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ) : null}

              {categories.length > 0 ? (
                <div className="mt-12 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">{t('categoriesLabel')}</span>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/blog?category=${c.slug}`}
                      className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-accent-50 hover:text-accent-700"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              {rest.length > 0 ? (
                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => (
                    <Reveal
                      key={post.id}
                      delay={(i % 3) * 50}
                      className="flex flex-col rounded-2xl border border-ink-200/70 bg-white p-7"
                    >
                      {post.featured_image ? (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="mb-5 block overflow-hidden rounded-xl"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.featured_image}
                            alt={post.featured_image_alt ?? post.title}
                            style={{ aspectRatio: '16 / 10', width: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </Link>
                      ) : null}
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                        {post.category?.name ?? t('articleFallback')} ·{' '}
                        {formatDate(post.published_at ?? post.updated_at)}
                      </span>
                      <h3 className="mt-3 font-display text-lg tracking-tight text-ink-900">
                        <Link href={`/blog/${post.slug}`} className="hover:text-accent-700">
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 text-sm leading-relaxed text-ink-600">{post.excerpt}</p>
                      ) : null}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-ink-900 hover:text-accent-600"
                      >
                        {t('readArticle')} <Icon name="arrow-right" className="h-4 w-4" />
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </Container>
      </Section>

      {total > 0 ? (
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

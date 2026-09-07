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
import { fetchPublishedGalleryEvents } from '@/lib/supabase/public';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const t = await getTranslations('gallery');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: { canonical: '/gallery' },
    openGraph: {
      title: `${t('pageTitle')} — ${company.displayName}`,
      description: t('pageDescription'),
      type: 'website',
      url: '/gallery',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('pageTitle')} — ${company.displayName}`,
      description: t('pageDescription'),
    },
  };
}

export default async function GalleryIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('gallery');

  await ensureCompanySettings();
  const events = await fetchPublishedGalleryEvents(locale);

  const featured = events.find((e) => e.is_featured) ?? events[0] ?? null;
  const rest = events.filter((e) => e.id !== featured?.id);

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
          {events.length === 0 ? (
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
                    href={`/gallery/${featured.slug}`}
                    className="group relative grid gap-0 overflow-hidden rounded-3xl border border-ink-200/70 bg-white transition hover:border-accent-300 md:grid-cols-12"
                  >
                    <div className="md:col-span-7">
                      {featured.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featured.cover_url}
                          alt={featured.cover_image_alt ?? featured.title}
                          className="h-full w-full"
                          style={{ aspectRatio: '16 / 10', objectFit: 'cover' }}
                          loading="eager"
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
                        {t('featuredPrefix')} · {formatDate(featured.event_date)}
                        {featured.location ? ` · ${featured.location}` : ''}
                      </span>
                      <h2 className="mt-3 font-display text-3xl tracking-tight text-ink-900 group-hover:text-accent-700">
                        {featured.title}
                      </h2>
                      {featured.short_description ? (
                        <p className="mt-4 text-base leading-relaxed text-ink-600">
                          {featured.short_description}
                        </p>
                      ) : null}
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 group-hover:text-accent-600">
                        {t('viewEvent')} <Icon name="arrow-right" className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ) : null}

              {rest.length > 0 ? (
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((event, i) => (
                    <Reveal
                      key={event.id}
                      delay={(i % 3) * 50}
                      className="flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white"
                    >
                      <Link
                        href={`/gallery/${event.slug}`}
                        className="block overflow-hidden"
                      >
                        {event.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.cover_url}
                            alt={event.cover_image_alt ?? event.title}
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
                          {formatDate(event.event_date)}
                          {event.location ? ` · ${event.location}` : ''}
                        </span>
                        <h3 className="mt-3 font-display text-lg tracking-tight text-ink-900">
                          <Link href={`/gallery/${event.slug}`} className="hover:text-accent-700">
                            {event.title}
                          </Link>
                        </h3>
                        {event.short_description ? (
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">
                            {event.short_description}
                          </p>
                        ) : null}
                        <Link
                          href={`/gallery/${event.slug}`}
                          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-ink-900 hover:text-accent-600"
                        >
                          {t('viewEvent')} <Icon name="arrow-right" className="h-4 w-4" />
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

      {events.length > 0 ? (
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
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
import { GalleryDetail } from '@/components/gallery/gallery-detail';
import { company } from '@/lib/config/company';
import { ensureCompanySettings } from '@/lib/config/company.server';
import { siteConfig } from '@/lib/config/site';
import { fetchGalleryEventBySlug, fetchPublishedGalleryEvents } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

type Params = { slug: string; locale: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const locale = (isLocale(params.locale) ? params.locale : 'en') as Locale;
  const event = await fetchGalleryEventBySlug(params.slug, locale);
  const t = await getTranslations('galleryDetail');
  if (!event) {
    return {
      title: t('notFoundTitle'),
      robots: { index: false, follow: false },
    };
  }
  const description =
    event.short_description ??
    `${event.title}${event.location ? ` — ${event.location}` : ''}${event.event_date ? `, ${formatDate(event.event_date)}` : ''}.`;
  const url = `${siteConfig.url.replace(/\/$/, '')}/gallery/${event.slug}`;
  return {
    title: event.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: event.title,
      description,
      type: 'article',
      url,
      images: event.cover_url ? [event.cover_url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: event.cover_url ? [event.cover_url] : undefined,
    },
  };
}

export default async function GalleryEventPage({ params }: { params: Params }) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('galleryDetail');
  await ensureCompanySettings();
  const event = await fetchGalleryEventBySlug(params.slug, locale);
  if (!event) {
    notFound();
  }

  const all = await fetchPublishedGalleryEvents(locale);
  const related = all
    .filter((e) => e.id !== event.id)
    .filter((e) => !event.category || !e.category || e.category === event.category)
    .slice(0, 3);

  const url = `${siteConfig.url.replace(/\/$/, '')}/gallery/${event.slug}`;
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.short_description ?? event.description ?? '',
    startDate: event.event_date ?? undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: event.location
      ? {
          '@type': 'Place',
          name: event.location,
        }
      : undefined,
    image: event.cover_url ?? undefined,
    url,
    organizer: {
      '@type': 'Organization',
      name: company.displayName,
      url: siteConfig.url,
    },
  };

  const galleryImages = event.images.length > 0
    ? event.images.map((img) => ({
        id: img.id,
        src: img.public_url,
        alt: img.alt_text ?? event.title,
        caption: img.caption,
      }))
    : event.cover_url
      ? [
          {
            id: 'cover',
            src: event.cover_url,
            alt: event.cover_image_alt ?? event.title,
            caption: null,
          },
        ]
      : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <PageHeader
        eyebrow={event.category ?? t('heroEyebrowFallback')}
        title={event.title}
        subtitle={event.short_description ?? undefined}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: t('crumbGallery'), href: '/gallery' },
          { label: event.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-600">
          {event.event_date ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" className="h-4 w-4 text-accent-600" />
              {formatDate(event.event_date)}
            </span>
          ) : null}
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="location" className="h-4 w-4 text-accent-600" />
              {event.location}
            </span>
          ) : null}
          {event.external_url ? (
            <a
              href={event.external_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-ink-900 hover:text-accent-600"
            >
              <Icon name="arrow-up-right" className="h-4 w-4 text-accent-600" />
              {t('eventLink')}
            </a>
          ) : null}
        </div>
      </PageHeader>

      <Section tone="default">
        <Container size="lg">
          {event.cover_url && event.images.length === 0 ? (
            <Reveal>
              <figure style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.cover_url}
                  alt={event.cover_image_alt ?? event.title}
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    aspectRatio: '16 / 9',
                    objectFit: 'cover',
                  }}
                />
              </figure>
            </Reveal>
          ) : null}

          {event.description ? (
            <Reveal className="mt-10 max-w-3xl">
              <h2 className="font-display text-2xl tracking-tight">{t('aboutEventTitle')}</h2>
              <div className="prose prose-ink mt-4 max-w-none">
                {event.description
                  .split(/\n{2,}/)
                  .map((para, i) => (
                    <p key={i} className="text-base leading-relaxed text-ink-700">
                      {para}
                    </p>
                  ))}
              </div>
            </Reveal>
          ) : null}

          {galleryImages.length > 0 ? (
            <Reveal className="mt-12">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl tracking-tight">{t('galleryTitle')}</h2>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
                  {galleryImages.length} {galleryImages.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              <GalleryDetail images={galleryImages} />
            </Reveal>
          ) : null}
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="muted">
          <Container size="xl">
            <h2 className="font-display text-2xl tracking-tight">{t('moreTitle')}</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((e) => (
                <Reveal
                  key={e.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white"
                >
                  <Link href={`/gallery/${e.slug}`} className="block overflow-hidden">
                    {e.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.cover_url}
                        alt={e.cover_image_alt ?? e.title}
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
                      {formatDate(e.event_date)}
                      {e.location ? ` · ${e.location}` : ''}
                    </span>
                    <h3 className="mt-3 font-display text-lg tracking-tight">
                      <Link href={`/gallery/${e.slug}`} className="hover:text-accent-700">
                        {e.title}
                      </Link>
                    </h3>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-10">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
              >
                <Icon name="arrow-right" className="h-4 w-4" style={{ transform: 'rotate(180deg)' }} />
                {t('allEventsLink')}
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
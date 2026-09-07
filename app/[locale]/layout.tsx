import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { company, setCompanySettings } from '@/lib/config/company';
import { getSiteConfig } from '@/lib/config/site';
import { assetPaths } from '@/lib/config/assets';
import { fetchSiteSettings } from '@/lib/supabase/public';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import {
  locales,
  isLocale,
  localeToHtmlLang,
  localeToBcp47,
  type Locale,
} from '@/lib/i18n/config';
import { resolveLocaleFromParams } from '@/lib/i18n/server';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale: Locale = resolveLocaleFromParams(params);
  const settings = await fetchSiteSettings();
  setCompanySettings(settings);
  const faviconUrl = settings?.favicon_url;
  const logoUrl = settings?.navbar_logo_url;
  const cfg = getSiteConfig();
  const ogLocale = localeToBcp47[locale];
  const baseUrl = cfg.url.replace(/\/$/, '');

  const icons: Metadata['icons'] = faviconUrl
    ? {
        icon: [{ url: faviconUrl, type: 'image/png' }],
        shortcut: faviconUrl,
        apple: [{ url: faviconUrl, type: 'image/png', sizes: '180x180' }],
      }
    : {
        icon: [
          { url: assetPaths.favicon.png, type: 'image/png', sizes: '32x32' },
          { url: assetPaths.favicon.png, type: 'image/png', sizes: '192x192' },
          { url: assetPaths.favicon.ico, type: 'image/svg+xml' },
        ],
        shortcut: assetPaths.favicon.png,
        apple: [{ url: assetPaths.favicon.appleTouch, type: 'image/png', sizes: '180x180' }],
      };

  const alternates = {
    canonical: `${baseUrl}/${locale}`,
    languages: Object.fromEntries(
      locales.map((l) => [localeToHtmlLang[l], `${baseUrl}/${l}`]),
    ),
  } as Metadata['alternates'];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: cfg.title,
      template: `%s — ${company.displayName}`,
    },
    description: cfg.description,
    applicationName: company.displayName,
    authors: [{ name: company.founder.name, url: cfg.url }],
    generator: 'Next.js',
    keywords: [...cfg.keywords],
    referrer: 'origin-when-cross-origin',
    creator: company.displayName,
    publisher: company.displayName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: `${baseUrl}/${locale}`,
      title: cfg.title,
      description: cfg.description,
      siteName: company.displayName,
      // Facebook, WhatsApp, LinkedIn, Slack, Discord all read `og:image`
      // first. We supply BOTH the PNG and a JPG fallback so the crawler
      // picks whichever it supports. Dimensions and alt text are required
      // by Facebook's crawler for a large preview card — without them
      // it serves a tiny thumbnail (or none at all).
      //
      // We use the FULL absolute URL here (not just `/og.png`). Some
      // crawlers (notably WhatsApp) refuse to resolve relative URLs
      // against `metadataBase` and silently drop the image. Belt and braces.
      images: [
        {
          url: cfg.ogImage.startsWith('http') ? cfg.ogImage : `${baseUrl}${cfg.ogImage}`,
          secureUrl: cfg.ogImage.startsWith('http') ? cfg.ogImage : `${baseUrl}${cfg.ogImage}`,
          type: 'image/png',
          width: 1200,
          height: 630,
          alt: `${company.displayName} — ${company.tagline}`,
        },
        {
          url: `${baseUrl}/og.jpg`,
          secureUrl: `${baseUrl}/og.jpg`,
          type: 'image/jpeg',
          width: 1200,
          height: 630,
          alt: `${company.displayName} — ${company.tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: cfg.title,
      description: cfg.description,
      creator: company.social.x,
      // Twitter reads `twitter:image` separately. Same dimensions rule
      // applies — a large card needs >= 300x157, we ship 1200x630.
      images: [
        {
          url: cfg.ogImage.startsWith('http') ? cfg.ogImage : `${baseUrl}${cfg.ogImage}`,
          alt: `${company.displayName} — ${company.tagline}`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates,
    icons,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  // next-intl requirement for static rendering of /[locale] pages.
  unstable_setRequestLocale(locale);

  const messages = await getMessages();
  const settings = await fetchSiteSettings();
  setCompanySettings(settings);
  const logoUrl = settings?.navbar_logo_url ?? undefined;
  const logoHeightPx = settings?.navbar_logo_size ?? undefined;
  const cfg = getSiteConfig();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.displayName,
    url: `${cfg.url}/${locale}`,
    logo: `${cfg.url}${logoUrl ?? assetPaths.logo.primary}`,
    description: cfg.description,
    founder: {
      '@type': 'Person',
      name: company.founder.name,
      jobTitle: company.founder.role,
    },
    sameAs: [
      company.social.linkedin,
      company.social.x,
      company.social.github,
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      email: company.contact.email,
      contactType: 'customer support',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Bengali'],
    },
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar logoUrl={logoUrl} logoHeightPx={logoHeightPx} locale={locale} />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer logoUrl={logoUrl} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </NextIntlClientProvider>
  );
}

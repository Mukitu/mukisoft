import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import type { Metadata } from 'next';
import { defaultLocale, pickLocaleFromHeader, isLocale, COOKIE_NAME } from '@/lib/i18n/config';
import { DOMAIN, company } from '@/lib/config/company';

/**
 * Root entry — picks a locale and 302-redirects to /<locale>/.
 *
 * Precedence:
 *   1. `mukisoft_lang` cookie
 *   2. `Accept-Language` header
 *   3. Default locale
 */
export const dynamic = 'force-dynamic';

/**
 * Root metadata — important for social scrapers that fetch the bare
 * domain (e.g. someone shares `https://mukisoft.tech` instead of
 * `https://mukisoft.tech/en`). Without this, the root page HTML is a
 * bare 302 redirect with no `<meta property="og:…">` tags, and
 * Facebook/WhatsApp/LinkedIn will store an empty preview.
 *
 * By emitting the same Open Graph + Twitter Card tags here, every
 * crawler that hits the root picks up the preview, even if it never
 * follows the redirect to /<locale>/.
 */
export const metadata: Metadata = {
  metadataBase: new URL(`https://${DOMAIN}`),
  title: `${company.name} | Software, AI & Digital Solutions`,
  description: `${company.name} is a Bangladesh-based software engineering firm building modern web apps, mobile apps, SaaS, AI-powered solutions and digital experiences for businesses.`,
  alternates: {
    canonical: `https://${DOMAIN}`,
  },
  openGraph: {
    type: 'website',
    url: `https://${DOMAIN}`,
    title: `${company.name} | Software, AI & Digital Solutions`,
    description: `${company.name} builds modern web apps, mobile apps, SaaS products, AI-powered solutions and digital experiences for businesses.`,
    siteName: company.displayName,
    images: [
      {
        url: `https://${DOMAIN}/og.png`,
        secureUrl: `https://${DOMAIN}/og.png`,
        type: 'image/png',
        width: 1200,
        height: 630,
        alt: `${company.displayName} — Software, AI & Digital Solutions`,
      },
      {
        url: `https://${DOMAIN}/og.jpg`,
        secureUrl: `https://${DOMAIN}/og.jpg`,
        type: 'image/jpeg',
        width: 1200,
        height: 630,
        alt: `${company.displayName} — Software, AI & Digital Solutions`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${company.name} | Software, AI & Digital Solutions`,
    description: `${company.name} builds modern web apps, mobile apps, SaaS, AI-powered solutions and digital experiences for businesses.`,
    images: [
      {
        url: `https://${DOMAIN}/og.png`,
        alt: `${company.displayName} — Software, AI & Digital Solutions`,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootRedirect() {
  const cookieValue = cookies().get(COOKIE_NAME)?.value;
  const acceptLang = headers().get('accept-language');
  const locale =
    (cookieValue && isLocale(cookieValue) ? cookieValue : null) ??
    pickLocaleFromHeader(acceptLang) ??
    defaultLocale;
  redirect(`/${locale}`);
}

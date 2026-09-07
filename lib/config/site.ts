import { assetPaths } from '@/lib/config/assets';
import { company, DOMAIN, getCompanySettings } from '@/lib/config/company';

/**
 * Site-wide static defaults. Pure config — does NOT consult the DB.
 *
 * For per-request SEO overrides (site_title, meta_description, OG tags,
 * canonical URL) read from `getSiteConfig()` instead, which is the only
 * function in this module that respects the live `site_settings` row.
 *
 * `siteConfig` is kept as a const so non-RSC consumers that cannot
 * reach the per-request cache (e.g. `app/(public)/sitemap.ts`,
 * `app/robots.ts`) can still import a stable URL. Those are
 * infrastructure files that should always use the canonical domain,
 * not a per-render override.
 */
export const siteConfig = {
  url: `https://${DOMAIN}`,
  ogImage: assetPaths.og.default,
  logo: assetPaths.logo.primary,
  favicon: assetPaths.favicon.png,
  title: `${company.name} | Software, AI & Digital Solutions`,
  description:
    `${company.name} is a software and digital technology company building modern web applications, mobile apps, SaaS products, AI-powered solutions and digital experiences for businesses.`,
  email: company.contact.email,
  domain: DOMAIN,
  keywords: [
    company.name,
    company.shortName,
    'software development company',
    'web application development',
    'mobile app development',
    'custom software',
    'SaaS development',
    'AI development',
    'machine learning solutions',
    'AI automation',
    'UI/UX design',
    'product design',
    'SEO services',
    'digital marketing',
    'cloud solutions',
    'enterprise software',
    'technology consulting',
    'MukiSoft',
  ],
  locale: 'en-US',
  themeColor: '#7c5cff',
  robotsPolicy: {
    index: true,
    follow: true,
  },
} as const;

/**
 * Per-request resolved site config. Pulls SEO overrides from the
 * cached `site_settings` row when present, otherwise falls back to
 * `siteConfig`. Call from server components / `generateMetadata()` —
 * the layout already seeds the cache so this is essentially free.
 */
export function getSiteConfig() {
  const settings = getCompanySettings();
  if (!settings) return siteConfig;

  // Empty strings in the DB are treated as "not set" so the admin
  // can clear a field without leaving a visible empty title.
  const pick = (v: string | null | undefined): string | undefined => {
    const t = (v ?? '').trim();
    return t.length > 0 ? t : undefined;
  };

  const title = pick(settings.site_title);
  const description = pick(settings.meta_description);
  const ogTitle = pick(settings.og_title);
  const ogDescription = pick(settings.og_description);
  const ogImage = pick(settings.og_image);
  const canonical = pick(settings.canonical_url);

  return {
    ...siteConfig,
    title: title ?? siteConfig.title,
    description: description ?? siteConfig.description,
    ogImage: ogImage ?? siteConfig.ogImage,
    url: (canonical ?? siteConfig.url).replace(/\/$/, ''),
  };
}

/**
 * Centralized asset configuration.
 *
 * All browser-facing image URLs and asset paths live here so they can be
 * updated in one place when real assets are added to `public/assets/`.
 *
 * Source-of-truth directory convention (under `public/`):
 *   /assets/logo/logo.png           — main navbar logo
 *   /assets/logo/favicon.png        — site favicon
 *   /assets/portfolio/portfolioN.png — portfolio work
 *   /assets/Team/teamN.png          — team member portraits
 *
 * NOTE: founder portraits are NOT stored locally anymore. They are
 * uploaded by the admin through the CMS into Supabase Storage and the
 * resulting URL is persisted on `public.leadership.image_url`. When no
 * image is uploaded, the public FounderImage falls back to an initials
 * monogram rather than to a hardcoded PNG.
 *
 * Every `path` returned here is a URL-safe public path (starts with "/").
 * The helper `hasAsset()` can be used in components to swap a graceful
 * fallback when the file does not yet exist on disk.
 */

const PUBLIC_BASE = '/assets';

export const assetPaths = {
  logo: {
    primary: `${PUBLIC_BASE}/logo/logo.png`,
    wordmark: `${PUBLIC_BASE}/logo/logo.png`,
    monogram: '/logo.svg',
    fallback: '/logo.svg',
  },
  favicon: {
    ico: '/favicon.svg',
    png: `${PUBLIC_BASE}/logo/favicon.png`,
    appleTouch: `${PUBLIC_BASE}/logo/favicon.png`,
  },
  portfolio: {
    /** Public URL for a portfolio image by 1-based index. */
    byIndex(index: number): string {
      const safe = Math.max(1, Math.floor(index));
      return `${PUBLIC_BASE}/portfolio/portfolio${safe}.png`;
    },
  },
  team: {
    /** Public URL for a team image by 1-based index. */
    byIndex(index: number): string {
      const safe = Math.max(1, Math.floor(index));
      return `${PUBLIC_BASE}/Team/team${safe}.png`;
    },
    fallback: '/images/team/placeholder.svg',
  },
  og: {
    default: '/og.svg',
  },
  /**
   * Founder portrait path.
   *
   * Founder portraits are uploaded through the CMS into Supabase Storage
   * and the resulting URL is persisted on `public.leadership.image_url`.
   * The public `<FounderImage>` component renders that URL when present
   * and otherwise falls back to an initials monogram.
   *
   * This path is kept only so `company.founder.photo` (a required
   * `Company` type field) always has a non-empty URL-safe string to
   * point at. It is never intentionally rendered — the monogram
   * fallback is the real safety net.
   */
  founder: {
    primary: '/logo.svg',
  },
} as const;

export type AssetConfig = typeof assetPaths;

/**
 * Maximum number of portfolio images to attempt to discover.
 * Components fall back to the SVG fallback if the file is missing on the
 * server (404 from `<Image fill>`). This guard makes the design total —
 * never invent references to images that don't exist.
 */
export const MAX_PORTFOLIO_SLOTS = 12;

/**
 * Convenience accessor used by `<Image>` components and `next.config.mjs`.
 * A path exposed here will be passed verbatim to `next/image` and resolved
 * by Next.js at build time.
 */
export function publicAssetUrl(path: `/${string}`): string {
  return path;
}

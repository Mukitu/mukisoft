import Link from 'next/link';
import { company } from '@/lib/config/company';
import { assetPaths } from '@/lib/config/assets';
import { cn } from '@/lib/utils/cn';
import { LogoImage } from '@/components/ui/brand-image';

type LogoProps = {
  variant?: 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional CMS-driven logo URL. When provided, the image is rendered as
   * the raster logo. When omitted, the bundled `/assets/logo/logo.png`
   * is used as the fallback chain.
   */
  src?: string;
  /**
   * Optional explicit rendered height in CSS pixels. When set, it
   * overrides the `size` preset. Used by the navbar to honour the
   * admin-controlled `navbar_logo_size` setting.
   */
  heightPx?: number;
  /**
   * When `true`, render the company name as text next to the logo image
   * (only if `company.name` is non-empty). Defaults to `false` — both
   * the navbar and footer treat the brand as logo-only.
   */
  showText?: boolean;
};

/**
 * Server-renderable brand logo. The navbar passes an admin-uploaded URL
 * via `src`; the footer always falls back to the bundled asset.
 *
 * Uses the shared `LogoImage` component so:
 * - next/image optimizes the raster (AVIF/WebP, lazy/eager, blur placeholder)
 * - A fallback chain kicks in if the configured file is missing on disk
 * - One component, one behavior, no duplication across navbar/footer
 */
export function Logo({
  variant = 'dark',
  className,
  size = 'md',
  heightPx,
  showText = false,
}: LogoProps) {
  const sizeMap = {
    sm: { h: 28, w: 96, text: 'text-sm' },
    md: { h: 36, w: 144, text: 'text-base' },
    lg: { h: 44, w: 176, text: 'text-lg' },
  } as const;
  const preset = sizeMap[size];

  // Clamp the explicit pixel height to a sane navbar range so a typo
  // can't blow out the layout. Matches the DB CHECK constraint range
  // (16–96) in supabase/migrations/0006_navbar_logo_size.sql.
  const safeHeight = (() => {
    if (!heightPx || !Number.isFinite(heightPx)) return preset.h;
    return Math.min(96, Math.max(16, Math.round(heightPx)));
  })();
  const textCls = preset.text;

  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2.5',
        variant === 'light' ? 'text-white' : 'text-ink-900',
        className,
      )}
      aria-label={`${company.displayName} home`}
    >
      <LogoImage
        // LogoImage reads the bundled asset from assetPaths.logo.primary
        // and falls back to the SVG wordmark on error. We pass width/
        // height for the raster, priority so it loads eagerly in the
        // navbar (above the fold).
        companyName={company.displayName}
        width={Math.round(safeHeight * 4)}
        height={safeHeight}
        priority
        className="h-auto"
        fallbackClassName={cn('h-auto', className)}
      />
      {showText && company.name ? (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display font-semibold tracking-tight', textCls)}>
            {company.name}
          </span>
        </span>
      ) : null}
    </Link>
  );
}

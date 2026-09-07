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
  src,
}: LogoProps) {
  const sizeMap = {
    sm: { h: 28, w: 96, text: 'text-sm' },
    md: { h: 40, w: 160, text: 'text-base' },
    lg: { h: 48, w: 192, text: 'text-lg' },
  } as const;
  const preset = sizeMap[size];

  // When the caller supplies an explicit pixel height (admin setting
  // `navbar_logo_size`), use it verbatim. Otherwise fall back to a
  // responsive ladder via Tailwind on the wrapper so the logo scales
  // smoothly with the viewport.
  //
  // Clamp the explicit pixel height to a sane navbar range so a typo
  // can't blow out the layout. Matches the DB CHECK constraint range
  // (16–96) in supabase/migrations/0006_navbar_logo_size.sql.
  const hasExplicitHeight =
    typeof heightPx === 'number' && Number.isFinite(heightPx);
  const safeHeight = hasExplicitHeight
    ? Math.min(96, Math.max(16, Math.round(heightPx as number)))
    : null;
  const textCls = preset.text;

  return (
    <Link
      href="/"
      className={cn(
        // `shrink-0` keeps the logo from being squeezed by sibling
        // flex items when the viewport narrows. The Tailwind ladder
        // `h-9 md:h-10 lg:h-11` only applies when no explicit pixel
        // height was provided — when one was, inline `style.height`
        // overrides it and the ladder is suppressed.
        'group inline-flex items-center gap-2.5 shrink-0',
        !safeHeight && 'h-9 md:h-10 lg:h-11',
        variant === 'light' ? 'text-white' : 'text-ink-900',
        className,
      )}
      style={
        safeHeight
          ? ({ height: `${safeHeight}px` } as React.CSSProperties)
          : undefined
      }
      aria-label={`${company.displayName} home`}
    >
      <LogoImage
        // The navbar/footer pass an admin-uploaded URL via `src`. When
        // absent, LogoImage falls back to the bundled raster and then
        // to the SVG wordmark — so a broken admin upload never breaks
        // the navbar.
        src={src}
        companyName={company.displayName}
        // Intrinsic height for next/image layout reservation. The CSS
        // rendered size is controlled by the parent (Tailwind ladder
        // above or inline style), and the image uses `h-full w-auto`
        // inside it for a perfect fit at any aspect ratio.
        height={safeHeight ?? preset.h}
        priority
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

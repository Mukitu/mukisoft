'use client';

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';
import { assetPaths } from '@/lib/config/assets';
import { cn } from '@/lib/utils/cn';

/**
 * Brand logo image.
 *
 * Renders the official `logo.png` from `/assets/logo/logo.png` when present,
 * and gracefully falls back to the SVG wordmark so the navbar never breaks
 * while a real raster logo is being prepared.
 *
 * Accessibility: the rendered <img> alt text is the full company name.
 */
export function LogoImage({
  src,
  className,
  priority = false,
  width,
  height = 40,
  fallbackClassName,
  alt,
  companyName,
}: {
  /**
   * Optional override for the rendered logo. When set, this image is used
   * instead of the bundled `assetPaths.logo.primary`. A broken URL still
   * falls back to the bundled asset, then to the SVG wordmark, so an
   * admin-uploaded logo never breaks the navbar.
   */
  src?: string;
  className?: string;
  priority?: boolean;
  /**
   * Intrinsic aspect-ratio hint for next/image. Defaults to `height * 4`,
   * which matches the bundled `logo.png` (800×436 ≈ 1.83:1, capped at 4:1
   * for safety). The CSS rendered size is driven by the parent container
   * (Tailwind `h-*` utility or inline `style.height`).
   */
  width?: number;
  /**
   * Intrinsic pixel height — used by next/image for layout reservation
   * and by the rendered `<img>` as the source-of-truth `height` attribute.
   * The visible size is then controlled by the parent's height (see
   * `<Logo>` responsive ladder).
   */
  height?: number;
  fallbackClassName?: string;
  alt?: string;
  companyName: string;
}) {
  const [errored, setErrored] = React.useState(false);

  const intrinsicW = width ?? Math.round(height * 4);
  // Let the parent's height control the rendered size, while keeping the
  // intrinsic width for a correct aspect ratio. `h-full w-auto` only works
  // when the parent has an explicit height, which `<Logo>` guarantees via
  // its Tailwind ladder (`h-9 md:h-10 lg:h-11`) or inline override.
  const imageCls = cn('h-full w-auto', className);

  if (errored) {
    return (
      // The SVG fallback is purely decorative at this size — the
      // surrounding <Link> in the navbar provides the accessible name.
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={assetPaths.logo.fallback}
        alt=""
        aria-hidden="true"
        className={cn('h-full w-auto', fallbackClassName, imageCls)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src ?? assetPaths.logo.primary}
      alt={alt ?? `${companyName}`}
      width={intrinsicW}
      height={height}
      priority={priority}
      className={imageCls}
      onError={() => setErrored(true)}
    />
  );
}

/**
 * Founder portrait image.
 *
 * Renders an admin-uploaded image when one is supplied via `src`.
 * When `src` is missing or fails to load, falls back to an initials
 * monogram — never to a hardcoded local asset, so the public site
 * never shows a stale photo when no real image has been uploaded.
 *
 * `objectPosition` accepts any CSS `object-position` value (e.g.
 * `"center top"`, `"20% 30%"`) and is forwarded to the image. This
 * lets the admin frame the portrait without touching source code.
 */
export function FounderImage({
  className,
  priority = false,
  size = 'md',
  rounded = 'full',
  alt,
  src,
  objectPosition,
  companyName,
}: {
  className?: string;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'full' | 'xl' | '2xl' | '3xl';
  alt?: string;
  src?: string | null;
  objectPosition?: string;
  companyName: string;
}) {
  // Container sizes are intentionally close to the underlying image's
  // 4:5 portrait aspect ratio (width / height = 0.8) so that
  // `object-cover` doesn't aggressively crop the head out of the frame.
  // When `rounded="full"` the circle still fits inside the slightly
  // taller box, which keeps the face fully visible without an oversized
  // horizontal halo around the head.
  const dims = {
    sm: { w: 160, h: 200, container: 'h-40 w-32 md:h-48 md:w-40' },
    md: { w: 320, h: 400, container: 'h-56 w-48 md:h-72 md:w-56' },
    lg: { w: 480, h: 600, container: 'h-72 w-60 md:h-96 md:w-72' },
    xl: { w: 640, h: 800, container: 'h-96 w-80 md:h-[30rem] md:w-96' },
  }[size];

  const radiusCls = {
    full: 'rounded-full',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  }[rounded];

  const [errored, setErrored] = React.useState(false);
  const hasSrc = typeof src === 'string' && src.length > 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-ink-100 to-white ring-1 ring-ink-200/70',
        radiusCls,
        dims.container,
        className,
      )}
    >
      {hasSrc && !errored ? (
        <Image
          src={src as string}
          alt={alt ?? `${companyName} — leadership portrait`}
          width={dims.w}
          height={dims.h}
          priority={priority}
          sizes="(min-width: 768px) 320px, 192px"
          className={cn('h-full w-full object-cover', radiusCls)}
          style={objectPosition ? { objectPosition } : undefined}
          onError={() => setErrored(true)}
        />
      ) : (
        <FounderAvatar initials={companyName} radiusCls={radiusCls} />
      )}
    </div>
  );
}

/**
 * Renders `image` if present, otherwise an initials monogram. `objectPosition`
 * is forwarded to the inner image as CSS `object-position`.
 */
export function TeamAvatar({
  name,
  image,
  index,
  size = 'md',
  className,
  ringClass,
  objectPosition,
}: {
  name: string;
  image?: string;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ringClass?: string;
  objectPosition?: string;
}) {
  const dims = {
    sm: 'h-10 w-10 text-xs',
    md: 'h-14 w-14 text-base',
    lg: 'h-20 w-20 text-lg',
  }[size];

  const src = image ?? (index ? assetPaths.team.byIndex(index) : assetPaths.team.fallback);
  const [errored, setErrored] = React.useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-ink-100 to-ink-50 ring-1 ring-inset ring-ink-200',
        dims,
        ringClass,
        className,
      )}
      aria-hidden={errored ? undefined : 'true'}
    >
      {errored ? (
        <span className="font-display font-semibold tracking-tight text-ink-700">
          {initials || 'M'}
        </span>
      ) : (
        <Image
          src={src}
          alt={errored ? '' : `${name} — team photo`}
          fill
          sizes="80px"
          className="object-cover"
          style={objectPosition ? { objectPosition } : undefined}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}

/**
 * Pure-CSS monogram avatar (final fallback used when no image is reachable
 * at all). Kept here so the visual treatment stays consistent across pages.
 */
function FounderAvatar({
  initials,
  radiusCls,
}: {
  initials: string;
  radiusCls: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-100 via-white to-accent-50',
        radiusCls,
      )}
      aria-hidden="true"
    >
      <div className="flex h-3/5 w-3/5 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-inset ring-ink-200">
        <span className="font-display text-3xl tracking-tight text-ink-900 md:text-4xl">
          {initials
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 1)
            .join('')
            .toUpperCase() || 'M'}
        </span>
      </div>
    </div>
  );
}

/**
 * Portfolio image card media. Renders `<Image>` when the file is known to
 * exist (we use an eager `onError` fallback). The poster inherits the
 * project's aspect ratio and lazy-loads by default.
 */
export function PortfolioImage({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [errored, setErrored] = React.useState(false);

  if (errored) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-50 to-ink-100',
          className,
        )}
        aria-hidden="true"
      >
        <span className="font-display text-sm font-medium uppercase tracking-[0.14em] text-ink-400">
          Demo
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      className={cn('object-cover', className)}
      onError={() => setErrored(true)}
    />
  );
}

export type LogoImageProps = ImageProps;

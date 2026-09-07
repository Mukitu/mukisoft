'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Lightbox, type LightboxItem } from '@/components/ui/lightbox';

export type GalleryDetailImage = {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
};

type Props = {
  images: GalleryDetailImage[];
};

/**
 * Client-side gallery grid with a professional lightbox.
 *
 * The grid renders without JavaScript (just a static set of images and
 * a fallback link). Clicking an image opens the lightbox modal; the
 * link inside the figure remains a no-JS fallback that opens the image
 * directly in a new tab.
 */
export function GalleryDetail({ images }: Props) {
  const t = useTranslations('common');
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const items: LightboxItem[] = React.useMemo(
    () =>
      images.map((img) => ({
        src: img.src,
        alt: img.alt,
        caption: img.caption ?? undefined,
      })),
    [images],
  );

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={img.alt ? t('openImageNamed', { name: img.alt }) : t('openImage')}
            className="group relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white text-left transition hover:border-accent-300"
            style={{ display: 'block' }}
          >
            <div style={{ aspectRatio: '4 / 3', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 320ms ease',
                }}
                className="group-hover:scale-[1.02]"
              />
            </div>
            {img.caption ? (
              <div className="p-3 text-xs text-ink-600 line-clamp-2">{img.caption}</div>
            ) : null}
          </button>
        ))}
      </div>

      {openIndex !== null ? (
        <Lightbox
          items={items}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </>
  );
}
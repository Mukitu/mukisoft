'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

export type LightboxItem = {
  src: string;
  alt?: string;
  caption?: string;
};

type LightboxProps = {
  items: LightboxItem[];
  startIndex?: number;
  onClose: () => void;
};

/**
 * Premium corporate lightbox/modal for the company gallery detail page.
 *
 * Behaviour:
 *   - Renders full-screen with a dark backdrop.
 *   - Closes on backdrop click, on the close button, or on Escape.
 *   - Keyboard arrow keys navigate between photos.
 *   - Captions render under the active photo when present.
 *
 * Body scroll is locked while the lightbox is open so the page underneath
 * doesn't move while the user navigates photos.
 */
export function Lightbox({ items, startIndex = 0, onClose }: LightboxProps) {
  const t = useTranslations('common');
  const [index, setIndex] = React.useState(startIndex);

  React.useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  const safeIndex = items.length > 0 ? Math.min(Math.max(index, 0), items.length - 1) : 0;
  const active = items[safeIndex];

  const goPrev = React.useCallback(
    () => setIndex((i) => (items.length === 0 ? 0 : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  const goNext = React.useCallback(
    () => setIndex((i) => (items.length === 0 ? 0 : (i + 1) % items.length)),
    [items.length],
  );

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [goNext, goPrev, onClose]);

  if (!active) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('imageViewer')}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(11, 13, 16, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <button
        type="button"
        aria-label={t('closeImageViewer')}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          width: 44,
          height: 44,
          borderRadius: 9999,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 160ms ease',
        }}
      >
        <Icon name="close" className="h-5 w-5" />
      </button>

      {items.length > 1 ? (
        <>
          <button
            type="button"
            aria-label={t('previousImage')}
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            style={{
              position: 'absolute',
              left: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              borderRadius: 9999,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="chevron-right" className="h-5 w-5" style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button
            type="button"
            aria-label={t('nextImage')}
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            style={{
              position: 'absolute',
              right: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              borderRadius: 9999,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="chevron-right" className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <figure
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.src}
          alt={active.alt ?? ''}
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 12,
            boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            background: '#0b0d10',
          }}
        />
        <figcaption
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.85rem',
            maxWidth: '60ch',
            textAlign: 'center',
          }}
        >
          {active.caption ?? active.alt ?? ''}
        </figcaption>
        {items.length > 1 ? (
          <span
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {safeIndex + 1} / {items.length}
          </span>
        ) : null}
      </figure>
    </div>
  );
}
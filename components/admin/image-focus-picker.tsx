'use client';

import { IMAGE_FOCUS_OPTIONS, DEFAULT_IMAGE_FOCUS } from '@/lib/config/image';

/**
 * Two-part editor for portrait framing: a CSS `object-position` select
 * paired with a live 140px preview tile that re-frames as the admin picks.
 *
 * Used by the leadership and team admin forms so a non-tech editor can
 * crop how a portrait sits in its public card without touching code.
 */
export function ImageFocusPicker({
  value,
  onChange,
  imageUrl,
  imageAlt,
  hint,
  emptyLabel = 'Upload a photo to see the preview.',
}: {
  value: string;
  onChange: (next: string) => void;
  imageUrl: string | null;
  imageAlt: string;
  hint: string;
  emptyLabel?: string;
}) {
  return (
    <div className="admin-form-row cols-2">
      <div className="admin-field">
        <label>Photo focus (frame the portrait)</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {IMAGE_FOCUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>{hint}</span>
      </div>
      <div className="admin-field">
        <label>Social preview</label>
        <div
          style={{
            height: 140,
            borderRadius: 12,
            backgroundColor: 'var(--admin-bg)',
            border: '1px solid var(--admin-border)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt || 'preview'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: value || DEFAULT_IMAGE_FOCUS,
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: 'var(--admin-text-dim)',
              }}
            >
              {emptyLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/toast-provider';

const BUCKET = 'mukisoft-media';

/**
 * Maximum size we'll attempt to upload directly, in bytes (10 MB).
 *
 * Supabase Storage allows larger objects, but anything bigger than this
 * is almost certainly an uncompressed camera photo or a very large
 * screenshot. We compress it client-side before uploading to avoid
 * hitting bucket limits or wasting bandwidth.
 */
const COMPRESS_THRESHOLD_BYTES = 10 * 1024 * 1024;

/**
 * Hard upper bound — anything above this is rejected outright. Picked
 * to match the bucket `file_size_limit` configured in
 * `supabase/storage.sql` (50 MB) with some headroom.
 */
const HARD_REJECT_BYTES = 45 * 1024 * 1024;

/**
 * Maximum width/height (in pixels) we'll keep after compression.
 * 2400px is plenty for a hero image on a 4K display and keeps the
 * output JPEG well under 1 MB in most cases.
 */
const MAX_DIMENSION = 2400;

const INITIAL_QUALITY = 0.85;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

type Props = {
  /** Path prefix inside the bucket, e.g. "blog", "portfolio", "team". */
  folder: string;
  value: string | null;
  altText?: string;
  altTextPlaceholder?: string;
  showAlt?: boolean;
  /**
   * Preview shape variant:
   *   - 'default' — fixed 16:10 box, image fills via object-cover. Good
   *     for hero photos, portfolio covers, etc.
   *   - 'logo'    — wide box with a fixed height (no aspect-ratio lock)
   *     so a horizontal logo renders at its natural aspect without being
   *     shrunk into a 16:10 frame. Used by the site branding uploader.
   *   - 'favicon' — small square 1:1 box. Favicons are usually square.
   */
  variant?: 'default' | 'logo' | 'favicon';
  onChange: (next: string | null) => void;
  onAltChange?: (alt: string) => void;
};

/**
 * Admin image uploader.
 *
 * Uploads to the `mukisoft-media` Supabase Storage bucket under
 * `{folder}/`. The resulting public URL is stored on the parent
 * record (e.g. portfolio project, blog post, team member).
 *
 * The admin never has to edit source code to point at a new image.
 *
 * Large images are compressed in the browser before upload so they
 * don't hit Supabase's per-object size limit
 * ("The object exceeded the maximum allowed size").
 */
export function ImageUploader({
  folder,
  value,
  altText,
  altTextPlaceholder,
  showAlt = true,
  variant = 'default',
  onChange,
  onAltChange,
}: Props) {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (rawFile: File) => {
    if (!rawFile) return;

    if (!rawFile.type.startsWith('image/')) {
      push('Only image files can be uploaded.', 'error');
      return;
    }

    if (rawFile.size > HARD_REJECT_BYTES) {
      push(
        `Image is too large (${formatBytes(rawFile.size)}). Please use an image under ${formatBytes(HARD_REJECT_BYTES)}.`,
        'error',
      );
      return;
    }

    setBusy(true);
    setProgress(`Preparing ${rawFile.name}…`);
    try {
      const file = rawFile.size > COMPRESS_THRESHOLD_BYTES
        ? await compressImage(rawFile, (msg) => setProgress(msg))
        : rawFile;

      const supabase = createSupabaseBrowserClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
      const path = `${cleanFolder}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const { data: userData } = await supabase.auth.getUser();
      await (supabase.from('media_assets') as any).insert({
        file_name: file.name,
        storage_path: path,
        public_url: publicUrl,
        bucket: BUCKET,
        folder: cleanFolder,
        mime_type: file.type || null,
        size_bytes: file.size,
        uploaded_by: userData.user?.id ?? null,
      });
      onChange(publicUrl);
      push(
        rawFile.size !== file.size
          ? `Uploaded ${rawFile.name} (compressed to ${formatBytes(file.size)}).`
          : `Uploaded ${rawFile.name}.`,
        'success',
      );
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
      setProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="admin-image-uploader">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="admin-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
        >
          {busy ? <span className="admin-spinner" /> : null}
          {progress ?? (value ? 'Replace image' : 'Upload image')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />
        {value ? (
          <button
            type="button"
            className="admin-btn ghost"
            onClick={() => onChange(null)}
            disabled={busy}
          >
            Remove
          </button>
        ) : null}
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer noopener"
            className="admin-btn ghost"
          >
            Open
          </a>
        ) : null}
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
        Images over {formatBytes(COMPRESS_THRESHOLD_BYTES)} are automatically compressed before upload.
      </p>
      {value ? (
        <PreviewFrame variant={variant} value={value} altText={altText ?? ''} />
      ) : (
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
          No image uploaded yet. Files are stored in <code>mukisoft-media/{folder}/</code>.
        </p>
      )}
      {showAlt ? (
        <div className="admin-field" style={{ marginTop: '0.5rem' }}>
          <label>Alt text (accessibility / SEO)</label>
          <input
            type="text"
            value={altText ?? ''}
            placeholder={altTextPlaceholder ?? 'Describe the image for screen readers and SEO.'}
            onChange={(e) => onAltChange?.(e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Preview frame for an uploaded image. The shape of the frame is
 * driven by `variant`:
 *
 *   - 'default' uses a fixed 16:10 box (good for hero photos and
 *     portfolio covers). The image fills via `object-cover`.
 *   - 'logo' uses a wide open box with a fixed height — the image is
 *     contained inside so a wide horizontal logo (5:1 or 6:1 ratio)
 *     shows at its natural aspect without being shrunk into a 16:10
 *     frame and surrounded by empty space.
 *   - 'favicon' uses a small square frame.
 */
function PreviewFrame({
  variant,
  value,
  altText,
}: {
  variant: 'default' | 'logo' | 'favicon';
  value: string;
  altText: string;
}) {
  if (variant === 'logo') {
    return (
      <div
        className="admin-image-preview"
        style={{
          marginTop: '0.5rem',
          borderRadius: 12,
          // Wide, taller preview box so horizontal logos render at a
          // useful size — the navbar shows the logo at ~36px tall, so
          // the preview should be several times that to be a meaningful
          // representation of what the admin just uploaded.
          width: '100%',
          maxWidth: 560,
          height: 180,
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'repeating-conic-gradient(rgba(15,17,21,0.06) 0% 25%, transparent 0% 50%) 50% / 16px 16px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt={altText}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  if (variant === 'favicon') {
    return (
      <div
        className="admin-image-preview"
        style={{
          marginTop: '0.5rem',
          borderRadius: 12,
          aspectRatio: '1 / 1',
          width: 96,
          height: 96,
          padding: '0.5rem',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt={altText}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // default
  return (
    <div
      className="admin-image-preview"
      style={{ marginTop: '0.5rem', borderRadius: 12, aspectRatio: '16 / 10' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={value} alt={altText} />
    </div>
  );
}

/**
 * Compress an image in the browser. Returns a JPEG File under the
 * `COMPRESS_THRESHOLD_BYTES` budget when possible.
 *
 * Strategy:
 *   1. Draw the image to a canvas resized to `MAX_DIMENSION`.
 *   2. Re-encode as JPEG, stepping the quality down until the result
 *      fits under the threshold.
 *   3. If even the lowest quality is too big (very large source
 *      dimensions), return the best-effort result anyway and let the
 *      upload proceed — Supabase's own per-object limit will catch
 *      truly oversized files.
 *
 * SVG, GIF, and other non-raster inputs are returned unchanged so
 * they don't lose fidelity.
 */
async function compressImage(file: File, onProgress: (msg: string) => void): Promise<File> {
  // Only compress raster formats we can decode into <img>.
  const compressible = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  if (!compressible.includes(file.type)) {
    return file;
  }

  onProgress(`Compressing ${file.name}…`);

  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    if (typeof createImageBitmap === 'function') {
      bitmap = await createImageBitmap(file);
    } else {
      bitmap = await loadImageElement(file);
    }
  } catch {
    // If we can't decode it, just upload as-is.
    return file;
  }

  const { width: srcW, height: srcH } = 'width' in bitmap
    ? bitmap
    : { width: (bitmap as HTMLImageElement).naturalWidth, height: (bitmap as HTMLImageElement).naturalHeight };

  const scale = Math.min(1, MAX_DIMENSION / Math.max(srcW, srcH));
  const targetW = Math.max(1, Math.round(srcW * scale));
  const targetH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, targetW, targetH);
  if ('close' in bitmap && typeof (bitmap as ImageBitmap).close === 'function') {
    (bitmap as ImageBitmap).close();
  }

  let quality = INITIAL_QUALITY;
  let blob: Blob | null = await canvasToBlob(canvas, 'image/jpeg', quality);

  // Step quality down if still too large.
  while (
    blob &&
    blob.size > COMPRESS_THRESHOLD_BYTES &&
    quality > MIN_QUALITY
  ) {
    quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }

  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

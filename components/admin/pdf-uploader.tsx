'use client';

import { useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/toast-provider';

const BUCKET = 'mukisoft-media';

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB hard upper bound for research PDFs
const HARD_REJECT_BYTES = 35 * 1024 * 1024;

/**
 * Admin-only PDF uploader for research papers.
 *
 * Validation:
 *   - MIME type must be `application/pdf`.
 *   - File extension must end with `.pdf` (defensive — some browsers
 *     mis-report MIME types).
 *   - File size must fit within MAX_BYTES.
 *
 * Upload target: `mukisoft-media/research/{paper-id}/{filename}` so the
 * PDFs are isolated from portfolio / blog / gallery uploads. The
 * returned value is the public URL; the storage path is also returned
 * to the parent so it can be saved as `pdf_path` on the row.
 */
export function PdfUploader({
  paperId,
  value,
  onChange,
}: {
  paperId: string;
  value: string | null;
  onChange: (next: { url: string | null; path: string | null }) => void;
}) {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (rawFile: File) => {
    if (!rawFile) return;
    const isMimePdf = rawFile.type === 'application/pdf';
    const isExtPdf = rawFile.name.toLowerCase().endsWith('.pdf');
    if (!isMimePdf && !isExtPdf) {
      push('Only PDF files can be uploaded for research papers.', 'error');
      return;
    }
    if (rawFile.size > HARD_REJECT_BYTES) {
      push(
        `PDF is too large (${formatBytes(rawFile.size)}). Limit is ${formatBytes(MAX_BYTES)}.`,
        'error',
      );
      return;
    }

    setBusy(true);
    setProgress(`Uploading ${rawFile.name}…`);
    try {
      const supabase = createSupabaseBrowserClient();
      const safeName = rawFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `research/${paperId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, rawFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf',
      });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const { data: userData } = await supabase.auth.getUser();
      await (supabase.from('media_assets') as any).insert({
        file_name: rawFile.name,
        storage_path: path,
        public_url: publicUrl,
        bucket: BUCKET,
        folder: 'research',
        mime_type: 'application/pdf',
        size_bytes: rawFile.size,
        uploaded_by: userData.user?.id ?? null,
      });

      onChange({ url: publicUrl, path });
      push(`Uploaded ${rawFile.name}.`, 'success');
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
      setProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    try {
      const supabase = createSupabaseBrowserClient();
      const path = value.includes('/mukisoft-media/')
        ? value.split('/mukisoft-media/').pop() ?? null
        : null;
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
      onChange({ url: null, path: null });
      push('PDF removed.', 'success');
    } catch (err) {
      push((err as Error).message, 'error');
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
          {progress ?? (value ? 'Replace PDF' : 'Upload PDF')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: 'none' }}
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />
        {value ? (
          <>
            <button
              type="button"
              className="admin-btn ghost"
              onClick={handleRemove}
              disabled={busy}
            >
              Remove PDF
            </button>
            <a
              href={value}
              target="_blank"
              rel="noreferrer noopener"
              className="admin-btn ghost"
            >
              Open PDF
            </a>
          </>
        ) : null}
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
        PDF only. Maximum size {formatBytes(MAX_BYTES)}. Stored in <code>mukisoft-media/research/{paperId}/</code>.
      </p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
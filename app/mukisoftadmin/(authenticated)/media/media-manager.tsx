'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { MediaAsset } from '@/lib/supabase/types';
import { useToast } from '@/components/admin/toast-provider';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

const BUCKET = 'mukisoft-media';
const FOLDERS = ['founder/', 'team/', 'portfolio/', 'general/'];

export function MediaManager({ initial }: { initial: MediaAsset[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [items, setItems] = useState<MediaAsset[]>(initial);
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MediaAsset | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [copyId, setCopyId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await (supabase.from('media_assets') as any)
        .select('*')
        .order('created_at', { ascending: false });
      setItems((data as MediaAsset[] | null) ?? []);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    setBusy(true);
    setUploadProgress(`Uploading ${file.name}…`);
    try {
      const supabase = createSupabaseBrowserClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `${folder.replace(/\/$/, '')}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const { data: userData } = await supabase.auth.getUser();
      const { error: metaError } = await (supabase.from('media_assets') as any).insert({
        file_name: file.name,
        storage_path: path,
        public_url: publicUrl,
        bucket: BUCKET,
        folder: folder.replace(/\/$/, ''),
        mime_type: file.type || null,
        size_bytes: file.size,
        uploaded_by: userData.user?.id ?? null,
      });
      if (metaError) throw metaError;
      push(`Uploaded ${file.name}.`, 'success');
      await refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.storage.from(BUCKET).remove([asset.storage_path]);
      await (supabase.from('media_assets') as any).delete().eq('id', asset.id);
      push('Asset removed.', 'success');
      setConfirmDelete(null);
      await refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyId(id);
      push('URL copied.', 'success');
      setTimeout(() => setCopyId(null), 1500);
    } catch {
      push('Unable to copy URL.', 'error');
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="left">
          <span className="admin-pill">{items.length} assets</span>
        </div>
        <div className="right">
          <label className="admin-field" style={{ gap: 0, flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ marginRight: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>Folder</span>
            <select value={folder} onChange={(e) => setFolder(e.target.value)} style={{ marginRight: '0.5rem' }}>
              {FOLDERS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-btn primary" style={{ cursor: 'pointer' }}>
            {busy ? <span className="admin-spinner" /> : null}
            {uploadProgress ?? 'Upload image'}
            <input
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
          </label>
        </div>
      </div>

      <div className="admin-alert info" style={{ marginBottom: '1rem' }}>
        <span>
          <strong>Local assets still work.</strong> Existing images in <code>/public/assets/</code> continue to be served by Next.js. Uploaded files live in the <code>mukisoft-media</code> Supabase Storage bucket.
        </span>
      </div>

      {items.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No media uploaded yet</h4>
            <p>Use Upload image to add new assets to the <code>mukisoft-media</code> bucket.</p>
          </div>
        </div>
      ) : (
        <div className="admin-grid admin-grid-4">
          {items.map((asset) => (
            <div key={asset.id} className="admin-card">
              <div className="admin-image-preview" style={{ borderRadius: '14px 14px 0 0', aspectRatio: '4 / 3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.public_url} alt={asset.file_name} />
              </div>
              <div className="admin-card-pad">
                <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {asset.file_name}
                </div>
                <div className="admin-meta-row" style={{ marginTop: '0.25rem' }}>
                  <span>{asset.folder ?? 'general'}</span>
                  {asset.size_bytes ? <span>{formatBytes(asset.size_bytes)}</span> : null}
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="admin-btn sm"
                    onClick={() => copyUrl(asset.public_url, asset.id)}
                  >
                    {copyId === asset.id ? 'Copied' : 'Copy URL'}
                  </button>
                  <button
                    type="button"
                    className="admin-btn sm danger"
                    onClick={() => setConfirmDelete(asset)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete media asset"
        description={`Are you sure you want to delete ${confirmDelete?.file_name}? The file will be removed from storage.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
      />
    </div>
  );
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}
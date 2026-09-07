'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { adminApi } from '@/lib/supabase/admin-actions';
import { useToast } from '@/components/admin/toast-provider';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { ImageUploader } from '@/components/admin/image-uploader';
import type { GalleryEvent, GalleryImage } from '@/lib/supabase/types';

type FormState = {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  event_date: string;
  location: string;
  category: string;
  cover_image_path: string;
  cover_image_alt: string;
  external_url: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
};

type ImageFormState = {
  id?: string;
  event_id?: string;
  image_path: string;
  alt_text: string;
  caption: string;
  display_order: number;
};

function emptyForm(): FormState {
  return {
    title: '',
    slug: '',
    short_description: '',
    description: '',
    event_date: '',
    location: '',
    category: '',
    cover_image_path: '',
    cover_image_alt: '',
    external_url: '',
    is_featured: false,
    is_published: false,
    display_order: 0,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * RFC 4122 v4 UUID using `crypto.randomUUID` when available, falling
 * back to a manual `getRandomValues` implementation. Used purely as
 * a placeholder key for renaming storage folders before the real
 * event row is created.
 */
function cryptoUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
      .slice(6, 8)
      .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function fromItem(item: GalleryEvent): FormState {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    short_description: item.short_description ?? '',
    description: item.description ?? '',
    event_date: item.event_date ?? '',
    location: item.location ?? '',
    category: item.category ?? '',
    cover_image_path: item.cover_image_path ?? '',
    cover_image_alt: item.cover_image_alt ?? '',
    external_url: item.external_url ?? '',
    is_featured: item.is_featured,
    is_published: item.is_published,
    display_order: item.display_order,
  };
}

function buildStorageUrl(path: string | null | undefined): string {
  if (!path) return '';
  const supabase = createSupabaseBrowserClient();
  const { data } = supabase.storage.from('mukisoft-media').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * The admin `ImageUploader` returns a full public URL (e.g.
 * `https://xxx.supabase.co/storage/v1/object/public/mukisoft-media/gallery/abc/photo.jpg`).
 * The DB stores the **storage path** only (`gallery/abc/photo.jpg`), because
 * the public site re-derives the URL via `supabase.storage.getPublicUrl(path)`.
 * If we stored the full URL, `getPublicUrl(path)` would concatenate the bucket
 * prefix twice and produce an invalid URL — the public site would silently show
 * broken images. This helper strips the public URL prefix and returns just the
 * storage path. If the input already looks like a path, it's returned as-is.
 */
function toStoragePath(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  // Strip the public URL prefix if present.
  const marker = '/storage/v1/object/public/mukisoft-media/';
  const idx = trimmed.indexOf(marker);
  if (idx !== -1) return trimmed.slice(idx + marker.length);
  // Also handle signed URL prefix just in case.
  const signed = '/storage/v1/object/sign/mukisoft-media/';
  const idx2 = trimmed.indexOf(signed);
  if (idx2 !== -1) return trimmed.slice(idx2 + signed.length).split('?')[0];
  return trimmed;
}

type Props = {
  initialEvents: GalleryEvent[];
  initialImagesByEvent: Record<string, GalleryImage[]>;
};

export function GalleryManager({ initialEvents, initialImagesByEvent }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [events, setEvents] = useState<GalleryEvent[]>(initialEvents);
  const [imagesByEvent, setImagesByEvent] = useState<Record<string, GalleryImage[]>>(
    initialImagesByEvent,
  );
  const [editing, setEditing] = useState<GalleryEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<GalleryEvent | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events
      .filter((e) =>
        statusFilter === 'all'
          ? true
          : statusFilter === 'published'
            ? e.is_published
            : !e.is_published,
      )
      .filter((e) => {
        if (!term) return true;
        return [e.title, e.slug, e.category, e.location].some((v) =>
          (v ?? '').toLowerCase().includes(term),
        );
      });
  }, [events, search, statusFilter]);

  const refresh = async () => {
    try {
      const events = (await adminApi.list('gallery_events', {
        order: { column: 'display_order', ascending: true },
      })) as GalleryEvent[];
      const images = (await adminApi.list('gallery_images', {
        order: { column: 'display_order', ascending: true },
      })) as GalleryImage[];
      const grouped = images.reduce<Record<string, GalleryImage[]>>((acc, img) => {
        const list = acc[img.event_id] ?? [];
        list.push(img);
        acc[img.event_id] = list;
        return acc;
      }, {});
      setEvents(events);
      setImagesByEvent(grouped);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
  };
  const startEdit = (item: GalleryEvent) => {
    setCreating(false);
    setEditing(item);
  };
  const close = () => {
    setEditing(null);
    setCreating(false);
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="left">
          <span className="admin-pill">{events.length} total</span>
          <span className="admin-pill">
            {events.filter((e) => e.is_published).length} published
          </span>
          <span className="admin-pill">
            {events.filter((e) => e.is_featured).length} featured
          </span>
          <div className="admin-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="right">
          <a href="/gallery" target="_blank" rel="noreferrer noopener" className="admin-btn ghost">
            Preview public page
          </a>
          <button type="button" className="admin-btn primary" onClick={startCreate}>
            + Add event
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No gallery events yet</h4>
            <p>Add real company events as they happen. Avoid placeholder data.</p>
            <button type="button" className="admin-btn primary" onClick={startCreate}>
              + Add event
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.title}</td>
                    <td>{item.event_date ?? '—'}</td>
                    <td>{item.location ?? '—'}</td>
                    <td>{item.category ?? '—'}</td>
                    <td>{item.display_order}</td>
                    <td>
                      {item.is_published ? (
                        <span className="admin-badge is-published">Published</span>
                      ) : (
                        <span className="admin-badge is-draft">Draft</span>
                      )}
                    </td>
                    <td>
                      {item.is_featured ? (
                        <span className="admin-badge is-featured">Featured</span>
                      ) : (
                        <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-btn sm" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`admin-btn sm ${item.is_published ? '' : 'primary'}`}
                          onClick={async () => {
                            try {
                              await adminApi.update('gallery_events', item.id, {
                                is_published: !item.is_published,
                              });
                              push(item.is_published ? 'Unpublished.' : 'Published.', 'success');
                              await refresh();
                            } catch (err) {
                              push((err as Error).message, 'error');
                            }
                          }}
                        >
                          {item.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className={`admin-btn sm ${item.is_featured ? '' : 'primary'}`}
                          onClick={async () => {
                            try {
                              await adminApi.update('gallery_events', item.id, {
                                is_featured: !item.is_featured,
                              });
                              push(item.is_featured ? 'Removed from featured.' : 'Marked as featured.', 'success');
                              await refresh();
                            } catch (err) {
                              push((err as Error).message, 'error');
                            }
                          }}
                        >
                          {item.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          type="button"
                          className="admin-btn sm danger"
                          onClick={() => setConfirmDelete(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(editing || creating) ? (
        <GalleryEditor
          key={editing ? editing.id : 'new'}
          initial={editing ? fromItem(editing) : emptyForm()}
          isNew={creating}
          busy={busy}
          setBusy={setBusy}
          initialImages={editing ? imagesByEvent[editing.id] ?? [] : []}
          onClose={close}
          onSaved={async () => {
            close();
            await refresh();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete gallery event"
        description={`Are you sure you want to delete ${confirmDelete?.title}? All gallery images attached to this event will also be deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setBusy(true);
          try {
            await adminApi.remove('gallery_events', confirmDelete.id);
            push('Event deleted.', 'success');
            setConfirmDelete(null);
            await refresh();
          } catch (err) {
            push((err as Error).message, 'error');
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

function GalleryEditor({
  initial,
  isNew,
  busy,
  setBusy,
  initialImages,
  onClose,
  onSaved,
}: {
  initial: FormState;
  isNew: boolean;
  busy: boolean;
  setBusy: (b: boolean) => void;
  initialImages: GalleryImage[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const { push } = useToast();
  const [form, setForm] = useState<FormState>(initial);
  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial.id);
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [editingImage, setEditingImage] = useState<ImageFormState | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(initial.id ?? null);
  // For brand-new events, we upload gallery images into a temp folder
  // (`pending-{timestamp}/`) and buffer their metadata in
  // `pendingImages`. Once the event is created we copy those files
  // into the proper `gallery/{eventId}/` folder and insert
  // `gallery_images` rows with the real UUID.
  const [pendingFolder, setPendingFolder] = useState<string | null>(
    initial.id ? null : `pending-${Date.now()}`,
  );
  const [pendingImages, setPendingImages] = useState<ImageFormState[]>([]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugTouched) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const buildPayload = (publish: boolean) => ({
    title: form.title.trim(),
    slug: form.slug.trim() || slugify(form.title),
    short_description: form.short_description || null,
    description: form.description || null,
    event_date: form.event_date || null,
    location: form.location || null,
    category: form.category || null,
    // Persist the storage path, not the full public URL — `getPublicUrl`
    // re-derives the URL on the public site.
    cover_image_path: toStoragePath(form.cover_image_path) || null,
    cover_image_alt: form.cover_image_alt || null,
    external_url: form.external_url || null,
    display_order: Number.isFinite(form.display_order) ? Number(form.display_order) : 0,
    is_featured: form.is_featured,
    // New records default to published — the user wants them visible
    // on the public site as soon as they're saved.
    is_published: publish ? true : (form.is_published || !form.id),
  });

  /**
   * Move every uploaded object stored under `fromPrefix` into
   * `toPrefix` (e.g. `gallery/pending-123/` → `gallery/{newEventId}/`).
   *
   * Returns a mapping of `oldPath -> newPath` so the caller can rewrite
   * both local state and any buffered `pendingImages` rows.
   */
  const movePendingAssetsToEvent = async (
    fromPrefix: string,
    toPrefix: string,
  ): Promise<Map<string, string>> => {
    const supabase = createSupabaseBrowserClient();
    const { data: listed, error: listErr } = await supabase.storage
      .from('mukisoft-media')
      .list(fromPrefix, { limit: 200 });
    if (listErr) {
      // Listing failed — keep originals so the admin can recover.
      return new Map();
    }
    const renames = new Map<string, string>();
    const files = (listed ?? []).filter((f) => !f.name.endsWith('/'));
    for (const f of files) {
      const oldPath = `${fromPrefix}${f.name}`;
      const newPath = `${toPrefix}${f.name}`;
      const { error: copyErr } = await supabase.storage
        .from('mukisoft-media')
        .copy(oldPath, newPath);
      if (copyErr) continue;
      renames.set(oldPath, newPath);
    }
    if (renames.size > 0) {
      // Remove originals so we don't leak orphan files.
      await supabase.storage
        .from('mukisoft-media')
        .remove(Array.from(renames.keys()));
    }
    return renames;
  };

  const save = async (publish: boolean) => {
    if (!form.title.trim()) {
      push('Event title is required.', 'error');
      return;
    }
    if (!form.slug.trim()) {
      push('Slug is required.', 'error');
      return;
    }
    setBusy(true);
    try {
      let payload = buildPayload(publish);
      let id = form.id;
      if (form.id) {
        await adminApi.update('gallery_events', form.id, payload);
      } else {
        // First, move pending storage assets (gallery images + cover) under
        // the soon-to-be-created event folder so the new rows reference
        // real, valid paths.
        let renames = new Map<string, string>();
        let finalCoverPath = payload.cover_image_path;
        if (pendingFolder) {
          const fromPrefix = `gallery/${pendingFolder}/`;
          // The new event id doesn't exist yet — allocate the folder using
          // a uuid we generate up-front, then re-key the event row to it
          // after creation. We can do that cheaply by first creating the
          // event with a placeholder, then re-creating the folder prefix.
          // Easier: create the event first, then copy.
          // (Listing the existing event folder and copying is safe because
          // the event id is a uuid — collisions are astronomically rare.)
          const placeholderId = cryptoUUID();
          renames = await movePendingAssetsToEvent(fromPrefix, `gallery/${placeholderId}/`);
          if (renames.size > 0 && finalCoverPath && renames.has(finalCoverPath)) {
            finalCoverPath = renames.get(finalCoverPath)!;
          }
          payload = { ...payload, cover_image_path: finalCoverPath };
          const created = (await adminApi.create('gallery_events', payload)) as GalleryEvent;
          id = created.id;
          // Now relocate the assets to the real event id.
          const realFromPrefix = `gallery/${placeholderId}/`;
          const realToPrefix = `gallery/${id}/`;
          const realRenames = await movePendingAssetsToEvent(realFromPrefix, realToPrefix);
          if (realRenames.size > 0) {
            // Re-point the cover path and any pending image paths to the
            // final folder.
            if (finalCoverPath && realRenames.has(finalCoverPath)) {
              finalCoverPath = realRenames.get(finalCoverPath)!;
              await adminApi.update('gallery_events', id, { cover_image_path: finalCoverPath });
            }
            setPendingImages((prev) =>
              prev.map((p) => ({
                ...p,
                image_path: realRenames.get(p.image_path) ?? p.image_path,
              })),
            );
          }
          setCreatedEventId(id);
          setForm((f) => ({ ...f, id, cover_image_path: finalCoverPath ?? '' }));
          setPendingFolder(null);

          // Flush buffered gallery image rows into the DB.
          if (pendingImages.length > 0) {
            for (const row of pendingImages) {
              await adminApi.create('gallery_images', {
                event_id: id,
                image_path: realRenames.get(row.image_path) ?? row.image_path,
                alt_text: row.alt_text || null,
                caption: row.caption || null,
                display_order: Number.isFinite(row.display_order)
                  ? Number(row.display_order)
                  : 0,
              });
            }
            setPendingImages([]);
          }

          // Refresh the in-memory images list to include the new rows.
          const next = (await adminApi.list('gallery_images', {
            order: { column: 'display_order', ascending: true },
          })) as GalleryImage[];
          setImages(next.filter((i) => i.event_id === id));
        } else {
          // No pending assets — create the event straight away.
          const created = (await adminApi.create('gallery_events', payload)) as GalleryEvent;
          id = created.id;
          setCreatedEventId(id);
          setForm((f) => ({ ...f, id }));
        }
      }
      push(publish ? 'Event published.' : 'Saved.', 'success');
      await onSaved();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const addImage = () => {
    // We no longer require the event to be saved first. New events use
    // a `pending-{timestamp}/` folder and buffer the row in
    // `pendingImages`. Once the event has a real ID, those rows are
    // flushed into `gallery_images` with a real UUID `event_id`.
    if (!createdEventId && !pendingFolder) {
      push('Unable to open image uploader.', 'error');
      return;
    }
    setEditingImage({
      // Empty `event_id` + empty `id` signals "pending" to `saveImage`.
      event_id: createdEventId ?? '',
      image_path: '',
      alt_text: '',
      caption: '',
      display_order: images.length + pendingImages.length,
    });
  };

  const editImage = (img: GalleryImage) => {
    setEditingImage({
      id: img.id,
      event_id: img.event_id,
      image_path: img.image_path,
      alt_text: img.alt_text ?? '',
      caption: img.caption ?? '',
      display_order: img.display_order,
    });
  };

  const saveImage = async () => {
    if (!editingImage) return;
    // The ImageUploader hands back the full public URL. The DB stores the
    // storage path only — see `toStoragePath` for the conversion.
    const storagePath = toStoragePath(editingImage.image_path);
    if (!storagePath) {
      push('Upload an image first.', 'error');
      return;
    }
    setSavingImage(true);
    try {
      const isPending = !createdEventId && !editingImage.id;
      if (isPending) {
        // Buffer locally. The storage file already lives in
        // `gallery/{pendingFolder}/`; on event save we copy it under
        // `gallery/{eventId}/` and write a `gallery_images` row.
        setPendingImages((prev) => {
          const idx = prev.findIndex((p) => p.image_path === storagePath);
          const next = [...prev];
          const row: ImageFormState = {
            ...editingImage,
            image_path: storagePath,
          };
          if (idx === -1) next.push(row);
          else next[idx] = row;
          return next;
        });
        push('Image attached. Click Save Draft / Publish to attach it to the event.', 'success');
        setEditingImage(null);
        return;
      }

      const payload = {
        event_id: createdEventId,
        image_path: storagePath,
        alt_text: editingImage.alt_text || null,
        caption: editingImage.caption || null,
        display_order: Number.isFinite(editingImage.display_order)
          ? Number(editingImage.display_order)
          : 0,
      };
      if (editingImage.id) {
        await adminApi.update('gallery_images', editingImage.id, payload);
      } else {
        await adminApi.create('gallery_images', payload);
      }
      // Refresh images list
      const next = (await adminApi.list('gallery_images', {
        order: { column: 'display_order', ascending: true },
      })) as GalleryImage[];
      setImages(next.filter((i) => i.event_id === createdEventId));
      setEditingImage(null);
      push('Image saved.', 'success');
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setSavingImage(false);
    }
  };

  const removeImage = async (img: GalleryImage) => {
    if (!confirm(`Delete this image?`)) return;
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.storage.from('mukisoft-media').remove([img.image_path]);
      await adminApi.remove('gallery_images', img.id);
      const next = (await adminApi.list('gallery_images', {
        order: { column: 'display_order', ascending: true },
      })) as GalleryImage[];
      setImages(next.filter((i) => i.event_id === createdEventId));
      push('Image deleted.', 'success');
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const removePendingImage = (storagePath: string) => {
    if (!confirm('Discard this image?')) return;
    try {
      const supabase = createSupabaseBrowserClient();
      // Best-effort cleanup of the orphan file.
      supabase.storage.from('mukisoft-media').remove([storagePath]).catch(() => undefined);
      setPendingImages((prev) => prev.filter((p) => p.image_path !== storagePath));
    } catch {
      setPendingImages((prev) => prev.filter((p) => p.image_path !== storagePath));
    }
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 880, maxHeight: '92vh', overflowY: 'auto' }}>
        <h3>{isNew ? 'Add gallery event' : 'Edit gallery event'}</h3>
        <p>{isNew ? 'Create a new gallery entry.' : 'Update this event.'}</p>
        <div className="admin-form">
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Event title</label>
              <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update('slug', e.target.value);
                }}
              />
              <span className="help">URL fragment, e.g. <code>team-meetup-2026</code>.</span>
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Event date</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => update('event_date', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                placeholder="Workshop, Conference, Meetup, Award…"
              />
            </div>
            <div className="admin-field">
              <label>Display order</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => update('display_order', Number(e.target.value))}
              />
            </div>
          </div>
          <div className="admin-field">
            <label>Short description</label>
            <textarea
              value={form.short_description}
              onChange={(e) => update('short_description', e.target.value)}
              rows={2}
            />
          </div>
          <div className="admin-field">
            <label>Full description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={6}
            />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Cover image</label>
              <ImageUploader
                folder={
                  createdEventId
                    ? `gallery/${createdEventId}`
                    : pendingFolder
                      ? `gallery/${pendingFolder}`
                      : 'gallery'
                }
                value={form.cover_image_path ? buildStorageUrl(form.cover_image_path) : null}
                altText={form.cover_image_alt}
                onChange={(next) => update('cover_image_path', toStoragePath(next))}
                onAltChange={(alt) => update('cover_image_alt', alt)}
                showAlt={true}
                altTextPlaceholder="Describe the cover image for screen readers and SEO."
              />
            </div>
            <div className="admin-field">
              <label>External event URL</label>
              <input
                type="url"
                value={form.external_url}
                onChange={(e) => update('external_url', e.target.value)}
                placeholder="https://"
              />
              <label className="checkbox-row" style={{ marginTop: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => update('is_featured', e.target.checked)}
                />
                <span>Featured event</span>
              </label>
            </div>
          </div>

          {/* Gallery images */}
          <div className="admin-field" style={{ marginTop: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                Gallery photos ({images.length}
                {pendingImages.length > 0 ? ` + ${pendingImages.length} pending` : ''})
              </span>
              <button type="button" className="admin-btn sm primary" onClick={addImage}>
                + Add image
              </button>
            </label>
            {!createdEventId && pendingFolder ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)', marginTop: '0.5rem' }}>
                Photos you upload now are stored in a temporary draft folder
                (<code>gallery/{pendingFolder}/</code>) and buffered locally.
                Click Save Draft / Publish once to attach them to this event.
              </p>
            ) : null}

            {/* Pending images (not yet written to DB) */}
            {pendingImages.length > 0 ? (
              <div className="admin-gallery-list" style={{ marginTop: '0.5rem' }}>
                {pendingImages.map((img, i) => (
                  <div
                    key={`pending-${img.image_path}-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '96px 1fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.5rem',
                      border: '1px dashed var(--admin-border)',
                      borderRadius: 10,
                      marginBottom: '0.5rem',
                      background: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildStorageUrl(img.image_path)}
                      alt={img.alt_text ?? ''}
                      style={{
                        width: 96,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 8,
                        background: 'var(--ink-100, #eef0f2)',
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }} className="truncate">
                        {img.caption || img.alt_text || img.image_path.split('/').pop()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)' }}>
                        Pending — will save with the event · order {img.display_order}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        type="button"
                        className="admin-btn sm danger"
                        onClick={() => removePendingImage(img.image_path)}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {images.length > 0 ? (
              <div className="admin-gallery-list" style={{ marginTop: '0.5rem' }}>
                {images.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '96px 1fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.5rem',
                      border: '1px solid var(--admin-border)',
                      borderRadius: 10,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildStorageUrl(img.image_path)}
                      alt={img.alt_text ?? ''}
                      style={{
                        width: 96,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 8,
                        background: 'var(--ink-100, #eef0f2)',
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }} className="truncate">
                        {img.caption || img.alt_text || img.image_path.split('/').pop()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)' }}>
                        order {img.display_order}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button type="button" className="admin-btn sm" onClick={() => editImage(img)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn sm danger"
                        onClick={() => removeImage(img)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {editingImage ? (
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 10,
                }}
              >
                <div className="admin-form-row cols-2">
                  <div className="admin-field">
                    <label>Image</label>
                    <ImageUploader
                      folder={
                        createdEventId
                          ? `gallery/${createdEventId}`
                          : pendingFolder
                            ? `gallery/${pendingFolder}`
                            : 'gallery'
                      }
                      value={editingImage.image_path ? buildStorageUrl(editingImage.image_path) : null}
                      onChange={(next) =>
                        setEditingImage((e) => (e ? { ...e, image_path: toStoragePath(next) } : e))
                      }
                      showAlt={false}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={editingImage.display_order}
                      onChange={(e) =>
                        setEditingImage((s) => (s ? { ...s, display_order: Number(e.target.value) } : s))
                      }
                    />
                  </div>
                </div>
                <div className="admin-field">
                  <label>Caption</label>
                  <input
                    type="text"
                    value={editingImage.caption}
                    onChange={(e) =>
                      setEditingImage((s) => (s ? { ...s, caption: e.target.value } : s))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Alt text</label>
                  <input
                    type="text"
                    value={editingImage.alt_text}
                    onChange={(e) =>
                      setEditingImage((s) => (s ? { ...s, alt_text: e.target.value } : s))
                    }
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="admin-btn primary"
                    onClick={saveImage}
                    disabled={savingImage}
                  >
                    {savingImage ? <span className="admin-spinner" /> : null}
                    Save image
                  </button>
                  <button
                    type="button"
                    className="admin-btn ghost"
                    onClick={() => setEditingImage(null)}
                    disabled={savingImage}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="admin-modal-actions" style={{ marginTop: '1rem' }}>
          <button type="button" className="admin-btn ghost" onClick={onClose} disabled={busy}>
            Close
          </button>
          <button type="button" className="admin-btn" onClick={() => save(false)} disabled={busy}>
            {busy ? <span className="admin-spinner" /> : null}
            Save Draft
          </button>
          <button type="button" className="admin-btn primary" onClick={() => save(true)} disabled={busy}>
            {busy ? <span className="admin-spinner" /> : null}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
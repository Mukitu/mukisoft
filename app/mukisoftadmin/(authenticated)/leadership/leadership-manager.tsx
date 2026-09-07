'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/supabase/admin-actions';
import type { Leadership } from '@/lib/supabase/types';
import { useToast } from '@/components/admin/toast-provider';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploader } from '@/components/admin/image-uploader';
import { ImageFocusPicker } from '@/components/admin/image-focus-picker';
import { coerceImageFocus, DEFAULT_IMAGE_FOCUS } from '@/lib/config/image';
import { company } from '@/lib/config/company';

type FormState = {
  id?: string;
  name: string;
  position: string;
  short_bio: string;
  full_bio: string;
  education: string;
  university: string;
  professional_focus: string;
  email: string;
  phone: string;
  location: string;
  image_url: string;
  image_alt: string;
  image_focus: string;
  linkedin_url: string;
  github_url: string;
  display_order: number;
  is_published: boolean;
};

function emptyForm(): FormState {
  return {
    name: '',
    position: 'Founder & CEO',
    short_bio: '',
    full_bio: '',
    education: '',
    university: '',
    professional_focus: '',
    email: '',
    phone: '',
    location: '',
    image_url: '',
    image_alt: '',
    image_focus: 'center top',
    linkedin_url: '',
    github_url: '',
    display_order: 0,
    is_published: false,
  };
}

function fromItem(item: Leadership): FormState {
  return {
    id: item.id,
    name: item.name,
    position: item.position,
    short_bio: item.short_bio ?? '',
    full_bio: item.full_bio ?? '',
    education: item.education ?? '',
    university: item.university ?? '',
    professional_focus: (item.professional_focus ?? []).join('\n'),
    email: item.email ?? '',
    phone: item.phone ?? '',
    location: item.location ?? '',
    image_url: item.image_url ?? '',
    image_alt: item.image_alt ?? '',
    image_focus: item.image_focus ?? DEFAULT_IMAGE_FOCUS,
    linkedin_url: item.linkedin_url ?? '',
    github_url: item.github_url ?? '',
    display_order: item.display_order,
    is_published: item.is_published,
  };
}

export function LeadershipManager({ initial }: { initial: Leadership[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [items, setItems] = useState<Leadership[]>(initial);
  const [editing, setEditing] = useState<Leadership | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Leadership | null>(null);

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
  };

  const startEdit = (item: Leadership) => {
    setCreating(false);
    setEditing(item);
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
  };

  const refresh = async () => {
    try {
      const next = await adminApi.list('leadership', {
        order: { column: 'display_order', ascending: true },
      });
      setItems(next as Leadership[]);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="left">
          <span className="admin-pill">{items.length} total</span>
          <span className="admin-pill">{items.filter((i) => i.is_published).length} published</span>
        </div>
        <div className="right">
          <button type="button" className="admin-btn primary" onClick={startCreate}>
            + Add leadership profile
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No leadership profiles yet</h4>
            <p>Add the Founder & CEO first. New profiles will be hidden until you publish them.</p>
            <button type="button" className="admin-btn primary" onClick={startCreate}>
              + Add leadership profile
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.position}</td>
                    <td>{item.display_order}</td>
                    <td>
                      {item.is_published ? (
                        <span className="admin-badge is-published">Published</span>
                      ) : (
                        <span className="admin-badge is-draft">Draft</span>
                      )}
                    </td>
                    <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-btn sm"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`admin-btn sm ${item.is_published ? '' : 'primary'}`}
                          onClick={async () => {
                            try {
                              await adminApi.publishToggle('leadership', item.id, !item.is_published);
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

      {(editing || creating) && (
        <LeadershipEditor
          initial={editing ? fromItem(editing) : emptyForm()}
          isNew={creating}
          busy={busy}
          setBusy={setBusy}
          onClose={close}
          onSaved={async () => {
            close();
            await refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete leadership profile"
        description={`Are you sure you want to delete ${confirmDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setBusy(true);
          try {
            await adminApi.remove('leadership', confirmDelete.id);
            push('Profile deleted.', 'success');
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

function LeadershipEditor({
  initial,
  isNew,
  busy,
  setBusy,
  onClose,
  onSaved,
}: {
  initial: FormState;
  isNew: boolean;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const { push } = useToast();
  const [form, setForm] = useState<FormState>(initial);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = (publish: boolean) => ({
    name: form.name.trim(),
    position: form.position.trim(),
    short_bio: form.short_bio || null,
    full_bio: form.full_bio || null,
    education: form.education || null,
    university: form.university || null,
    professional_focus: form.professional_focus
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    email: form.email || null,
    phone: form.phone || null,
    location: form.location || null,
    image_url: form.image_url || null,
    image_alt: form.image_alt || null,
    image_focus: coerceImageFocus(form.image_focus),
    linkedin_url: form.linkedin_url || null,
    github_url: form.github_url || null,
    display_order: Number.isFinite(form.display_order) ? Number(form.display_order) : 0,
    // New records default to published — visible on the website as
    // soon as they're saved. Existing drafts stay drafts until the
    // user explicitly clicks Publish.
    is_published: publish ? true : (form.is_published || !form.id),
  });

  const save = async (publish: boolean) => {
    if (!form.name.trim() || !form.position.trim()) {
      push('Name and position are required.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = buildPayload(publish);
      if (form.id) {
        await adminApi.update('leadership', form.id, payload);
      } else {
        await adminApi.create('leadership', payload);
      }
      push(publish ? 'Profile published.' : 'Saved.', 'success');
      await onSaved();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>{isNew ? 'Add leadership profile' : 'Edit leadership profile'}</h3>
        <p>{isNew ? 'Create a new executive profile.' : 'Update this executive profile.'}</p>
        <div className="admin-form">
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Name</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Position</label>
              <input type="text" value={form.position} onChange={(e) => update('position', e.target.value)} />
            </div>
          </div>
          <div className="admin-field">
            <label>Short bio</label>
            <input type="text" value={form.short_bio} onChange={(e) => update('short_bio', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Full bio</label>
            <RichTextEditor value={form.full_bio} onChange={(v) => update('full_bio', v)} minHeight={140} />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Education</label>
              <input type="text" value={form.education} onChange={(e) => update('education', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>University</label>
              <input type="text" value={form.university} onChange={(e) => update('university', e.target.value)} />
            </div>
          </div>
          <div className="admin-field">
            <label>Professional focus (one per line)</label>
            <textarea
              value={form.professional_focus}
              onChange={(e) => update('professional_focus', e.target.value)}
              placeholder={'Software Architecture\nPlatform Development'}
            />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Location</label>
              <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} />
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
            <label>Photo</label>
            <ImageUploader
              folder="founder"
              value={form.image_url || null}
              altText={form.image_alt}
              altTextPlaceholder={`Describe the portrait (e.g. "${form.name} — ${form.position || 'Leadership'} of ${company.name}")`}
              showAlt
              onChange={(next) => update('image_url', next ?? '')}
              onAltChange={(alt) => update('image_alt', alt)}
            />
          </div>
          <ImageFocusPicker
            value={form.image_focus}
            onChange={(next) => update('image_focus', next)}
            imageUrl={form.image_url || null}
            imageAlt={form.image_alt || `${form.name || 'Leadership'} — preview`}
            hint="Controls how the photo is framed in the public profile card."
          />
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>LinkedIn URL</label>
              <input type="url" value={form.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>GitHub URL</label>
              <input type="url" value={form.github_url} onChange={(e) => update('github_url', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="admin-modal-actions" style={{ marginTop: '1rem' }}>
          <button type="button" className="admin-btn ghost" onClick={onClose} disabled={busy}>
            Cancel
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
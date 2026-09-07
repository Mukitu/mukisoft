'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/supabase/admin-actions';
import type { TeamMember } from '@/lib/supabase/types';
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
  role: string;
  department: string;
  bio: string;
  image_url: string;
  image_alt: string;
  image_focus: string;
  email: string;
  linkedin_url: string;
  github_url: string;
  x_url: string;
  display_order: number;
  is_published: boolean;
};

function emptyForm(): FormState {
  return {
    name: '',
    role: '',
    department: 'Engineering',
    bio: '',
    image_url: '',
    image_alt: '',
    image_focus: 'center top',
    email: '',
    linkedin_url: '',
    github_url: '',
    x_url: '',
    display_order: 0,
    is_published: false,
  };
}

function fromItem(item: TeamMember): FormState {
  return {
    id: item.id,
    name: item.name,
    role: item.role,
    department: item.department ?? '',
    bio: item.bio ?? '',
    image_url: item.image_url ?? '',
    image_alt: item.image_alt ?? '',
    image_focus: item.image_focus ?? DEFAULT_IMAGE_FOCUS,
    email: item.email ?? '',
    linkedin_url: item.linkedin_url ?? '',
    github_url: item.github_url ?? '',
    x_url: item.x_url ?? '',
    display_order: item.display_order,
    is_published: item.is_published,
  };
}

export function TeamManager({ initial }: { initial: TeamMember[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [items, setItems] = useState<TeamMember[]>(initial);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TeamMember | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.role, item.department].some((v) => (v ?? '').toLowerCase().includes(term)),
    );
  }, [items, search]);

  const refresh = async () => {
    try {
      const next = await adminApi.list('team_members', {
        order: { column: 'display_order', ascending: true },
      });
      setItems(next as TeamMember[]);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
  };
  const startEdit = (item: TeamMember) => {
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
          <span className="admin-pill">{items.length} total</span>
          <span className="admin-pill">{items.filter((i) => i.is_published).length} published</span>
          <div className="admin-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="right">
          <button type="button" className="admin-btn primary" onClick={startCreate}>
            + Add team member
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No team members yet</h4>
            <p>Add real team members as the company grows. Avoid placeholder people.</p>
            <button type="button" className="admin-btn primary" onClick={startCreate}>
              + Add team member
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
                  <th>Role</th>
                  <th>Department</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.role}</td>
                    <td>{item.department ?? '—'}</td>
                    <td>{item.display_order}</td>
                    <td>
                      {item.is_published ? (
                        <span className="admin-badge is-published">Published</span>
                      ) : (
                        <span className="admin-badge is-draft">Draft</span>
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
                              await adminApi.publishToggle('team_members', item.id, !item.is_published);
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
        <TeamEditor
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
        title="Delete team member"
        description={`Are you sure you want to delete ${confirmDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setBusy(true);
          try {
            await adminApi.remove('team_members', confirmDelete.id);
            push('Team member deleted.', 'success');
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

function TeamEditor({
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
    role: form.role.trim(),
    department: form.department || null,
    bio: form.bio || null,
    image_url: form.image_url || null,
    image_alt: form.image_alt || null,
    image_focus: coerceImageFocus(form.image_focus),
    email: form.email || null,
    linkedin_url: form.linkedin_url || null,
    github_url: form.github_url || null,
    x_url: form.x_url || null,
    display_order: Number.isFinite(form.display_order) ? Number(form.display_order) : 0,
    is_published: publish ? true : form.is_published,
  });

  const save = async (publish: boolean) => {
    if (!form.name.trim() || !form.role.trim()) {
      push('Name and role are required.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = buildPayload(publish);
      if (form.id) {
        await adminApi.update('team_members', form.id, payload);
      } else {
        await adminApi.create('team_members', payload);
      }
      push(publish ? 'Team member published.' : 'Saved.', 'success');
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
        <h3>{isNew ? 'Add team member' : 'Edit team member'}</h3>
        <p>{isNew ? 'Create a new team member profile.' : 'Update this team member.'}</p>
        <div className="admin-form">
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Name</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Role</label>
              <input type="text" value={form.role} onChange={(e) => update('role', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Department</label>
              <select value={form.department} onChange={(e) => update('department', e.target.value)}>
                <option value="">Select…</option>
                <option value="Leadership">Leadership</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="AI & Data">AI & Data</option>
                <option value="Growth">Growth</option>
                <option value="Operations">Operations</option>
              </select>
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
            <label>Bio</label>
            <RichTextEditor value={form.bio} onChange={(v) => update('bio', v)} minHeight={120} />
          </div>
          <div className="admin-field">
            <label>Photo</label>
            <ImageUploader
              folder="team"
              value={form.image_url || null}
              altText={form.image_alt}
              altTextPlaceholder={`Describe the portrait (e.g. "${form.name} — ${form.role || 'Team member'} at ${company.name}")`}
              showAlt
              onChange={(next) => update('image_url', next ?? '')}
              onAltChange={(alt) => update('image_alt', alt)}
            />
          </div>
          <ImageFocusPicker
            value={form.image_focus}
            onChange={(next) => update('image_focus', next)}
            imageUrl={form.image_url || null}
            imageAlt={form.image_alt || `${form.name || 'Team member'} — preview`}
            hint="Controls how the photo is framed in the public team card."
          />
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>LinkedIn URL</label>
              <input type="url" value={form.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>GitHub URL</label>
              <input type="url" value={form.github_url} onChange={(e) => update('github_url', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>X / Twitter URL</label>
              <input type="url" value={form.x_url} onChange={(e) => update('x_url', e.target.value)} />
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
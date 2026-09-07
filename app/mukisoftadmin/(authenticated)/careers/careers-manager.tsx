'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/supabase/admin-actions';
import type { Career } from '@/lib/supabase/types';
import { useToast } from '@/components/admin/toast-provider';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

type FormState = {
  id?: string;
  job_title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  responsibilities: string;
  requirements: string;
  nice_to_have: string;
  application_email: string;
  is_published: boolean;
};

function emptyForm(): FormState {
  return {
    job_title: '',
    department: 'Engineering',
    location: 'Remote · International',
    employment_type: 'Full-time',
    description: '',
    responsibilities: '',
    requirements: '',
    nice_to_have: '',
    application_email: 'mukitunishat@gmail.com',
    is_published: false,
  };
}

function fromItem(item: Career): FormState {
  return {
    id: item.id,
    job_title: item.job_title,
    department: item.department ?? '',
    location: item.location ?? '',
    employment_type: item.employment_type ?? '',
    description: item.description ?? '',
    responsibilities: (item.responsibilities ?? []).join('\n'),
    requirements: (item.requirements ?? []).join('\n'),
    nice_to_have: (item.nice_to_have ?? []).join('\n'),
    application_email: item.application_email ?? '',
    is_published: item.is_published,
  };
}

export function CareersManager({ initial }: { initial: Career[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [items, setItems] = useState<Career[]>(initial);
  const [editing, setEditing] = useState<Career | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Career | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.job_title, item.department, item.location].some((v) => (v ?? '').toLowerCase().includes(term)),
    );
  }, [items, search]);

  const refresh = async () => {
    try {
      const next = await adminApi.list('careers', {
        order: { column: 'created_at', ascending: false },
      });
      setItems(next as Career[]);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
  };
  const startEdit = (item: Career) => {
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
              placeholder="Search positions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="right">
          <a href="/careers" target="_blank" rel="noreferrer noopener" className="admin-btn ghost">
            Preview public page
          </a>
          <button type="button" className="admin-btn primary" onClick={startCreate}>
            + Add position
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No open positions yet</h4>
            <p>Add real positions when the company is hiring. Avoid fictional vacancies.</p>
            <button type="button" className="admin-btn primary" onClick={startCreate}>
              + Add position
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
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.job_title}</td>
                    <td>{item.department ?? '—'}</td>
                    <td>{item.location ?? '—'}</td>
                    <td>{item.employment_type ?? '—'}</td>
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
                              await adminApi.publishToggle('careers', item.id, !item.is_published);
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
        <CareerEditor
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
        title="Delete career position"
        description={`Are you sure you want to delete ${confirmDelete?.job_title}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setBusy(true);
          try {
            await adminApi.remove('careers', confirmDelete.id);
            push('Position deleted.', 'success');
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

function CareerEditor({
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
    job_title: form.job_title.trim(),
    department: form.department || null,
    location: form.location || null,
    employment_type: form.employment_type || null,
    description: form.description || null,
    responsibilities: form.responsibilities
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    requirements: form.requirements
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    nice_to_have: form.nice_to_have
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    application_email: form.application_email || null,
    // Save as draft only keeps existing records in draft state.
    // New records (form.id is undefined) ALWAYS publish by default —
    // the user obviously wants their new content visible on the site.
    is_published: publish ? true : (form.is_published || !form.id),
  });

  const save = async (publish: boolean) => {
    if (!form.job_title.trim()) {
      push('Job title is required.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = buildPayload(publish);
      if (form.id) {
        await adminApi.update('careers', form.id, payload);
      } else {
        await adminApi.create('careers', payload);
      }
      push(publish ? 'Position published.' : 'Saved.', 'success');
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
        <h3>{isNew ? 'Add position' : 'Edit position'}</h3>
        <p>{isNew ? 'Create a new open position.' : 'Update this position.'}</p>
        <div className="admin-form">
          <div className="admin-field">
            <label>Job title</label>
            <input type="text" value={form.job_title} onChange={(e) => update('job_title', e.target.value)} />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Department</label>
              <select value={form.department} onChange={(e) => update('department', e.target.value)}>
                <option value="">Select…</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="AI & Data">AI & Data</option>
                <option value="Operations">Operations</option>
                <option value="Growth">Growth</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Employment type</label>
              <select value={form.employment_type} onChange={(e) => update('employment_type', e.target.value)}>
                <option value="">Select…</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>
          <div className="admin-field">
            <label>Location</label>
            <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Responsibilities (one per line)</label>
            <textarea
              value={form.responsibilities}
              onChange={(e) => update('responsibilities', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label>Requirements (one per line)</label>
            <textarea value={form.requirements} onChange={(e) => update('requirements', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Nice-to-have (one per line)</label>
            <textarea value={form.nice_to_have} onChange={(e) => update('nice_to_have', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Application email</label>
            <input
              type="email"
              value={form.application_email}
              onChange={(e) => update('application_email', e.target.value)}
            />
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
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/supabase/admin-actions';
import type { ProcessStep } from '@/lib/supabase/types';
import { useToast } from '@/components/admin/toast-provider';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

type FormState = {
  id?: string;
  step_number: string;
  title: string;
  short_description: string;
  full_description: string;
  icon: string;
  display_order: number;
  is_published: boolean;
};

function emptyForm(): FormState {
  return {
    step_number: '',
    title: '',
    short_description: '',
    full_description: '',
    icon: '',
    display_order: 0,
    is_published: true,
  };
}

function fromItem(item: ProcessStep): FormState {
  return {
    id: item.id,
    step_number: item.step_number,
    title: item.title,
    short_description: item.short_description ?? '',
    full_description: item.full_description ?? '',
    icon: item.icon ?? '',
    display_order: item.display_order,
    is_published: item.is_published,
  };
}

export function ProcessManager({ initial }: { initial: ProcessStep[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [items, setItems] = useState<ProcessStep[]>(initial);
  const [editing, setEditing] = useState<ProcessStep | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProcessStep | null>(null);

  const refresh = async () => {
    try {
      const next = await adminApi.list('process_steps', {
        order: { column: 'display_order', ascending: true },
      });
      setItems(next as ProcessStep[]);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
  };
  const startEdit = (item: ProcessStep) => {
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
          <span className="admin-pill">{items.length} steps</span>
          <span className="admin-pill">{items.filter((i) => i.is_published).length} published</span>
        </div>
        <div className="right">
          <a href="/process" target="_blank" rel="noreferrer noopener" className="admin-btn ghost">
            Preview public page
          </a>
          <button type="button" className="admin-btn primary" onClick={startCreate}>
            + Add process step
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No process steps yet</h4>
            <p>Add the eight stages that take a project from discovery to continuous improvement.</p>
            <button type="button" className="admin-btn primary" onClick={startCreate}>
              + Add process step
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--admin-text-dim)' }}>{item.step_number}</td>
                    <td style={{ fontWeight: 500 }}>{item.title}</td>
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
                        <button type="button" className="admin-btn sm" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`admin-btn sm ${item.is_published ? '' : 'primary'}`}
                          onClick={async () => {
                            try {
                              await adminApi.publishToggle('process_steps', item.id, !item.is_published);
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
                          className="admin-btn sm"
                          disabled={busy || item.display_order <= 1}
                          onClick={async () => {
                            if (item.display_order <= 1) return;
                            try {
                              await adminApi.update('process_steps', item.id, {
                                display_order: item.display_order - 1,
                              });
                              await refresh();
                            } catch (err) {
                              push((err as Error).message, 'error');
                            }
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="admin-btn sm"
                          disabled={busy}
                          onClick={async () => {
                            try {
                              await adminApi.update('process_steps', item.id, {
                                display_order: item.display_order + 1,
                              });
                              await refresh();
                            } catch (err) {
                              push((err as Error).message, 'error');
                            }
                          }}
                        >
                          ↓
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
        <ProcessEditor
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
        title="Delete process step"
        description={`Are you sure you want to delete step ${confirmDelete?.step_number} — ${confirmDelete?.title}?`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setBusy(true);
          try {
            await adminApi.remove('process_steps', confirmDelete.id);
            push('Step deleted.', 'success');
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

function ProcessEditor({
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

  const buildPayload = () => ({
    step_number: form.step_number.trim() || String(form.display_order).padStart(2, '0'),
    title: form.title.trim(),
    short_description: form.short_description || null,
    full_description: form.full_description || null,
    icon: form.icon || null,
    display_order: Number.isFinite(form.display_order) ? Number(form.display_order) : 0,
    is_published: form.is_published,
  });

  const save = async () => {
    if (!form.title.trim()) {
      push('Title is required.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = buildPayload();
      if (form.id) {
        await adminApi.update('process_steps', form.id, payload);
      } else {
        await adminApi.create('process_steps', payload);
      }
      push('Process step saved.', 'success');
      await onSaved();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>{isNew ? 'Add process step' : 'Edit process step'}</h3>
        <p>{isNew ? 'Create a new process stage.' : 'Update this process stage.'}</p>
        <div className="admin-form">
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Step number</label>
              <input
                type="text"
                value={form.step_number}
                onChange={(e) => update('step_number', e.target.value)}
                placeholder="01"
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
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Short description</label>
            <textarea
              value={form.short_description}
              onChange={(e) => update('short_description', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label>Full description / activities (Markdown)</label>
            <textarea
              value={form.full_description}
              onChange={(e) => update('full_description', e.target.value)}
              style={{ minHeight: 140 }}
            />
          </div>
          <div className="admin-field">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => update('is_published', e.target.checked)}
              />
              <span>Published</span>
            </label>
          </div>
        </div>
        <div className="admin-modal-actions" style={{ marginTop: '1rem' }}>
          <button type="button" className="admin-btn ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="admin-btn primary" onClick={save} disabled={busy}>
            {busy ? <span className="admin-spinner" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
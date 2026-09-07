'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/supabase/admin-actions';
import type { PortfolioProject } from '@/lib/supabase/types';
import { useToast } from '@/components/admin/toast-provider';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploader } from '@/components/admin/image-uploader';

type FormState = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  industry: string;
  short_description: string;
  description: string;
  challenge: string;
  approach: string;
  solution: string;
  technology: string;
  outcome: string;
  image_url: string;
  alt_text: string;
  project_url: string;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
};

function emptyForm(): FormState {
  return {
    title: '',
    slug: '',
    category: '',
    industry: '',
    short_description: '',
    description: '',
    challenge: '',
    approach: '',
    solution: '',
    technology: '',
    outcome: '',
    image_url: '',
    alt_text: '',
    project_url: '',
    display_order: 0,
    is_featured: false,
    is_published: false,
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

function fromItem(item: PortfolioProject): FormState {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    category: item.category ?? '',
    industry: item.industry ?? '',
    short_description: item.short_description ?? '',
    description: item.description ?? '',
    challenge: item.challenge ?? '',
    approach: item.approach ?? '',
    solution: item.solution ?? '',
    technology: (item.technology ?? []).join(', '),
    outcome: (item.outcome ?? []).join('\n'),
    image_url: item.image_url ?? '',
    alt_text: item.alt_text ?? '',
    project_url: item.project_url ?? '',
    display_order: item.display_order,
    is_featured: item.is_featured,
    is_published: item.is_published,
  };
}

export function PortfolioManager({ initial }: { initial: PortfolioProject[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [items, setItems] = useState<PortfolioProject[]>(initial);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<PortfolioProject | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.title, item.category, item.industry].some((v) => (v ?? '').toLowerCase().includes(term)),
    );
  }, [items, search]);

  const refresh = async () => {
    try {
      const next = await adminApi.list('portfolio_projects', {
        order: { column: 'display_order', ascending: true },
      });
      setItems(next as PortfolioProject[]);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
  };
  const startEdit = (item: PortfolioProject) => {
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
          <span className="admin-pill">{items.filter((i) => i.is_featured).length} featured</span>
          <div className="admin-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="right">
          <a href="/portfolio" target="_blank" rel="noreferrer noopener" className="admin-btn ghost">
            Preview public page
          </a>
          <button type="button" className="admin-btn primary" onClick={startCreate}>
            + Add project
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No projects yet</h4>
            <p>Add real portfolio projects as they become available. Avoid placeholder clients.</p>
            <button type="button" className="admin-btn primary" onClick={startCreate}>
              + Add project
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
                  <th>Category</th>
                  <th>Industry</th>
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
                    <td>{item.category ?? '—'}</td>
                    <td>{item.industry ?? '—'}</td>
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
                              await adminApi.publishToggle('portfolio_projects', item.id, !item.is_published);
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
                              await adminApi.update('portfolio_projects', item.id, {
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

      {(editing || creating) && (
        <PortfolioEditor
          key={editing ? editing.id : 'new'}
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
        title="Delete portfolio project"
        description={`Are you sure you want to delete ${confirmDelete?.title}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setBusy(true);
          try {
            await adminApi.remove('portfolio_projects', confirmDelete.id);
            push('Project deleted.', 'success');
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

function PortfolioEditor({
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
  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial.id);

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
    category: form.category || null,
    industry: form.industry || null,
    short_description: form.short_description || null,
    description: form.description || null,
    challenge: form.challenge || null,
    approach: form.approach || null,
    solution: form.solution || null,
    technology: form.technology
      .split(',')
      .map((line) => line.trim())
      .filter(Boolean),
    outcome: form.outcome
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    image_url: form.image_url || null,
    alt_text: form.alt_text || null,
    project_url: form.project_url || null,
    display_order: Number.isFinite(form.display_order) ? Number(form.display_order) : 0,
    is_featured: form.is_featured,
    is_published: publish ? true : form.is_published,
  });

  const save = async (publish: boolean) => {
    if (!form.title.trim()) {
      push('Project title is required.', 'error');
      return;
    }
    if (!form.slug.trim()) {
      push('Slug is required.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = buildPayload(publish);
      if (form.id) {
        await adminApi.update('portfolio_projects', form.id, payload);
      } else {
        await adminApi.create('portfolio_projects', payload);
      }
      push(publish ? 'Project published.' : 'Saved.', 'success');
      await onSaved();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>{isNew ? 'Add portfolio project' : 'Edit portfolio project'}</h3>
        <p>{isNew ? 'Create a new portfolio entry.' : 'Update this project.'}</p>
        <div className="admin-form">
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Title</label>
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
              <span className="help">URL fragment, e.g. <code>novacart-ecommerce</code>.</span>
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Category</label>
              <input type="text" value={form.category} onChange={(e) => update('category', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Industry</label>
              <input type="text" value={form.industry} onChange={(e) => update('industry', e.target.value)} />
            </div>
          </div>
          <div className="admin-field">
            <label>Short description</label>
            <textarea
              value={form.short_description}
              onChange={(e) => update('short_description', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label>Description</label>
            <RichTextEditor value={form.description} onChange={(v) => update('description', v)} minHeight={120} />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Challenge</label>
              <textarea value={form.challenge} onChange={(e) => update('challenge', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Approach</label>
              <textarea value={form.approach} onChange={(e) => update('approach', e.target.value)} />
            </div>
          </div>
          <div className="admin-field">
            <label>Solution</label>
            <textarea value={form.solution} onChange={(e) => update('solution', e.target.value)} />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Technology (comma separated)</label>
              <input
                type="text"
                value={form.technology}
                onChange={(e) => update('technology', e.target.value)}
                placeholder="Next.js, TypeScript, PostgreSQL"
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
            <label>Outcome (one per line)</label>
            <textarea
              value={form.outcome}
              onChange={(e) => update('outcome', e.target.value)}
              placeholder={'Reference architecture for modern commerce brands\nEdge-rendered product pages'}
            />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Project image</label>
              <ImageUploader
                folder="portfolio"
                value={form.image_url || null}
                altText={form.alt_text}
                altTextPlaceholder="Describe the project image for screen readers and SEO."
                onChange={(next) => update('image_url', next ?? '')}
                onAltChange={(alt) => update('alt_text', alt)}
              />
            </div>
            <div className="admin-field">
              <label>Display order flags</label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => update('is_featured', e.target.checked)}
                />
                <span>Featured on home page</span>
              </label>
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Project URL</label>
              <input type="url" value={form.project_url} onChange={(e) => update('project_url', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>&nbsp;</label>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
                Case study URLs are no longer stored on portfolio projects.
              </p>
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
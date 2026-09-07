'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { adminApi } from '@/lib/supabase/admin-actions';
import { useToast } from '@/components/admin/toast-provider';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { ImageUploader } from '@/components/admin/image-uploader';
import { PdfUploader } from '@/components/admin/pdf-uploader';
import type { ResearchPaper, ResearchPaperAuthor, TeamMember } from '@/lib/supabase/types';

type AuthorFormState = {
  id?: string;
  name: string;
  affiliation: string;
  display_order: number;
};

type FormState = {
  id?: string;
  title: string;
  slug: string;
  abstract: string;
  description: string;
  authors: string;
  author_member_id: string;
  publication_date: string;
  publication_type: string;
  category: string;
  journal_name: string;
  conference_name: string;
  doi: string;
  pdf_path: string;
  pdf_url: string;
  external_url: string;
  cover_image_path: string;
  cover_image_alt: string;
  is_featured: boolean;
  published: boolean;
  display_order: number;
};

type TeamLite = { id: string; name: string; role: string };

function emptyForm(): FormState {
  return {
    title: '',
    slug: '',
    abstract: '',
    description: '',
    authors: '',
    author_member_id: '',
    publication_date: '',
    publication_type: '',
    category: '',
    journal_name: '',
    conference_name: '',
    doi: '',
    pdf_path: '',
    pdf_url: '',
    external_url: '',
    cover_image_path: '',
    cover_image_alt: '',
    is_featured: false,
    published: false,
    display_order: 0,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function fromItem(item: ResearchPaper): FormState {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    abstract: item.abstract ?? '',
    description: item.description ?? '',
    authors: item.authors ?? '',
    author_member_id: item.author_member_id ?? '',
    publication_date: item.publication_date ?? '',
    publication_type: item.publication_type ?? '',
    category: item.category ?? '',
    journal_name: item.journal_name ?? '',
    conference_name: item.conference_name ?? '',
    doi: item.doi ?? '',
    pdf_path: item.pdf_path ?? '',
    pdf_url: item.pdf_url ?? '',
    external_url: item.external_url ?? '',
    cover_image_path: item.cover_image_path ?? '',
    cover_image_alt: item.cover_image_alt ?? '',
    is_featured: item.is_featured,
    published: item.published,
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
 * `https://xxx.supabase.co/storage/v1/object/public/mukisoft-media/research/abc/cover.jpg`).
 * The DB stores the **storage path** only (`research/abc/cover.jpg`),
 * because the public site re-derives the URL via
 * `supabase.storage.getPublicUrl(path)`. If we stored the full URL,
 * `getPublicUrl(path)` would concatenate the bucket prefix twice and
 * produce an invalid URL — the public site would silently show broken
 * images. This helper strips the public URL prefix and returns just
 * the storage path. If the input already looks like a path, it's
 * returned as-is.
 */
function toStoragePath(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const marker = '/storage/v1/object/public/mukisoft-media/';
  const idx = trimmed.indexOf(marker);
  if (idx !== -1) return trimmed.slice(idx + marker.length);
  const signed = '/storage/v1/object/sign/mukisoft-media/';
  const idx2 = trimmed.indexOf(signed);
  if (idx2 !== -1) return trimmed.slice(idx2 + signed.length).split('?')[0];
  return trimmed;
}

/**
 * RFC 4122 v4 UUID. Used as a placeholder key for renaming storage
 * folders before the real paper row is created.
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

type Props = {
  initialPapers: ResearchPaper[];
  initialAuthorsByPaper: Record<string, ResearchPaperAuthor[]>;
  teamMembers: TeamLite[];
};

export function ResearchManager({
  initialPapers,
  initialAuthorsByPaper,
  teamMembers,
}: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [papers, setPapers] = useState<ResearchPaper[]>(initialPapers);
  const [authorsByPaper, setAuthorsByPaper] = useState<Record<string, ResearchPaperAuthor[]>>(
    initialAuthorsByPaper,
  );
  const [editing, setEditing] = useState<ResearchPaper | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ResearchPaper | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return papers
      .filter((p) =>
        statusFilter === 'all'
          ? true
          : statusFilter === 'published'
            ? p.published
            : !p.published,
      )
      .filter((p) => {
        if (!term) return true;
        return [p.title, p.slug, p.authors, p.category, p.journal_name].some((v) =>
          (v ?? '').toLowerCase().includes(term),
        );
      });
  }, [papers, search, statusFilter]);

  const refresh = async () => {
    try {
      const papers = (await adminApi.list('research_papers', {
        order: { column: 'display_order', ascending: true },
      })) as ResearchPaper[];
      const authors = (await adminApi.list('research_paper_authors', {
        order: { column: 'display_order', ascending: true },
      })) as ResearchPaperAuthor[];
      const grouped = authors.reduce<Record<string, ResearchPaperAuthor[]>>((acc, a) => {
        const list = acc[a.paper_id] ?? [];
        list.push(a);
        acc[a.paper_id] = list;
        return acc;
      }, {});
      setPapers(papers);
      setAuthorsByPaper(grouped);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
  };
  const startEdit = (item: ResearchPaper) => {
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
          <span className="admin-pill">{papers.length} total</span>
          <span className="admin-pill">
            {papers.filter((p) => p.published).length} published
          </span>
          <span className="admin-pill">
            {papers.filter((p) => p.is_featured).length} featured
          </span>
          <div className="admin-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search papers"
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
          <a href="/research" target="_blank" rel="noreferrer noopener" className="admin-btn ghost">
            Preview public page
          </a>
          <button type="button" className="admin-btn primary" onClick={startCreate}>
            + Add paper
          </button>
        </div>
      </div>

      {papers.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No research papers yet</h4>
            <p>Add real research papers and publications as they are released.</p>
            <button type="button" className="admin-btn primary" onClick={startCreate}>
              + Add paper
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
                  <th>Category</th>
                  <th>Journal</th>
                  <th>PDF</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, maxWidth: 320 }} className="truncate">
                      {item.title}
                    </td>
                    <td>{item.publication_date ?? '—'}</td>
                    <td>{item.category ?? '—'}</td>
                    <td>{item.journal_name ?? item.conference_name ?? '—'}</td>
                    <td>{item.pdf_path || item.pdf_url || item.external_url ? 'Yes' : '—'}</td>
                    <td>{item.display_order}</td>
                    <td>
                      {item.published ? (
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
                          className={`admin-btn sm ${item.published ? '' : 'primary'}`}
                          onClick={async () => {
                            try {
                              await adminApi.update('research_papers', item.id, {
                                published: !item.published,
                              });
                              push(item.published ? 'Unpublished.' : 'Published.', 'success');
                              await refresh();
                            } catch (err) {
                              push((err as Error).message, 'error');
                            }
                          }}
                        >
                          {item.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className={`admin-btn sm ${item.is_featured ? '' : 'primary'}`}
                          onClick={async () => {
                            try {
                              await adminApi.update('research_papers', item.id, {
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
        <ResearchEditor
          key={editing ? editing.id : 'new'}
          initial={editing ? fromItem(editing) : emptyForm()}
          isNew={creating}
          busy={busy}
          setBusy={setBusy}
          initialAuthors={editing ? authorsByPaper[editing.id] ?? [] : []}
          teamMembers={teamMembers}
          onClose={close}
          onSaved={async () => {
            close();
            await refresh();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete research paper"
        description={`Are you sure you want to delete ${confirmDelete?.title}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setBusy(true);
          try {
            // Best-effort cleanup of uploaded PDF + cover.
            const supabase = createSupabaseBrowserClient();
            const pathsToRemove: string[] = [];
            if (confirmDelete.pdf_path) pathsToRemove.push(confirmDelete.pdf_path);
            if (confirmDelete.cover_image_path) pathsToRemove.push(confirmDelete.cover_image_path);
            if (pathsToRemove.length > 0) {
              try {
                await supabase.storage.from('mukisoft-media').remove(pathsToRemove);
              } catch {
                /* ignore storage cleanup errors */
              }
            }
            await adminApi.remove('research_papers', confirmDelete.id);
            push('Paper deleted.', 'success');
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

function ResearchEditor({
  initial,
  isNew,
  busy,
  setBusy,
  initialAuthors,
  teamMembers,
  onClose,
  onSaved,
}: {
  initial: FormState;
  isNew: boolean;
  busy: boolean;
  setBusy: (b: boolean) => void;
  initialAuthors: ResearchPaperAuthor[];
  teamMembers: TeamLite[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const { push } = useToast();
  const [form, setForm] = useState<FormState>(initial);
  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial.id);
  const [authors, setAuthors] = useState<ResearchPaperAuthor[]>(initialAuthors);
  const [editingAuthor, setEditingAuthor] = useState<AuthorFormState | null>(null);
  const [savingAuthor, setSavingAuthor] = useState(false);
  const [createdPaperId, setCreatedPaperId] = useState<string | null>(initial.id ?? null);
  // Pending authors typed before the paper has an ID.
  const [pendingAuthors, setPendingAuthors] = useState<
    Array<{ name: string; affiliation: string; display_order: number }>
  >([]);
  // Pending uploads live under `research/pending-{timestamp}/` until the
  // paper is created. We then copy them under `research/{paperId}/` and
  // rewrite the stored paths.
  const [pendingFolder, setPendingFolder] = useState<string | null>(
    initial.id ? null : `pending-${Date.now()}`,
  );

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
    abstract: form.abstract || null,
    description: form.description || null,
    authors: form.authors || null,
    author_member_id: form.author_member_id || null,
    publication_date: form.publication_date || null,
    publication_type: form.publication_type || null,
    category: form.category || null,
    journal_name: form.journal_name || null,
    conference_name: form.conference_name || null,
    doi: form.doi || null,
    pdf_path: toStoragePath(form.pdf_path) || null,
    pdf_url: form.pdf_url || null,
    external_url: form.external_url || null,
    cover_image_path: toStoragePath(form.cover_image_path) || null,
    cover_image_alt: form.cover_image_alt || null,
    display_order: Number.isFinite(form.display_order) ? Number(form.display_order) : 0,
    is_featured: form.is_featured,
    // New records default to published so they're visible on the
    // public site immediately. Existing drafts stay drafts until the
    // user clicks Publish.
    published: publish ? true : (form.published || !form.id),
  });

  /**
   * Move every uploaded object stored under `fromPrefix` into
   * `toPrefix`. Returns a mapping of `oldPath -> newPath` so the
   * caller can rewrite `pdf_path` / `cover_image_path` afterwards.
   */
  const movePendingAssetsToPaper = async (
    fromPrefix: string,
    toPrefix: string,
  ): Promise<Map<string, string>> => {
    const supabase = createSupabaseBrowserClient();
    const { data: listed } = await supabase.storage
      .from('mukisoft-media')
      .list(fromPrefix, { limit: 200 });
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
      await supabase.storage.from('mukisoft-media').remove(Array.from(renames.keys()));
    }
    return renames;
  };

  const save = async (publish: boolean) => {
    if (!form.title.trim()) {
      push('Paper title is required.', 'error');
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
        await adminApi.update('research_papers', form.id, payload);
      } else {
        // Pre-allocate a placeholder id, migrate assets into
        // `research/{placeholder}/` and `research/covers/{placeholder}/`,
        // create the paper, then rename the folders to the final id.
        let renames = new Map<string, string>();
        let coverRenames = new Map<string, string>();
        let localPdfPath = payload.pdf_path ?? '';
        let localCoverPath = payload.cover_image_path ?? '';
        if (pendingFolder) {
          const placeholderId = cryptoUUID();
          renames = await movePendingAssetsToPaper(
            `research/${pendingFolder}/`,
            `research/${placeholderId}/`,
          );
          if (localPdfPath && renames.has(localPdfPath)) {
            localPdfPath = renames.get(localPdfPath)!;
          }
          // Cover files were uploaded to `research/covers/{pendingFolder}/`.
          coverRenames = await movePendingAssetsToPaper(
            `research/covers/${pendingFolder}/`,
            `research/covers/${placeholderId}/`,
          );
          if (localCoverPath && coverRenames.has(localCoverPath)) {
            localCoverPath = coverRenames.get(localCoverPath)!;
          }
          payload = {
            ...payload,
            pdf_path: localPdfPath || null,
            cover_image_path: localCoverPath || null,
          };
          const created = (await adminApi.create('research_papers', payload)) as ResearchPaper;
          id = created.id;
          // Relocate to the real paper id.
          const pdfRenames = await movePendingAssetsToPaper(
            `research/${placeholderId}/`,
            `research/${id}/`,
          );
          const finalCoverRenames = await movePendingAssetsToPaper(
            `research/covers/${placeholderId}/`,
            `research/covers/${id}/`,
          );
          if (pdfRenames.size > 0 && localPdfPath && pdfRenames.has(localPdfPath)) {
            localPdfPath = pdfRenames.get(localPdfPath)!;
            await adminApi.update('research_papers', id, { pdf_path: localPdfPath || null });
          }
          if (finalCoverRenames.size > 0 && localCoverPath && finalCoverRenames.has(localCoverPath)) {
            localCoverPath = finalCoverRenames.get(localCoverPath)!;
            await adminApi.update('research_papers', id, { cover_image_path: localCoverPath || null });
          }
          setForm((f) => ({
            ...f,
            id,
            pdf_path: localPdfPath,
            cover_image_path: localCoverPath,
          }));
          setCreatedPaperId(id);
          setPendingFolder(null);

          // Flush pending authors now that we have a real id.
          if (pendingAuthors.length > 0) {
            for (const a of pendingAuthors) {
              await adminApi.create('research_paper_authors', {
                paper_id: id,
                name: a.name,
                affiliation: a.affiliation.trim() || null,
                display_order: a.display_order,
              });
            }
            setPendingAuthors([]);
          }
        } else {
          const created = (await adminApi.create('research_papers', payload)) as ResearchPaper;
          id = created.id;
          setCreatedPaperId(id);
          setForm((f) => ({ ...f, id }));
        }
      }
      push(publish ? 'Paper published.' : 'Saved.', 'success');
      await onSaved();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const addAuthor = () => {
    setEditingAuthor({
      paper_id: createdPaperId ?? 'pending',
      name: '',
      affiliation: '',
      display_order: authors.length + pendingAuthors.length,
    } as AuthorFormState & { paper_id: string });
  };

  const editAuthor = (a: ResearchPaperAuthor) => {
    setEditingAuthor({
      id: a.id,
      name: a.name,
      affiliation: a.affiliation ?? '',
      display_order: a.display_order,
    });
  };

  const saveAuthor = async () => {
    if (!editingAuthor) return;
    if (!editingAuthor.name.trim()) {
      push('Author name is required.', 'error');
      return;
    }
    setSavingAuthor(true);
    try {
      if (createdPaperId) {
        const payload = {
          paper_id: createdPaperId,
          name: editingAuthor.name.trim(),
          affiliation: editingAuthor.affiliation.trim() || null,
          display_order: Number.isFinite(editingAuthor.display_order)
            ? Number(editingAuthor.display_order)
            : 0,
        };
        if (editingAuthor.id) {
          await adminApi.update('research_paper_authors', editingAuthor.id, payload);
        } else {
          await adminApi.create('research_paper_authors', payload);
        }
        const next = (await adminApi.list('research_paper_authors', {
          order: { column: 'display_order', ascending: true },
        })) as ResearchPaperAuthor[];
        setAuthors(next.filter((a) => a.paper_id === createdPaperId));
      } else {
        // No paper yet — buffer in pendingAuthors until the paper is saved.
        setPendingAuthors((prev) => [
          ...prev,
          {
            name: editingAuthor.name.trim(),
            affiliation: editingAuthor.affiliation.trim(),
            display_order: editingAuthor.display_order || prev.length,
          },
        ]);
      }
      setEditingAuthor(null);
      push('Author saved.', 'success');
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setSavingAuthor(false);
    }
  };

  const removeAuthor = async (a: ResearchPaperAuthor) => {
    if (!confirm(`Remove ${a.name} from the author list?`)) return;
    try {
      await adminApi.remove('research_paper_authors', a.id);
      const next = (await adminApi.list('research_paper_authors', {
        order: { column: 'display_order', ascending: true },
      })) as ResearchPaperAuthor[];
      setAuthors(next.filter((x) => x.paper_id === createdPaperId));
      push('Author removed.', 'success');
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const linkTeamMember = async (memberId: string) => {
    const m = teamMembers.find((t) => t.id === memberId);
    if (!m) return;
    setSavingAuthor(true);
    try {
      if (createdPaperId) {
        await adminApi.create('research_paper_authors', {
          paper_id: createdPaperId,
          name: m.name,
          affiliation: null,
          display_order: authors.length,
        });
        const next = (await adminApi.list('research_paper_authors', {
          order: { column: 'display_order', ascending: true },
        })) as ResearchPaperAuthor[];
        setAuthors(next.filter((a) => a.paper_id === createdPaperId));
      } else {
        setPendingAuthors((prev) => [
          ...prev,
          { name: m.name, affiliation: '', display_order: prev.length },
        ]);
      }
      push(`Linked ${m.name} as an author.`, 'success');
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setSavingAuthor(false);
    }
  };

  const paperIdForUploader = createdPaperId ?? 'pending';

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 920, maxHeight: '92vh', overflowY: 'auto' }}>
        <h3>{isNew ? 'Add research paper' : 'Edit research paper'}</h3>
        <p>{isNew ? 'Create a new research paper entry.' : 'Update this paper.'}</p>
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
              <span className="help">URL fragment, e.g. <code>scalable-software-engineering</code>.</span>
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Publication date</label>
              <input
                type="date"
                value={form.publication_date}
                onChange={(e) => update('publication_date', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                placeholder="Software Engineering, AI, Distributed Systems…"
              />
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Publication type</label>
              <input
                type="text"
                value={form.publication_type}
                onChange={(e) => update('publication_type', e.target.value)}
                placeholder="Journal, Conference, Pre-print, White paper…"
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
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Journal name</label>
              <input
                type="text"
                value={form.journal_name}
                onChange={(e) => update('journal_name', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Conference name</label>
              <input
                type="text"
                value={form.conference_name}
                onChange={(e) => update('conference_name', e.target.value)}
              />
            </div>
          </div>
          <div className="admin-field">
            <label>Authors (free-form, comma separated)</label>
            <input
              type="text"
              value={form.authors}
              onChange={(e) => update('authors', e.target.value)}
              placeholder="Mukitu Islam Nishat, …"
            />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Internal author (team member)</label>
              <select
                value={form.author_member_id}
                onChange={(e) => update('author_member_id', e.target.value)}
              >
                <option value="">— None —</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
              <span className="help">Links the paper to an existing team_members record.</span>
            </div>
            <div className="admin-field">
              <label>DOI</label>
              <input
                type="text"
                value={form.doi}
                onChange={(e) => update('doi', e.target.value)}
                placeholder="10.xxxx/xxxxx"
              />
            </div>
          </div>
          <div className="admin-field">
            <label>Abstract</label>
            <textarea
              value={form.abstract}
              onChange={(e) => update('abstract', e.target.value)}
              rows={4}
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
              <label>Research PDF</label>
              {createdPaperId || pendingFolder ? (
                <PdfUploader
                  paperId={createdPaperId ?? pendingFolder ?? 'pending'}
                  value={form.pdf_path ? buildStorageUrl(form.pdf_path) : null}
                  onChange={(next) =>
                    setForm((f) => ({
                      ...f,
                      pdf_path: next.path ?? '',
                    }))
                  }
                />
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)' }}>
                  Save the paper first to enable PDF upload.
                </p>
              )}
            </div>
            <div className="admin-field">
              <label>External publication URL</label>
              <input
                type="url"
                value={form.external_url}
                onChange={(e) => update('external_url', e.target.value)}
                placeholder="https://doi.org/…"
              />
              <span className="help">External link shown as &ldquo;View Publication&rdquo;.</span>
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>PDF URL (external)</label>
              <input
                type="url"
                value={form.pdf_url}
                onChange={(e) => update('pdf_url', e.target.value)}
                placeholder="https://example.com/paper.pdf"
              />
              <span className="help">Optional alternative PDF URL.</span>
            </div>
            <div className="admin-field">
              <label>Cover image</label>
              <ImageUploader
                folder={
                  createdPaperId
                    ? `research/covers/${createdPaperId}`
                    : pendingFolder
                      ? `research/covers/${pendingFolder}`
                      : 'research/covers'
                }
                value={form.cover_image_path ? buildStorageUrl(form.cover_image_path) : null}
                altText={form.cover_image_alt}
                onChange={(next) => update('cover_image_path', toStoragePath(next))}
                onAltChange={(alt) => update('cover_image_alt', alt)}
                altTextPlaceholder="Describe the cover image for screen readers and SEO."
              />
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Flags</label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => update('is_featured', e.target.checked)}
                />
                <span>Featured on research page</span>
              </label>
            </div>
            <div className="admin-field">
              <label>&nbsp;</label>
              <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', margin: 0 }}>
                Use Save Draft / Publish below to control the public visibility flag.
              </p>
            </div>
          </div>

          {/* Co-authors list */}
          <div className="admin-field" style={{ marginTop: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Co-authors ({authors.length})</span>
              <button type="button" className="admin-btn sm primary" onClick={addAuthor}>
                + Add author
              </button>
            </label>
            {!createdPaperId ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)', marginTop: '0.5rem' }}>
                Save the paper first so it has an ID.
              </p>
            ) : null}
            {teamMembers.length > 0 && createdPaperId ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', alignSelf: 'center' }}>
                  Link team member:
                </span>
                {teamMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="admin-btn sm ghost"
                    onClick={() => linkTeamMember(m.id)}
                  >
                    + {m.name}
                  </button>
                ))}
              </div>
            ) : null}
            {authors.length > 0 ? (
              <div style={{ marginTop: '0.5rem' }}>
                {authors.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '0.5rem',
                      alignItems: 'center',
                      padding: '0.5rem',
                      border: '1px solid var(--admin-border)',
                      borderRadius: 10,
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{a.name}</div>
                      {a.affiliation ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
                          {a.affiliation}
                        </div>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button type="button" className="admin-btn sm" onClick={() => editAuthor(a)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn sm danger"
                        onClick={() => removeAuthor(a)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {editingAuthor ? (
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
                    <label>Name</label>
                    <input
                      type="text"
                      value={editingAuthor.name}
                      onChange={(e) =>
                        setEditingAuthor((s) => (s ? { ...s, name: e.target.value } : s))
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Affiliation</label>
                    <input
                      type="text"
                      value={editingAuthor.affiliation}
                      onChange={(e) =>
                        setEditingAuthor((s) =>
                          s ? { ...s, affiliation: e.target.value } : s,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="admin-field">
                  <label>Display order</label>
                  <input
                    type="number"
                    value={editingAuthor.display_order}
                    onChange={(e) =>
                      setEditingAuthor((s) =>
                        s ? { ...s, display_order: Number(e.target.value) } : s,
                      )
                    }
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="admin-btn primary"
                    onClick={saveAuthor}
                    disabled={savingAuthor}
                  >
                    {savingAuthor ? <span className="admin-spinner" /> : null}
                    Save author
                  </button>
                  <button
                    type="button"
                    className="admin-btn ghost"
                    onClick={() => setEditingAuthor(null)}
                    disabled={savingAuthor}
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
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/toast-provider';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploader } from '@/components/admin/image-uploader';
import type { BlogCategory, BlogPost, BlogTag } from '@/lib/supabase/types';

type FormState = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  featured_image_alt: string;
  category_id: string;
  tag_ids: string[];
  status: 'draft' | 'published';
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
};

function emptyForm(): FormState {
  return {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    featured_image_alt: '',
    category_id: '',
    tag_ids: [],
    status: 'draft',
    is_featured: false,
    seo_title: '',
    seo_description: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
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

function tagSlugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fromItem(item: BlogPost, tagIds: string[]): FormState {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? '',
    content: item.content ?? '',
    featured_image: item.featured_image ?? '',
    featured_image_alt: item.featured_image_alt ?? '',
    category_id: item.category_id ?? '',
    tag_ids: tagIds,
    status: (item.status as 'draft' | 'published') ?? 'draft',
    is_featured: item.is_featured,
    seo_title: item.seo_title ?? '',
    seo_description: item.seo_description ?? '',
    og_title: item.og_title ?? '',
    og_description: item.og_description ?? '',
    og_image: item.og_image ?? '',
    canonical_url: item.canonical_url ?? '',
  };
}

type Props = {
  initialPosts: BlogPost[];
  initialCategories: BlogCategory[];
  initialTags: BlogTag[];
};

export function BlogManager({ initialPosts, initialCategories, initialTags }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories);
  const [tags, setTags] = useState<BlogTag[]>(initialTags);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts
      .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter((p) => {
        if (!term) return true;
        return [p.title, p.slug, p.excerpt].some((v) =>
          (v ?? '').toString().toLowerCase().includes(term),
        );
      });
  }, [posts, search, statusFilter]);

  const refresh = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await (supabase.from('blog_posts') as any)
        .select('*')
        .order('updated_at', { ascending: false });
      setPosts((data ?? []) as BlogPost[]);
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const refreshCategories = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await (supabase.from('blog_categories') as any).select('*').order('name', { ascending: true });
      setCategories((data ?? []) as BlogCategory[]);
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const refreshTags = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await (supabase.from('blog_tags') as any).select('*').order('name', { ascending: true });
      setTags((data ?? []) as BlogTag[]);
    } catch (err) {
      push((err as Error).message, 'error');
    }
  };

  const loadEditingTags = async (postId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await (supabase.from('blog_post_tags') as any)
        .select('tag_id')
        .eq('post_id', postId);
      const ids = ((data ?? []) as Array<{ tag_id: string }>).map((r) => r.tag_id);
      setEditingTagIds(ids);
      return ids;
    } catch (err) {
      push((err as Error).message, 'error');
      return [];
    }
  };

  const startCreate = () => {
    setEditing(null);
    setEditingTagIds([]);
    setCreating(true);
  };

  const startEdit = async (post: BlogPost) => {
    setCreating(false);
    setEditing(post);
    const ids = await loadEditingTags(post.id);
    setEditingTagIds(ids);
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
    setEditingTagIds([]);
  };

  const handleCreateCategory = async (name: string) => {
    if (!name.trim()) return null;
    try {
      const supabase = createSupabaseBrowserClient();
      const slug = slugify(name);
      const { data, error } = await (supabase.from('blog_categories') as any)
        .insert({ name: name.trim(), slug })
        .select('*')
        .single();
      if (error) throw error;
      push(`Category "${name}" added.`, 'success');
      await refreshCategories();
      return data as BlogCategory;
    } catch (err) {
      push((err as Error).message, 'error');
      return null;
    }
  };

  const handleCreateTag = async (name: string) => {
    if (!name.trim()) return null;
    try {
      const supabase = createSupabaseBrowserClient();
      const slug = tagSlugify(name);
      const { data, error } = await (supabase.from('blog_tags') as any)
        .insert({ name: name.trim(), slug })
        .select('*')
        .single();
      if (error) throw error;
      push(`Tag "${name}" added.`, 'success');
      await refreshTags();
      return data as BlogTag;
    } catch (err) {
      push((err as Error).message, 'error');
      return null;
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="left">
          <span className="admin-pill">{posts.length} total</span>
          <span className="admin-pill">{posts.filter((p) => p.status === 'published').length} published</span>
          <span className="admin-pill">{posts.filter((p) => p.status === 'draft').length} drafts</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} style={{ marginRight: '0.5rem' }}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div className="admin-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search posts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="right">
          <a href="/blog" target="_blank" rel="noreferrer noopener" className="admin-btn ghost">
            Preview public blog
          </a>
          <button type="button" className="admin-btn primary" onClick={startCreate}>
            + New post
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <h4>No blog posts yet</h4>
            <p>Create your first article. Drafts stay private; only published posts appear on the public blog.</p>
            <button type="button" className="admin-btn primary" onClick={startCreate}>
              + New post
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
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <tr key={post.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div>{post.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td>
                      {post.status === 'published' ? (
                        <span className="admin-badge is-published">Published</span>
                      ) : (
                        <span className="admin-badge is-draft">Draft</span>
                      )}
                    </td>
                    <td>
                      {post.is_featured ? (
                        <span className="admin-badge is-featured">Featured</span>
                      ) : (
                        <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td>{formatDate(post.updated_at)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-btn sm" onClick={() => startEdit(post)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`admin-btn sm ${post.status === 'published' ? '' : 'primary'}`}
                          onClick={async () => {
                            try {
                              const supabase = createSupabaseBrowserClient();
                              const next = post.status === 'published' ? 'draft' : 'published';
                              const patch: Record<string, unknown> = { status: next };
                              if (next === 'published' && !post.published_at) {
                                patch.published_at = new Date().toISOString();
                              }
                              const { error } = await (supabase.from('blog_posts') as any)
                                .update(patch)
                                .eq('id', post.id);
                              if (error) throw error;
                              push(next === 'published' ? 'Published.' : 'Unpublished.', 'success');
                              await refresh();
                            } catch (err) {
                              push((err as Error).message, 'error');
                            }
                          }}
                        >
                          {post.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className="admin-btn sm danger"
                          onClick={() => setConfirmDelete(post)}
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
        <BlogEditor
          initial={editing ? fromItem(editing, editingTagIds) : emptyForm()}
          isNew={creating}
          categories={categories}
          tags={tags}
          onCreateCategory={handleCreateCategory}
          onCreateTag={handleCreateTag}
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
        title="Delete blog post"
        description={`Are you sure you want to delete "${confirmDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setBusy(true);
          try {
            const supabase = createSupabaseBrowserClient();
            // Remove tag joins explicitly; FK is cascade but be defensive.
            await (supabase.from('blog_post_tags') as any).delete().eq('post_id', confirmDelete.id);
            await (supabase.from('blog_posts') as any).delete().eq('id', confirmDelete.id);
            push('Post deleted.', 'success');
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

function BlogEditor({
  initial,
  isNew,
  categories,
  tags,
  onCreateCategory,
  onCreateTag,
  busy,
  setBusy,
  onClose,
  onSaved,
}: {
  initial: FormState;
  isNew: boolean;
  categories: BlogCategory[];
  tags: BlogTag[];
  onCreateCategory: (name: string) => Promise<BlogCategory | null>;
  onCreateTag: (name: string) => Promise<BlogTag | null>;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const { push } = useToast();
  const [form, setForm] = useState<FormState>(initial);
  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial.id);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugTouched) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const buildPayload = (publish: boolean) => {
    const status = publish ? 'published' : form.status;
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt || null,
      content: form.content,
      featured_image: form.featured_image || null,
      featured_image_alt: form.featured_image_alt || null,
      category_id: form.category_id || null,
      status: publish ? 'published' : status,
      is_featured: form.is_featured,
      published_at:
        publish && status === 'published'
          ? new Date().toISOString()
          : form.status === 'published'
            ? new Date().toISOString()
            : null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      og_title: form.og_title || null,
      og_description: form.og_description || null,
      og_image: form.og_image || null,
      canonical_url: form.canonical_url || null,
    };
  };

  const saveTagsForPost = async (postId: string) => {
    const supabase = createSupabaseBrowserClient();
    await (supabase.from('blog_post_tags') as any).delete().eq('post_id', postId);
    if (form.tag_ids.length === 0) return;
    const rows = form.tag_ids.map((tagId) => ({ post_id: postId, tag_id: tagId }));
    const { error } = await (supabase.from('blog_post_tags') as any).insert(rows);
    if (error) throw error;
  };

  const save = async (publish: boolean) => {
    if (!form.title.trim()) {
      push('Title is required.', 'error');
      return;
    }
    if (!form.slug.trim()) {
      push('Slug is required.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = buildPayload(publish);
      const supabase = createSupabaseBrowserClient();
      let postId = form.id;
      if (form.id) {
        const { error } = await (supabase.from('blog_posts') as any)
          .update(payload)
          .eq('id', form.id);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase.from('blog_posts') as any)
          .insert(payload)
          .select('*')
          .single();
        if (error) throw error;
        postId = (data as BlogPost).id;
      }
      if (postId) {
        await saveTagsForPost(postId);
      }
      push(publish ? 'Post published.' : 'Draft saved.', 'success');
      await onSaved();
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 820, maxHeight: '92vh', overflowY: 'auto' }}>
        <h3>{isNew ? 'New blog post' : 'Edit blog post'}</h3>
        <p>{isNew ? 'Write a new article for the MukiSoft Technology blog.' : 'Update this article.'}</p>
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
              <span className="help">
                URL fragment, e.g. <code>how-ai-is-transforming-modern-software-development</code>. Must be unique.
              </span>
            </div>
          </div>
          <div className="admin-field">
            <label>Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              placeholder="One- or two-sentence summary shown on the blog index."
            />
          </div>
          <div className="admin-field">
            <label>Featured image</label>
            <ImageUploader
              folder="blog"
              value={form.featured_image || null}
              altText={form.featured_image_alt}
              altTextPlaceholder="Describe the image for screen readers and SEO."
              onChange={(next) => update('featured_image', next ?? '')}
              onAltChange={(alt) => update('featured_image_alt', alt)}
            />
          </div>
          <div className="admin-field">
            <label>Content</label>
            <RichTextEditor
              value={form.content}
              onChange={(v) => update('content', v)}
              minHeight={220}
              placeholder="Write your article here. Use the toolbar for headings, bold, italic, links and lists."
            />
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>Category</label>
              <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                <input
                  type="text"
                  value={newCategory}
                  placeholder="New category"
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-btn sm"
                  disabled={busy || !newCategory.trim()}
                  onClick={async () => {
                    const created = await onCreateCategory(newCategory);
                    if (created) {
                      update('category_id', created.id);
                      setNewCategory('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            <div className="admin-field">
              <label>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                {tags.map((tag) => {
                  const active = form.tag_ids.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`admin-pill ${active ? 'is-published' : ''}`}
                      style={{ cursor: 'pointer', border: 0 }}
                      onClick={() =>
                        update(
                          'tag_ids',
                          active ? form.tag_ids.filter((id) => id !== tag.id) : [...form.tag_ids, tag.id],
                        )
                      }
                    >
                      {active ? '✓ ' : ''}
                      {tag.name}
                    </button>
                  );
                })}
                {tags.length === 0 ? (
                  <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.75rem' }}>No tags yet.</span>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  value={newTag}
                  placeholder="New tag"
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-btn sm"
                  disabled={busy || !newTag.trim()}
                  onClick={async () => {
                    const created = await onCreateTag(newTag);
                    if (created) {
                      update('tag_ids', [...form.tag_ids, created.id]);
                      setNewTag('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>SEO title</label>
              <input type="text" value={form.seo_title} onChange={(e) => update('seo_title', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>SEO description</label>
              <input type="text" value={form.seo_description} onChange={(e) => update('seo_description', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>OG title</label>
              <input type="text" value={form.og_title} onChange={(e) => update('og_title', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>OG description</label>
              <input type="text" value={form.og_description} onChange={(e) => update('og_description', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row cols-2">
            <div className="admin-field">
              <label>OG image URL (optional)</label>
              <input type="text" value={form.og_image} onChange={(e) => update('og_image', e.target.value)} placeholder="/og.svg" />
            </div>
            <div className="admin-field">
              <label>Canonical URL</label>
              <input type="url" value={form.canonical_url} onChange={(e) => update('canonical_url', e.target.value)} />
            </div>
          </div>
          <div className="admin-field">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => update('is_featured', e.target.checked)}
              />
              <span>Mark as featured</span>
            </label>
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

function formatDate(value: string) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}
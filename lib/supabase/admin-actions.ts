'use client';

import { createSupabaseBrowserClient } from './client';
import { invalidatePublicCache, type InvalidateOptions } from './admin-cache';

/**
 * Generic browser-side CRUD helpers for the admin tables.
 *
 * Always uses the browser client — RLS policies grant full access to
 * authenticated admins and only read access to anonymous visitors.
 * The service-role key is never used here.
 *
 * Every mutation (create / update / delete / publishToggle / status
 * toggle) flushes the public site's edge cache via
 * `invalidatePublicCache`, so the dashboard and the live site stay
 * in lockstep — no waiting on the 60s revalidate window.
 */
type TableName =
  | 'portfolio_projects'
  | 'team_members'
  | 'leadership'
  | 'process_steps'
  | 'careers'
  | 'about_pages'
  | 'site_settings'
  | 'media_assets'
  | 'admin_users'
  | 'blog_posts'
  | 'blog_categories'
  | 'blog_tags'
  | 'blog_post_tags'
  | 'gallery_events'
  | 'gallery_images'
  | 'research_papers'
  | 'research_paper_authors';

const TABLE_TO_CACHE_OPTS: Record<TableName, InvalidateOptions | null> = {
  // Tables that affect public pages — flush the matching cache.
  site_settings: { tables: ['site_settings'] },
  about_pages: { tables: ['about_pages'] },
  leadership: { tables: ['leadership'] },
  team_members: { tables: ['team_members'] },
  process_steps: { tables: ['process_steps'] },
  careers: { tables: ['careers'] },
  portfolio_projects: { tables: ['portfolio_projects'] },
  blog_posts: { tables: ['blog_posts'] },
  blog_categories: { tables: ['blog_categories'] },
  blog_tags: { tables: ['blog_tags'] },
  gallery_events: { tables: ['gallery_events'] },
  gallery_images: { tables: ['gallery_images'] },
  research_papers: { tables: ['research_papers'] },
  research_paper_authors: { tables: ['research_paper_authors'] },

  // Internal/admin-only tables — no public cache to flush.
  media_assets: null,
  admin_users: null,
  blog_post_tags: null,
};

function flushCache(table: TableName, extra?: Partial<InvalidateOptions>): Promise<void> {
  const base = TABLE_TO_CACHE_OPTS[table];
  if (!base) return Promise.resolve();
  return invalidatePublicCache({ ...base, ...extra });
}

export const adminApi = {
  async list(
    table: TableName,
    options?: { order?: { column: string; ascending?: boolean }; filter?: Record<string, unknown> },
  ): Promise<unknown[]> {
    const supabase = createSupabaseBrowserClient();
    // Cast to any to keep the helper ergonomic — the table schemas
    // are enforced by RLS and by the runtime payload shape, not by
    // the SDK's generic typings here.
    let query: any = supabase.from(table).select('*');
    if (options?.filter) {
      for (const [key, value] of Object.entries(options.filter)) {
        query = query.eq(key, value);
      }
    }
    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown[];
  },

  async get(table: TableName, id: string): Promise<unknown | null> {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await (supabase.from(table) as any).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ?? null;
  },

  async create(table: TableName, payload: Record<string, unknown>): Promise<unknown> {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await (supabase.from(table) as any).insert(payload).select('*').single();
    if (error) throw error;
    await flushCache(table);
    return data;
  },

  async update(table: TableName, id: string, payload: Record<string, unknown>): Promise<unknown> {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await (supabase.from(table) as any).update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    // If a portfolio row carries a slug, flush its per-slug tag too so
    // /work/[slug] is refreshed immediately.
    const slug = typeof (payload as { slug?: unknown }).slug === 'string' ? (payload as { slug: string }).slug : undefined;
    await flushCache(table, slug ? { slug } : undefined);
    return data;
  },

  async remove(table: TableName, id: string): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await (supabase.from(table) as any).delete().eq('id', id);
    if (error) throw error;
    await flushCache(table);
  },

  async publishToggle(table: TableName, id: string, next: boolean): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await (supabase.from(table) as any).update({ is_published: next }).eq('id', id);
    if (error) throw error;
    await flushCache(table);
  },

  async publishStatusToggle(table: TableName, id: string, next: 'draft' | 'published'): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await (supabase.from(table) as any).update({ status: next }).eq('id', id);
    if (error) throw error;
    await flushCache(table);
  },
};

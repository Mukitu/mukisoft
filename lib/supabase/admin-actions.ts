'use client';

import { createSupabaseBrowserClient } from './client';

/**
 * Generic browser-side CRUD helpers for the admin tables.
 *
 * Always uses the browser client — RLS policies grant full access to
 * authenticated admins and only read access to anonymous visitors.
 * The service-role key is never used here.
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
    return data;
  },

  async update(table: TableName, id: string, payload: Record<string, unknown>): Promise<unknown> {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await (supabase.from(table) as any).update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },

  async remove(table: TableName, id: string): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await (supabase.from(table) as any).delete().eq('id', id);
    if (error) throw error;
  },

  async publishToggle(table: TableName, id: string, next: boolean): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await (supabase.from(table) as any).update({ is_published: next }).eq('id', id);
    if (error) throw error;
  },

  async publishStatusToggle(table: TableName, id: string, next: 'draft' | 'published'): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await (supabase.from(table) as any).update({ status: next }).eq('id', id);
    if (error) throw error;
  },
};
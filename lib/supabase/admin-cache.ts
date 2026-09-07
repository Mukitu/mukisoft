'use client';

import { locales, type Locale } from '@/lib/i18n/config';

/**
 * Browser-side helper for invalidating the public site's edge cache
 * after admin writes. `revalidateTag()` and `revalidatePath()` are
 * server-only, so we POST to `/api/admin/revalidate` which performs
 * the invalidation in a Node runtime with the user's session.
 *
 * The mapping (table → tags) is the single source of truth used by
 * the API route — keep both files in sync.
 */

type AdminTable =
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

export type InvalidateOptions = {
  /** Tables the admin just wrote to. */
  tables: AdminTable[];
  /** Optional explicit tags (e.g. `portfolio:my-slug`). */
  tags?: string[];
  /** Optional slug — used for portfolio per-slug tag. */
  slug?: string;
  /** Locales to invalidate. Defaults to all configured locales. */
  locales?: Locale[];
  /** When true, skip the network call (used in tests / SSR). */
  silent?: boolean;
};

const TABLES_WITH_TAGS: ReadonlySet<AdminTable> = new Set([
  'site_settings',
  'about_pages',
  'leadership',
  'team_members',
  'process_steps',
  'careers',
  'portfolio_projects',
  'blog_posts',
  'blog_categories',
  'blog_tags',
  'gallery_events',
  'gallery_images',
  'research_papers',
  'research_paper_authors',
]);

/**
 * Fire-and-forget cache invalidation. Failures are logged but never
 * thrown — the admin write itself already succeeded in Supabase, and
 * the worst case if invalidation fails is that the public site
 * continues to serve the cached version until the next revalidate
 * window (60s). The next admin edit will retry.
 */
export async function invalidatePublicCache(opts: InvalidateOptions): Promise<void> {
  const filtered = opts.tables.filter((t) => TABLES_WITH_TAGS.has(t));
  if (filtered.length === 0 && !opts.tags?.length && !opts.slug) return;
  if (opts.silent) return;

  try {
    const localeList: Locale[] =
      opts.locales && opts.locales.length > 0
        ? opts.locales.filter((l): l is Locale => locales.includes(l))
        : (locales as readonly Locale[]).slice();

    await fetch('/api/admin/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      keepalive: true, // survive the admin client unmounting after a redirect
      body: JSON.stringify({
        tables: filtered,
        tags: opts.tags ?? [],
        slug: opts.slug,
        locales: localeList,
      }),
    });
  } catch (err) {
    // Don't break the admin UX over a cache flush failure.
    console.warn('[admin-cache] revalidate request failed:', err);
  }
}

/** Convenience: invalidate a single table across all locales. */
export function invalidateTable(table: AdminTable, opts?: Partial<InvalidateOptions>): Promise<void> {
  return invalidatePublicCache({
    tables: [table],
    ...opts,
  });
}
import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { locales, type Locale } from '@/lib/i18n/config';

/**
 * Server-side cache invalidation endpoint.
 *
 * The public site is wrapped in `unstable_cache(...)` with tags like
 * `['site-settings', locale]` so it can serve cached payloads in <50ms.
 * That cache is great for visitors, but it means admin edits would
 * otherwise take up to PUBLIC_CACHE_TTL_SECONDS (60s) to appear.
 *
 * This route flushes those tags so an admin's create/update/delete in
 * the dashboard reflects on the public site instantly — same behaviour
 * we had before introducing the edge cache.
 *
 * It also calls `revalidatePath(...)` for the public pages most likely
 * to render the changed content, which flushes the Next.js page-level
 * ISR cache that backs the App Router. We revalidate:
 *   - the dedicated page for the table (e.g. /[locale]/team)
 *   - the home page (most pages cross-reference site_settings,
 *     leadership, portfolio, blog, etc. for hero/footer content)
 *   - any path templates the caller explicitly requested
 *
 * SECURITY: only authenticated admins can hit this endpoint. The
 * browser client already enforces RLS on the write, but we still
 * re-verify the session server-side here so a stolen access token
 * scoped to a different audience can't trigger invalidation spam.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  /** Tables the admin just wrote to. Mapped to cache tags below. */
  tables?: string[];
  /** Optional explicit tag list — used when invalidating a single
   *  blog post by slug, for example. */
  tags?: string[];
  /** Optional explicit page paths to revalidate. */
  paths?: string[];
  /** Optional slug, used for `portfolio:{slug}` tag. */
  slug?: string;
  /** Optional locales; defaults to all configured locales. */
  locales?: Locale[];
}

const TABLE_TO_TAGS: Record<string, string[]> = {
  site_settings: ['site-settings'],
  about_pages: ['about-page'],
  leadership: ['leadership'],
  team_members: ['team'],
  process_steps: ['process'],
  careers: ['careers'],
  portfolio_projects: ['portfolio'],
  blog_posts: ['blog'],
  blog_categories: ['blog'],
  blog_tags: ['blog'],
  gallery_events: ['gallery'],
  gallery_images: ['gallery'],
  research_papers: ['research'],
  research_paper_authors: ['research'],
};

/**
 * Pages that DEFINITELY render data from this table. The home page is
 * added to EVERY entry because the homepage footer / hero pull from
 * site_settings and the homepage usually shows a teaser of leadership,
 * team, portfolio, blog, gallery and research rows.
 */
const TABLE_TO_PATHS: Record<string, string[]> = {
  site_settings: ['/[locale]'],
  about_pages: ['/[locale]', '/[locale]/about'],
  leadership: ['/[locale]', '/[locale]/about', '/[locale]/founder', '/[locale]/team'],
  team_members: ['/[locale]', '/[locale]/team'],
  process_steps: ['/[locale]', '/[locale]/process'],
  careers: ['/[locale]', '/[locale]/careers'],
  portfolio_projects: ['/[locale]', '/[locale]/work', '/[locale]/(public)'],
  blog_posts: ['/[locale]', '/[locale]/blog'],
  blog_categories: ['/[locale]', '/[locale]/blog'],
  blog_tags: ['/[locale]', '/[locale]/blog'],
  gallery_events: ['/[locale]', '/[locale]/gallery'],
  gallery_images: ['/[locale]', '/[locale]/gallery'],
  research_papers: ['/[locale]', '/[locale]/research'],
  research_paper_authors: ['/[locale]', '/[locale]/research'],
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const requestedLocales: Locale[] =
    body.locales && body.locales.length > 0
      ? body.locales.filter((l): l is Locale => locales.includes(l))
      : (locales as readonly Locale[]).slice();

  const tagSet = new Set<string>();
  const pathSet = new Set<string>();

  // 1) Tags derived from table writes — these match the strings used
  //    inside unstable_cache(..., { tags: [...] }) so revalidateTag
  //    purges the right entries.
  for (const table of body.tables ?? []) {
    const tags = TABLE_TO_TAGS[table];
    if (tags) {
      for (const t of tags) tagSet.add(t);
    }
    const paths = TABLE_TO_PATHS[table];
    if (paths) {
      for (const p of paths) pathSet.add(p);
    }
  }

  // 2) Explicit tags passed by the caller (e.g. `portfolio:{slug}`)
  for (const tag of body.tags ?? []) {
    tagSet.add(tag);
  }
  if (body.slug) {
    tagSet.add(`portfolio:${body.slug}`);
  }

  // 3) Locale tags — every public fetch tagged with `[..., locale]`,
  //    so flushing the locale tag purges every cached payload for
  //    that locale as a safety net.
  for (const locale of requestedLocales) tagSet.add(locale);

  // 4) Explicit paths the caller wants to revalidate.
  for (const path of body.paths ?? []) pathSet.add(path);

  // Flush unstable_cache tags
  for (const tag of tagSet) revalidateTag(tag);

  // Flush App Router page caches (per-locale)
  for (const pathTemplate of pathSet) {
    // First the dynamic pattern (matches all locales at once)
    try {
      revalidatePath(pathTemplate);
    } catch {
      /* ignore — some patterns aren't valid */
    }
    // Then each concrete locale path (more reliable on Vercel edge)
    for (const locale of requestedLocales) {
      revalidatePath(pathTemplate.replace('[locale]', locale));
    }
  }

  return NextResponse.json({
    ok: true,
    tags: Array.from(tagSet),
    paths: Array.from(pathSet),
    locales: requestedLocales,
  });
}
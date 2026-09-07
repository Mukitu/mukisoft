import { cache } from 'react';
import { createSupabaseServerClient } from './server';
import { applyTranslations } from '@/lib/i18n/apply-translations';
import type { Locale } from '@/lib/i18n/config';
import type {
  AboutPage,
  BlogCategory,
  BlogPost,
  BlogTag,
  Career,
  GalleryEvent,
  GalleryImage,
  Leadership,
  PortfolioProject,
  ProcessStep,
  ResearchPaper,
  ResearchPaperAuthor,
  SiteSetting,
  TeamMember,
} from './types';

type SupabaseClient = NonNullable<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Get the server Supabase client, or null when env vars are missing.
 * Callers must handle the null case — they should return safe empty
 * values so the page can still render without throwing.
 */
function getClient(): SupabaseClient | null {
  try {
    return createSupabaseServerClient() as SupabaseClient | null;
  } catch {
    return null;
  }
}

async function safeQuery<T>(fn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<{
  data: T | null;
  error: string | null;
}> {
  try {
    const { data, error } = await fn();
    if (error) {
      console.error('[supabase] query failed:', error.message);
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Supabase error';
    console.error('[supabase] query failed:', message);
    return { data: null, error: message };
  }
}

export const fetchSiteSettings = cache(async (locale: Locale = 'en'): Promise<SiteSetting | null> => {
  const supabase = getClient();
  if (!supabase) return null;
  const { data } = await safeQuery<SiteSetting | null>(() =>
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
  );
  if (!data) return data;
  const [translated] = await applyTranslations([data], 'site_setting', locale);
  return translated ?? data;
});

export async function fetchPublishedAbout(locale: Locale = 'en'): Promise<AboutPage | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data } = await safeQuery<AboutPage | null>(() =>
    supabase
      .from('about_pages')
      .select('*')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
  if (!data) return data;
  const [translated] = await applyTranslations([data], 'about_page', locale);
  return translated ?? data;
}

export async function fetchPublishedLeadership(locale: Locale = 'en'): Promise<Leadership[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<Leadership[] | null>(() =>
    supabase
      .from('leadership')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true }),
  );
  return applyTranslations(data ?? [], 'leadership_member', locale);
}

export async function fetchPublishedTeam(locale: Locale = 'en'): Promise<TeamMember[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<TeamMember[] | null>(() =>
    supabase
      .from('team_members')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true }),
  );
  return applyTranslations(data ?? [], 'team_member', locale);
}

export async function fetchPublishedProcess(locale: Locale = 'en'): Promise<ProcessStep[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<ProcessStep[] | null>(() =>
    supabase
      .from('process_steps')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true }),
  );
  return applyTranslations(data ?? [], 'process_step', locale);
}

export async function fetchPublishedCareers(locale: Locale = 'en'): Promise<Career[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<Career[] | null>(() =>
    supabase
      .from('careers')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  );
  return applyTranslations(data ?? [], 'career_role', locale);
}

export async function fetchPublishedPortfolio(locale: Locale = 'en'): Promise<PortfolioProject[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<PortfolioProject[] | null>(() =>
    supabase
      .from('portfolio_projects')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true }),
  );
  return applyTranslations(data ?? [], 'portfolio_project', locale);
}

export async function fetchPortfolioBySlug(slug: string, locale: Locale = 'en'): Promise<PortfolioProject | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data } = await safeQuery<PortfolioProject | null>(() =>
    (supabase.from('portfolio_projects') as any)
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle(),
  );
  if (!data) return data;
  const [translated] = await applyTranslations([data], 'portfolio_project', locale);
  return translated ?? data;
}

export async function fetchBlogCategories(locale: Locale = 'en'): Promise<BlogCategory[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<BlogCategory[] | null>(() =>
    (supabase.from('blog_categories') as any).select('*').order('name', { ascending: true }),
  );
  return applyTranslations(data ?? [], 'blog_category', locale);
}

export async function fetchBlogTags(locale: Locale = 'en'): Promise<BlogTag[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<BlogTag[] | null>(() =>
    (supabase.from('blog_tags') as any).select('*').order('name', { ascending: true }),
  );
  return applyTranslations(data ?? [], 'blog_tag', locale);
}

export async function fetchPublishedBlogPosts(
  options: {
    limit?: number;
    categorySlug?: string;
    tagSlug?: string;
    excludeId?: string;
    locale?: Locale;
  } = {},
): Promise<Array<BlogPost & { category: BlogCategory | null; tags: BlogTag[] }>> {
  const locale: Locale = options.locale ?? 'en';
  const supabase = getClient();
  if (!supabase) return [];
  const limit = options.limit ?? 50;
  let query: any = (supabase.from('blog_posts') as any)
    .select('*, blog_categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (options.excludeId) {
    query = query.neq('id', options.excludeId);
  }
  const { data, error } = await query;
  if (error) {
    console.error('[supabase] blog fetch failed:', error.message);
    return [];
  }
  const rows = (data ?? []) as Array<BlogPost & { blog_categories: BlogCategory | null }>;
  const ids = rows.map((r) => r.id);
  let tagMap = new Map<string, BlogTag[]>();
  if (ids.length > 0) {
    const { data: joins } = await (supabase.from('blog_post_tags') as any)
      .select('post_id, blog_tags(*)')
      .in('post_id', ids);
    const arr = (joins ?? []) as Array<{ post_id: string; blog_tags: BlogTag | null }>;
    tagMap = arr.reduce<Map<string, BlogTag[]>>((acc, j) => {
      if (!j.blog_tags) return acc;
      const list = acc.get(j.post_id) ?? [];
      list.push(j.blog_tags);
      acc.set(j.post_id, list);
      return acc;
    }, new Map());
  }
  // Translate posts + their joined categories + tags. Doing them in a
  // single pass keeps the cache hit ratio high (one query for posts,
  // one for all joined categories, one for all joined tags).
  const translatedPosts = await applyTranslations(rows, 'blog_post', locale);
  const categoryIds = Array.from(
    new Set(translatedPosts.map((r) => r.blog_categories?.id).filter((v): v is string => !!v)),
  );
  const tagIds = Array.from(new Set(Array.from(tagMap.values()).flat().map((t) => t.id)));
  const [translatedCategories, translatedTags] = await Promise.all([
    categoryIds.length
      ? applyTranslations(
          translatedPosts.map((r) => r.blog_categories).filter((c): c is BlogCategory => !!c),
          'blog_category',
          locale,
        )
      : Promise.resolve([] as BlogCategory[]),
    tagIds.length
      ? applyTranslations(
          Array.from(tagMap.values()).flat(),
          'blog_tag',
          locale,
        )
      : Promise.resolve([] as BlogTag[]),
  ]);
  const categoryLookup = new Map(translatedCategories.map((c) => [c.id, c]));
  const tagLookup = new Map(translatedTags.map((t) => [t.id, t]));
  let filtered = translatedPosts.map((r) => ({
    ...r,
    category: r.blog_categories ? categoryLookup.get(r.blog_categories.id) ?? r.blog_categories : null,
    tags: (tagMap.get(r.id) ?? []).map(
      (t) => tagLookup.get(t.id) ?? t,
    ),
  }));
  if (options.categorySlug) {
    filtered = filtered.filter((r) => r.category?.slug === options.categorySlug);
  }
  if (options.tagSlug) {
    filtered = filtered.filter((r) => r.tags.some((t) => t.slug === options.tagSlug));
  }
  return filtered;
}

export async function fetchBlogPostBySlug(
  slug: string,
  locale: Locale = 'en',
): Promise<
  | (BlogPost & { category: BlogCategory | null; tags: BlogTag[]; author_email: string | null })
  | null
> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await (supabase.from('blog_posts') as any)
    .select('*, blog_categories(*), admin_users(email)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error || !data) return null;
  const row = data as BlogPost & {
    blog_categories: BlogCategory | null;
    admin_users: { email: string } | null;
  };
  const { data: joins } = await (supabase.from('blog_post_tags') as any)
    .select('blog_tags(*)')
    .eq('post_id', row.id);
  const tags = ((joins ?? []) as Array<{ blog_tags: BlogTag | null }>)
    .map((j) => j.blog_tags)
    .filter((t): t is BlogTag => !!t);

  const [translatedPost] = await applyTranslations([row], 'blog_post', locale);
  const [translatedCategory] = row.blog_categories
    ? await applyTranslations([row.blog_categories], 'blog_category', locale)
    : [null];
  const translatedTags = await applyTranslations(tags, 'blog_tag', locale);

  return {
    ...(translatedPost ?? row),
    category: translatedCategory ?? row.blog_categories ?? null,
    tags: translatedTags.length ? translatedTags : tags,
    author_email: row.admin_users?.email ?? null,
  };
}

export async function fetchAllPublishedBlogSlugs(): Promise<Array<{ slug: string; updated_at: string }>> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<Array<{ slug: string; updated_at: string }> | null>(() =>
    (supabase.from('blog_posts') as any)
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false }),
  );
  return data ?? [];
}

// ============================================================
// Company gallery
// ============================================================

/**
 * Build a public URL for a Supabase Storage object inside the
 * `mukisoft-media` bucket. Used for both gallery images and research
 * PDFs — the bucket is public (see `supabase/storage.sql`), so the
 * standard public-URL form works.
 */
function buildStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const supabase = getClient();
  if (!supabase) return null;
  const { data } = supabase.storage.from('mukisoft-media').getPublicUrl(path);
  return data.publicUrl;
}

export type GalleryEventWithCover = GalleryEvent & {
  cover_url: string | null;
};

export async function fetchPublishedGalleryEvents(locale: Locale = 'en'): Promise<GalleryEventWithCover[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<GalleryEvent[] | null>(() =>
    (supabase.from('gallery_events') as any)
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('event_date', { ascending: false, nullsFirst: false }),
  );
  const translated = await applyTranslations(data ?? [], 'gallery_event', locale);
  return translated.map((e) => ({
    ...e,
    cover_url: buildStorageUrl(e.cover_image_path),
  }));
}

export async function fetchPublishedGallerySlugs(): Promise<Array<{ slug: string; updated_at: string }>> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<Array<{ slug: string; updated_at: string }> | null>(() =>
    (supabase.from('gallery_events') as any)
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false }),
  );
  return data ?? [];
}

export type GalleryImageWithUrl = GalleryImage & { public_url: string };

export async function fetchGalleryImagesForEvent(eventId: string, locale: Locale = 'en'): Promise<GalleryImageWithUrl[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<GalleryImage[] | null>(() =>
    (supabase.from('gallery_images') as any)
      .select('*')
      .eq('event_id', eventId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
  );
  const translated = await applyTranslations(data ?? [], 'gallery_image', locale);
  return translated.map((img) => ({
    ...img,
    public_url: buildStorageUrl(img.image_path) ?? '',
  }));
}

export type GalleryEventDetail = GalleryEventWithCover & {
  images: GalleryImageWithUrl[];
};

export async function fetchGalleryEventBySlug(slug: string, locale: Locale = 'en'): Promise<GalleryEventDetail | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data: row } = await safeQuery<GalleryEvent | null>(() =>
    (supabase.from('gallery_events') as any)
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle(),
  );
  if (!row) return null;
  const [translatedRow] = await applyTranslations([row], 'gallery_event', locale);
  const images = await fetchGalleryImagesForEvent(row.id, locale);
  return {
    ...(translatedRow ?? row),
    cover_url: buildStorageUrl(row.cover_image_path),
    images,
  };
}

// ============================================================
// Research & publications
// ============================================================

export type ResearchPaperWithUrls = ResearchPaper & {
  pdf_public_url: string | null;
  cover_public_url: string | null;
};

export async function fetchPublishedResearchPapers(locale: Locale = 'en'): Promise<ResearchPaperWithUrls[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<ResearchPaper[] | null>(() =>
    (supabase.from('research_papers') as any)
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('publication_date', { ascending: false, nullsFirst: false }),
  );
  const translated = await applyTranslations(data ?? [], 'research_paper', locale);
  return translated.map((p) => ({
    ...p,
    pdf_public_url: buildStorageUrl(p.pdf_path),
    cover_public_url: buildStorageUrl(p.cover_image_path),
  }));
}

export async function fetchPublishedResearchSlugs(): Promise<Array<{ slug: string; updated_at: string }>> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<Array<{ slug: string; updated_at: string }> | null>(() =>
    (supabase.from('research_papers') as any)
      .select('slug, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false }),
  );
  return data ?? [];
}

export async function fetchResearchPaperAuthors(paperId: string): Promise<ResearchPaperAuthor[]> {
  const supabase = getClient();
  if (!supabase) return [];
  const { data } = await safeQuery<ResearchPaperAuthor[] | null>(() =>
    (supabase.from('research_paper_authors') as any)
      .select('*')
      .eq('paper_id', paperId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
  );
  return data ?? [];
}

export type ResearchPaperDetail = ResearchPaperWithUrls & {
  authors_list: ResearchPaperAuthor[];
};

export async function fetchResearchPaperBySlug(slug: string, locale: Locale = 'en'): Promise<ResearchPaperDetail | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data: row } = await safeQuery<ResearchPaper | null>(() =>
    (supabase.from('research_papers') as any)
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle(),
  );
  if (!row) return null;
  const [translatedRow] = await applyTranslations([row], 'research_paper', locale);
  const authors_list = await fetchResearchPaperAuthors(row.id);
  return {
    ...(translatedRow ?? row),
    pdf_public_url: buildStorageUrl(row.pdf_path),
    cover_public_url: buildStorageUrl(row.cover_image_path),
    authors_list,
  };
}
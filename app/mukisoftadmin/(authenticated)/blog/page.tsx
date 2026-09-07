import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { BlogCategory, BlogPost, BlogTag } from '@/lib/supabase/types';
import { BlogManager } from './blog-manager';

export const dynamic = 'force-dynamic';

async function safeFetch<T>(fn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  try {
    const { data, error } = await fn();
    if (error) return null as T | null;
    return data;
  } catch {
    return null as T | null;
  }
}

export default async function AdminBlogPage() {
  const supabase = createSupabaseServerClient();
  const [postsData, catsData, tagsData] = await Promise.all([
    safeFetch<BlogPost[] | null>(() =>
      (supabase.from('blog_posts') as any)
        .select('*')
        .order('updated_at', { ascending: false }),
    ),
    safeFetch<BlogCategory[] | null>(() =>
      (supabase.from('blog_categories') as any).select('*').order('name', { ascending: true }),
    ),
    safeFetch<BlogTag[] | null>(() =>
      (supabase.from('blog_tags') as any).select('*').order('name', { ascending: true }),
    ),
  ]);

  return (
    <BlogManager
      initialPosts={(postsData ?? []) as BlogPost[]}
      initialCategories={(catsData ?? []) as BlogCategory[]}
      initialTags={(tagsData ?? []) as BlogTag[]}
    />
  );
}
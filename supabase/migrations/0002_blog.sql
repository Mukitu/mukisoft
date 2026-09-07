-- ============================================================
-- MukiSoft Technology — blog CMS schema
-- File: supabase/migrations/0002_blog.sql
--
-- Adds blog_posts, blog_categories, blog_tags, blog_post_tags
-- and an alt_text column on portfolio_projects.
-- Idempotent — safe to re-run.
-- ============================================================

-- ============================================================
-- Portfolio: add alt_text for accessibility / SEO
-- ============================================================
alter table public.portfolio_projects
  add column if not exists alt_text text;

-- ============================================================
-- Blog categories
-- ============================================================
create table if not exists public.blog_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_blog_categories_updated_at on public.blog_categories;
create trigger trg_blog_categories_updated_at
before update on public.blog_categories
for each row execute function public.set_updated_at();

-- ============================================================
-- Blog tags
-- ============================================================
create table if not exists public.blog_tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Blog posts
-- ============================================================
create table if not exists public.blog_posts (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text not null unique,
  excerpt         text,
  content         text not null default '',
  featured_image  text,
  featured_image_alt text,
  category_id     uuid references public.blog_categories(id) on delete set null,
  author_id       uuid references public.admin_users(id) on delete set null,
  status          text not null default 'draft' check (status in ('draft','published')),
  is_featured     boolean not null default false,
  published_at    timestamptz,
  seo_title       text,
  seo_description text,
  og_title        text,
  og_description  text,
  og_image        text,
  canonical_url   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_status_idx on public.blog_posts(status);
create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc);
create index if not exists blog_posts_featured_idx on public.blog_posts(is_featured) where is_featured = true;
create index if not exists blog_posts_category_idx on public.blog_posts(category_id);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

-- ============================================================
-- Many-to-many: blog_posts <-> blog_tags
-- ============================================================
create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id  uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists blog_post_tags_post_idx on public.blog_post_tags(post_id);
create index if not exists blog_post_tags_tag_idx on public.blog_post_tags(tag_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.blog_categories enable row level security;
alter table public.blog_tags        enable row level security;
alter table public.blog_posts       enable row level security;
alter table public.blog_post_tags   enable row level security;

-- Public read: published posts only; categories/tags are public lists.
drop policy if exists "blog_categories_public_read" on public.blog_categories;
create policy "blog_categories_public_read"
  on public.blog_categories for select
  using (true);

drop policy if exists "blog_tags_public_read" on public.blog_tags;
create policy "blog_tags_public_read"
  on public.blog_tags for select
  using (true);

drop policy if exists "blog_post_tags_public_read" on public.blog_post_tags;
create policy "blog_post_tags_public_read"
  on public.blog_post_tags for select
  using (
    exists (
      select 1 from public.blog_posts bp
      where bp.id = blog_post_tags.post_id
        and bp.status = 'published'
    )
  );

drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read"
  on public.blog_posts for select
  using (status = 'published');

-- Admin write policies
drop policy if exists "blog_categories_admin_all" on public.blog_categories;
create policy "blog_categories_admin_all"
  on public.blog_categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_tags_admin_all" on public.blog_tags;
create policy "blog_tags_admin_all"
  on public.blog_tags for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_posts_admin_all" on public.blog_posts;
create policy "blog_posts_admin_all"
  on public.blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_post_tags_admin_all" on public.blog_post_tags;
create policy "blog_post_tags_admin_all"
  on public.blog_post_tags for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- MukiSoft Technology — initial CMS schema
-- File: supabase/migrations/0001_init_schema.sql
--
-- Run this file in a fresh Supabase project's SQL editor.
-- Safe to re-run: it uses IF NOT EXISTS guards.
-- ============================================================

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- Utility trigger: maintain updated_at automatically
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Admin authorization
-- ============================================================

-- Map a Supabase auth user (auth.uid()) to an admin role.
create table if not exists public.admin_users (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  email       text not null unique,
  role        text not null default 'admin' check (role in ('admin', 'editor')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists admin_users_user_id_idx on public.admin_users(user_id);
create index if not exists admin_users_active_idx on public.admin_users(is_active) where is_active = true;

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

-- ============================================================
-- is_admin(): secure helper used by RLS policies.
--
-- SECURITY DEFINER with a fixed search_path, locked down to
-- public schema. This avoids recursive RLS because the function
-- reads admin_users but bypasses RLS for that table to prevent
-- the policy from depending on itself.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.role = 'admin'
      and au.is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- site_settings (single-row global configuration)
-- ============================================================
create table if not exists public.site_settings (
  id               integer primary key default 1 check (id = 1),
  company_name     text not null,
  short_name       text not null,
  tagline          text not null,
  description      text,
  email            text not null,
  phone            text not null,
  location         text not null,
  website          text not null,
  founded_year     integer not null,
  copyright_text   text,
  -- SEO
  site_title       text,
  meta_description text,
  og_title         text,
  og_description   text,
  og_image         text,
  canonical_url    text,
  updated_at       timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

-- ============================================================
-- about_pages (versioned, single draft + published model)
-- ============================================================
create table if not exists public.about_pages (
  id                   uuid primary key default uuid_generate_v4(),
  title                text not null,
  subtitle             text,
  hero_description     text,
  who_we_are_title     text,
  who_we_are_content   text,
  mission              text,
  vision               text,
  values               jsonb default '[]'::jsonb,
  story                jsonb default '[]'::jsonb,
  capabilities         jsonb default '[]'::jsonb,
  cta_title            text,
  cta_description      text,
  seo_title            text,
  seo_description      text,
  status               text not null default 'draft' check (status in ('draft','published')),
  updated_at           timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

create index if not exists about_pages_status_idx on public.about_pages(status);

drop trigger if exists trg_about_pages_updated_at on public.about_pages;
create trigger trg_about_pages_updated_at
before update on public.about_pages
for each row execute function public.set_updated_at();

-- ============================================================
-- leadership
-- ============================================================
create table if not exists public.leadership (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  position            text not null,
  short_bio           text,
  full_bio            text,
  education           text,
  university          text,
  professional_focus  text[] default '{}',
  email               text,
  phone               text,
  location            text,
  image_url           text,
  linkedin_url        text,
  github_url          text,
  display_order       integer not null default 0,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists leadership_published_idx on public.leadership(is_published) where is_published = true;
create index if not exists leadership_order_idx on public.leadership(display_order);

drop trigger if exists trg_leadership_updated_at on public.leadership;
create trigger trg_leadership_updated_at
before update on public.leadership
for each row execute function public.set_updated_at();

-- ============================================================
-- team_members
-- ============================================================
create table if not exists public.team_members (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  role            text not null,
  department      text,
  bio             text,
  image_url       text,
  email           text,
  linkedin_url    text,
  github_url      text,
  display_order   integer not null default 0,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists team_members_published_idx on public.team_members(is_published) where is_published = true;
create index if not exists team_members_order_idx on public.team_members(display_order);

drop trigger if exists trg_team_members_updated_at on public.team_members;
create trigger trg_team_members_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

-- ============================================================
-- process_steps
-- ============================================================
create table if not exists public.process_steps (
  id                uuid primary key default uuid_generate_v4(),
  step_number       text not null,
  title             text not null,
  short_description text,
  full_description  text,
  icon              text,
  display_order     integer not null default 0,
  is_published      boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists process_steps_published_idx on public.process_steps(is_published) where is_published = true;
create index if not exists process_steps_order_idx on public.process_steps(display_order);

drop trigger if exists trg_process_steps_updated_at on public.process_steps;
create trigger trg_process_steps_updated_at
before update on public.process_steps
for each row execute function public.set_updated_at();

-- ============================================================
-- careers
-- ============================================================
create table if not exists public.careers (
  id                uuid primary key default uuid_generate_v4(),
  job_title         text not null,
  department        text,
  location          text,
  employment_type   text,
  description       text,
  responsibilities  text[] default '{}',
  requirements      text[] default '{}',
  nice_to_have      text[] default '{}',
  application_email text,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists careers_published_idx on public.careers(is_published) where is_published = true;
create index if not exists careers_created_at_idx on public.careers(created_at desc);

drop trigger if exists trg_careers_updated_at on public.careers;
create trigger trg_careers_updated_at
before update on public.careers
for each row execute function public.set_updated_at();

-- ============================================================
-- portfolio_projects
-- ============================================================
create table if not exists public.portfolio_projects (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  slug             text not null unique,
  category         text,
  industry         text,
  short_description text,
  description      text,
  challenge        text,
  approach         text,
  solution         text,
  technology       text[] default '{}',
  outcome          text[] default '{}',
  image_url        text,
  project_url      text,
  case_study_url   text,
  display_order    integer not null default 0,
  is_featured      boolean not null default false,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists portfolio_projects_published_idx on public.portfolio_projects(is_published) where is_published = true;
create index if not exists portfolio_projects_featured_idx on public.portfolio_projects(is_featured) where is_featured = true;
create index if not exists portfolio_projects_order_idx on public.portfolio_projects(display_order);
create index if not exists portfolio_projects_slug_idx on public.portfolio_projects(slug);

drop trigger if exists trg_portfolio_projects_updated_at on public.portfolio_projects;
create trigger trg_portfolio_projects_updated_at
before update on public.portfolio_projects
for each row execute function public.set_updated_at();

-- ============================================================
-- media_assets (catalog of uploaded images / files)
-- ============================================================
create table if not exists public.media_assets (
  id           uuid primary key default uuid_generate_v4(),
  file_name    text not null,
  storage_path text not null,
  public_url   text not null,
  bucket       text not null,
  folder       text,
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists media_assets_bucket_idx on public.media_assets(bucket);
create index if not exists media_assets_folder_idx on public.media_assets(folder);

-- ============================================================
-- Row Level Security — enable on every table
-- ============================================================
alter table public.admin_users        enable row level security;
alter table public.site_settings      enable row level security;
alter table public.about_pages        enable row level security;
alter table public.leadership         enable row level security;
alter table public.team_members       enable row level security;
alter table public.process_steps      enable row level security;
alter table public.careers            enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.media_assets       enable row level security;

-- ============================================================
-- Public read policies — published content only
-- ============================================================
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

drop policy if exists "about_pages_public_read" on public.about_pages;
create policy "about_pages_public_read"
  on public.about_pages for select
  using (status = 'published');

drop policy if exists "leadership_public_read" on public.leadership;
create policy "leadership_public_read"
  on public.leadership for select
  using (is_published = true);

drop policy if exists "team_members_public_read" on public.team_members;
create policy "team_members_public_read"
  on public.team_members for select
  using (is_published = true);

drop policy if exists "process_steps_public_read" on public.process_steps;
create policy "process_steps_public_read"
  on public.process_steps for select
  using (is_published = true);

drop policy if exists "careers_public_read" on public.careers;
create policy "careers_public_read"
  on public.careers for select
  using (is_published = true);

drop policy if exists "portfolio_projects_public_read" on public.portfolio_projects;
create policy "portfolio_projects_public_read"
  on public.portfolio_projects for select
  using (is_published = true);

drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read"
  on public.media_assets for select
  using (true);

-- ============================================================
-- Admin write policies — only authenticated admins can write
-- ============================================================
-- admin_users: admins manage admins; a row can read itself at minimum.
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read"
  on public.admin_users for select
  using (auth.uid() = user_id);

drop policy if exists "admin_users_admin_read" on public.admin_users;
create policy "admin_users_admin_read"
  on public.admin_users for select
  using (public.is_admin());

drop policy if exists "admin_users_admin_write" on public.admin_users;
create policy "admin_users_admin_write"
  on public.admin_users for all
  using (public.is_admin())
  with check (public.is_admin());

-- site_settings
drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- about_pages
drop policy if exists "about_pages_admin_all" on public.about_pages;
create policy "about_pages_admin_all"
  on public.about_pages for all
  using (public.is_admin())
  with check (public.is_admin());

-- leadership
drop policy if exists "leadership_admin_all" on public.leadership;
create policy "leadership_admin_all"
  on public.leadership for all
  using (public.is_admin())
  with check (public.is_admin());

-- team_members
drop policy if exists "team_members_admin_all" on public.team_members;
create policy "team_members_admin_all"
  on public.team_members for all
  using (public.is_admin())
  with check (public.is_admin());

-- process_steps
drop policy if exists "process_steps_admin_all" on public.process_steps;
create policy "process_steps_admin_all"
  on public.process_steps for all
  using (public.is_admin())
  with check (public.is_admin());

-- careers
drop policy if exists "careers_admin_all" on public.careers;
create policy "careers_admin_all"
  on public.careers for all
  using (public.is_admin())
  with check (public.is_admin());

-- portfolio_projects
drop policy if exists "portfolio_projects_admin_all" on public.portfolio_projects;
create policy "portfolio_projects_admin_all"
  on public.portfolio_projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- media_assets
drop policy if exists "media_assets_admin_all" on public.media_assets;
create policy "media_assets_admin_all"
  on public.media_assets for all
  using (public.is_admin())
  with check (public.is_admin());

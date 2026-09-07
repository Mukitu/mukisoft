-- ============================================================
-- MukiSoft Technology — Company Gallery
-- File: supabase/migrations/0007_gallery_events.sql
--
-- Adds the gallery_events table for company events, workshops,
-- conferences, meetings, office moments and awards/recognition events.
-- Each event can have a cover image plus a separate set of multiple
-- gallery images (managed via the sibling `gallery_images` table).
--
-- Idempotent — safe to re-run.
-- ============================================================

create table if not exists public.gallery_events (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  slug                text not null unique,
  short_description   text,
  description         text,
  event_date          date,
  location            text,
  category            text,
  cover_image_path    text,
  cover_image_alt     text,
  external_url        text,
  is_featured         boolean not null default false,
  is_published        boolean not null default false,
  display_order       integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index if not exists gallery_events_slug_idx
  on public.gallery_events(slug);
create index if not exists gallery_events_published_idx
  on public.gallery_events(is_published) where is_published = true;
create index if not exists gallery_events_featured_idx
  on public.gallery_events(is_featured) where is_featured = true;
create index if not exists gallery_events_event_date_idx
  on public.gallery_events(event_date desc nulls last);
create index if not exists gallery_events_order_idx
  on public.gallery_events(display_order);

drop trigger if exists trg_gallery_events_updated_at on public.gallery_events;
create trigger trg_gallery_events_updated_at
before update on public.gallery_events
for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.gallery_events enable row level security;

-- Public: read published events only.
drop policy if exists "gallery_events_public_read" on public.gallery_events;
create policy "gallery_events_public_read"
  on public.gallery_events for select
  using (is_published = true);

-- Admin: full CRUD.
drop policy if exists "gallery_events_admin_all" on public.gallery_events;
create policy "gallery_events_admin_all"
  on public.gallery_events for all
  using (public.is_admin())
  with check (public.is_admin());

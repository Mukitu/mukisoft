-- ============================================================
-- MukiSoft Technology — Gallery images (event attachments)
-- File: supabase/migrations/0008_gallery_images.sql
--
-- One-to-many: gallery_events -> gallery_images.
-- Each row is a single photo belonging to an event, with an optional
-- caption and a display order so the admin can reorder photos without
-- touching the file paths.
--
-- Idempotent — safe to re-run.
-- ============================================================

create table if not exists public.gallery_images (
  id              uuid primary key default uuid_generate_v4(),
  event_id        uuid not null references public.gallery_events(id) on delete cascade,
  image_path      text not null,
  alt_text        text,
  caption         text,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists gallery_images_event_idx
  on public.gallery_images(event_id);
create index if not exists gallery_images_order_idx
  on public.gallery_images(event_id, display_order);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.gallery_images enable row level security;

-- Public: read images that belong to a published event only.
drop policy if exists "gallery_images_public_read" on public.gallery_images;
create policy "gallery_images_public_read"
  on public.gallery_images for select
  using (
    exists (
      select 1
      from public.gallery_events e
      where e.id = gallery_images.event_id
        and e.is_published = true
    )
  );

-- Admin: full CRUD.
drop policy if exists "gallery_images_admin_all" on public.gallery_images;
create policy "gallery_images_admin_all"
  on public.gallery_images for all
  using (public.is_admin())
  with check (public.is_admin());

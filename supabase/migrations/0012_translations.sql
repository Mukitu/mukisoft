-- ============================================================
-- MukiSoft Technology — translation cache
-- File: supabase/migrations/0012_translations.sql
--
-- Stores translated values for translatable CMS content. English
-- remains the canonical source language — translations are cached
-- here so we never re-translate on every request.
--
-- One row per (entity_type, entity_id, field_name, target_lang).
-- status moves through:
--   pending   -> generated -> edited -> published -> deprecated
--                                  \-> failed
--
-- source_hash (sha256 of the English value at the time of generation)
-- lets the public fetcher skip rows whose English source has changed
-- and lets the admin surface "stale" translations for regeneration.
--
-- Idempotent — safe to re-run.
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'translation_status') then
    create type public.translation_status as enum (
      'pending',
      'generated',
      'edited',
      'published',
      'deprecated',
      'failed'
    );
  end if;
end $$;

create table if not exists public.translations (
  id            uuid primary key default uuid_generate_v4(),
  entity_type   text not null,
  entity_id     uuid not null,
  field_name    text not null,
  target_lang   text not null,
  -- source_lang is always 'en' for v1 but stored for forward-compatibility
  source_lang   text not null default 'en',
  source_value  text not null,
  source_hash   text not null,
  translated_value text not null default '',
  status        public.translation_status not null default 'pending',
  provider      text,
  last_error    text,
  translated_by uuid references public.admin_users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz,
  constraint translations_unique_key
    unique (entity_type, entity_id, field_name, target_lang)
);

create index if not exists translations_entity_idx
  on public.translations(entity_type, entity_id);
create index if not exists translations_lang_status_idx
  on public.translations(target_lang, status);
create index if not exists translations_status_idx
  on public.translations(status);

drop trigger if exists trg_translations_updated_at on public.translations;
create trigger trg_translations_updated_at
before update on public.translations
for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.translations enable row level security;

-- Public: anyone can read published translations in any language.
drop policy if exists "translations_public_read_published" on public.translations;
create policy "translations_public_read_published"
  on public.translations for select
  using (status = 'published');

-- Admin: full access.
drop policy if exists "translations_admin_all" on public.translations;
create policy "translations_admin_all"
  on public.translations for all
  using (public.is_admin())
  with check (public.is_admin());

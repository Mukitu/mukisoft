-- 0003_leadership_photo.sql
-- Add portrait framing controls + team member X URL.

alter table public.leadership
  add column if not exists image_alt text,
  add column if not exists image_focus text not null default 'center top';

alter table public.team_members
  add column if not exists image_alt text,
  add column if not exists image_focus text not null default 'center top',
  add column if not exists x_url text;

-- ============================================================
-- 0006_navbar_logo_size.sql
--
-- Add a CMS-controlled navbar logo display size to site_settings.
--
-- The value is in CSS pixels (the rendered height of the <img> inside
-- the navbar). Admins can adjust it from the Brand assets section of
-- the admin settings page; the value is clamped server-side via a
-- CHECK constraint to a sensible 16–96 px range so a typo can't blow
-- out the navbar layout.
--
-- Default = 36 px, which matches the previous hardcoded height in
-- <Logo size="md"> so existing setups keep the same look until the
-- admin changes it.
-- ============================================================

alter table public.site_settings
  add column if not exists navbar_logo_size integer not null default 36;

-- Defensive range clamp. Migration is idempotent and safe to re-run.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_settings_navbar_logo_size_range'
  ) then
    alter table public.site_settings
      add constraint site_settings_navbar_logo_size_range
      check (navbar_logo_size between 16 and 96);
  end if;
end$$;

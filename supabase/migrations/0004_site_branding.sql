-- 0004_site_branding.sql
-- Add CMS-driven navbar logo and favicon columns to site_settings.

alter table public.site_settings
  add column if not exists navbar_logo_url text,
  add column if not exists favicon_url text;

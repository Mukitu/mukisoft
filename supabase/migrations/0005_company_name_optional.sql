-- ============================================================
-- Migration 0005 — Make `company_name` optional in site_settings
--
-- The admin Site Settings form lets the operator run a brand
-- identity without a text name (logo-only). When `company_name`
-- is blank, the public layout renders no name text alongside the
-- logo, and the JSON-LD/metadata sites fall back to the static
-- default via `company.displayName`.
-- ============================================================

alter table public.site_settings
  alter column company_name drop not null;

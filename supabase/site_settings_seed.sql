-- ============================================================
-- MukiSoft Technology — site_settings singleton seed
-- File: supabase/site_settings_seed.sql
--
-- Run this ONCE in the Supabase SQL editor to ensure the
-- single-row site_settings table is populated with verified
-- MukiSoft values.
--
-- All statements are idempotent (ON CONFLICT DO NOTHING / DO
-- UPDATE) so re-running is safe. After running, every public
-- page — home, about, services, contact, blog, etc. — will read
-- the company name, tagline, contact details and SEO defaults
-- from this row via lib/config/company.ts.
-- ============================================================

insert into public.site_settings (
  id,
  company_name,
  short_name,
  tagline,
  description,
  email,
  phone,
  location,
  website,
  founded_year,
  copyright_text,
  site_title,
  meta_description,
  og_title,
  og_description,
  og_image,
  canonical_url,
  navbar_logo_url,
  favicon_url
) values (
  1,
  'MukiSoft Technology',
  'MukiSoft',
  'Software, AI and SaaS engineering for businesses that take technology seriously.',
  'MukiSoft Technology is a Bangladesh-based software engineering firm building custom software, AI features and SaaS products for businesses.',
  'mukitunishat@gmail.com',
  '+8809638957563',
  'Puthia, Rajshahi, Bangladesh',
  'https://mukisoft.tech',
  2021,
  null,
  'MukiSoft Technology — Software, AI & Digital Products',
  'MukiSoft Technology engineers modern software, AI-powered solutions and digital products that help businesses and organisations turn ambitious ideas into reliable, scalable technology.',
  'MukiSoft Technology — Software, AI & Digital Products',
  'MukiSoft Technology delivers software, AI, SaaS, design and digital growth capabilities for businesses worldwide.',
  '/og.svg',
  'https://mukisoft.tech',
  null,
  null
)
on conflict (id) do update set
  company_name = excluded.company_name,
  short_name = excluded.short_name,
  tagline = excluded.tagline,
  description = excluded.description,
  email = excluded.email,
  phone = excluded.phone,
  location = excluded.location,
  website = excluded.website,
  founded_year = excluded.founded_year,
  copyright_text = excluded.copyright_text,
  site_title = excluded.site_title,
  meta_description = excluded.meta_description,
  og_title = excluded.og_title,
  og_description = excluded.og_description,
  og_image = excluded.og_image,
  canonical_url = excluded.canonical_url,
  navbar_logo_url = excluded.navbar_logo_url,
  favicon_url = excluded.favicon_url;

-- Verify the row was written
select id, company_name, short_name, email, website, founded_year
from public.site_settings
where id = 1;

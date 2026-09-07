-- ============================================================
-- MukiSoft Technology — initial seed data
-- File: supabase/seed.sql
--
-- Seed only VERIFIED company information. Run after the schema
-- migration. Uses ON CONFLICT to be safe to re-run.
-- ============================================================

-- ============================================================
-- Site settings
-- ============================================================
insert into public.site_settings (
  id, company_name, short_name, tagline, description,
  email, phone, location, website, founded_year, copyright_text,
  site_title, meta_description, og_title, og_description, og_image, canonical_url,
  navbar_logo_url, favicon_url
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

-- ============================================================
-- Leadership — Founder
-- ============================================================
insert into public.leadership (
  name, position, short_bio, full_bio,
  education, university, professional_focus,
  email, phone, location, image_url,
  display_order, is_published
) values (
  'Mukitu Islam Nishat',
  'Founder & CEO',
  'Founder & CEO of MukiSoft Technology, providing strategic and technical leadership across the organisation''s engineering, platform and technology direction.',
  'Mukitu Islam Nishat is the Founder and Chief Executive Officer of MukiSoft Technology, where he provides strategic and technical leadership across the organisation''s software engineering, platform development and technology direction. With a strong focus on modern software development, AI-powered applications and SaaS product engineering, he works at the intersection of technology, product development and business requirements.',
  'B.Sc. in Computer Science & Engineering',
  'North Bengal International University, Rajshahi, Bangladesh',
  array[
    'Software Architecture',
    'Platform Development',
    'Full Stack Development',
    'AI-Powered Applications',
    'SaaS Product Development',
    'Technology Strategy'
  ],
  'mukitunishat@gmail.com',
  '+8809638957563',
  'Puthia, Rajshahi, Bangladesh',
  '/assets/founder/founder.png',
  1,
  true
)
on conflict do nothing;

-- ============================================================
-- Process steps — eight stages
-- ============================================================
insert into public.process_steps (step_number, title, short_description, full_description, display_order, is_published) values
  ('01', 'Discovery',
    'We immerse ourselves in the business, the users and the operating reality — turning ambiguity into shared understanding and clear objectives.',
    'Stakeholder interviews, domain research, user needs mapping, technical due diligence, constraints and risk inventory.',
    1, true),
  ('02', 'Strategy',
    'A clear product and technology strategy that aligns the work with measurable business outcomes — across scope, phasing and investment.',
    'Product strategy, roadmap, feasibility review, success metrics.',
    2, true),
  ('03', 'Architecture',
    'Architectural foundations that age well — system design, integration patterns and a technical direction that supports long-term evolution.',
    'System and data architecture, integration strategy, security foundations, cloud topology, AI layer design.',
    3, true),
  ('04', 'Product Design',
    'Research-led design that turns strategy into usable, accessible and trustworthy product experiences — supported by a durable design system.',
    'UX flows, visual and interaction design, design system, accessibility, engineering handoff.',
    4, true),
  ('05', 'Engineering',
    'Senior-led, iterative engineering — turning architecture and design into production-ready software that the team can evolve.',
    'Iterative engineering cadence, full-stack implementation, integrations, AI features, continuous integration.',
    5, true),
  ('06', 'Quality Assurance',
    'Quality is engineered in — automated testing, performance budgets, accessibility checks and security review across the product.',
    'Unit, integration and end-to-end tests, performance verification, accessibility review, security review.',
    6, true),
  ('07', 'Deployment',
    'A coordinated, low-risk deployment — from infrastructure to observability — designed for reliable production operation.',
    'Production deployment, observability, operational runbooks, stakeholder enablement.',
    7, true),
  ('08', 'Continuous Improvement',
    'Long-term partnership — measuring, learning and evolving the product as the market, the users and the business grow.',
    'Continuous improvement cycles, performance monitoring, roadmap evolution, long-term technical partnership.',
    8, true)
on conflict do nothing;

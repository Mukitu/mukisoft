-- ============================================================
-- MukiSoft Technology — Research & Publications
-- File: supabase/migrations/0009_research_papers.sql
--
-- Adds research_papers and research_paper_authors.
--
-- Design notes
--   - A research paper has a required `title`, `slug` and `published`
--     flag. The published flag is the single source of truth for the
--     public visibility filter — RLS policies only allow SELECT on rows
--     where `published = true`.
--   - `author_member_id` references the existing team_members table so
--     a published paper can be linked to an internal team member without
--     duplicating author data. It is nullable because not every paper
--     author is on the team.
--   - research_paper_authors is a normalized many-to-many table for
--     storing co-author lists (non-team contributors, external
--     researchers, etc.).
--   - `pdf_path` stores the storage path inside the `mukisoft-media`
--     bucket. `pdf_url` stores an optional external URL (e.g. a
--     publisher landing page). Either, both, or neither may be present.
--   - `cover_image_path` is the cover that shows on the public
--     /research listing and detail page when the paper is shown
--     outside an abstract list.
--
-- Idempotent — safe to re-run.
-- ============================================================

create table if not exists public.research_papers (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  slug                text not null unique,
  abstract            text,
  description         text,
  authors             text,
  author_member_id    uuid references public.team_members(id) on delete set null,
  publication_date    date,
  publication_type    text,
  category            text,
  journal_name        text,
  conference_name     text,
  doi                 text,
  pdf_path            text,
  pdf_url             text,
  external_url        text,
  cover_image_path    text,
  cover_image_alt     text,
  is_featured         boolean not null default false,
  published           boolean not null default false,
  display_order       integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index if not exists research_papers_slug_idx
  on public.research_papers(slug);
create index if not exists research_papers_published_idx
  on public.research_papers(published) where published = true;
create index if not exists research_papers_featured_idx
  on public.research_papers(is_featured) where is_featured = true;
create index if not exists research_papers_publication_date_idx
  on public.research_papers(publication_date desc nulls last);
create index if not exists research_papers_category_idx
  on public.research_papers(category);
create index if not exists research_papers_order_idx
  on public.research_papers(display_order);

drop trigger if exists trg_research_papers_updated_at on public.research_papers;
create trigger trg_research_papers_updated_at
before update on public.research_papers
for each row execute function public.set_updated_at();

-- ============================================================
-- Research paper co-authors (many-to-many)
-- ============================================================
create table if not exists public.research_paper_authors (
  id          uuid primary key default uuid_generate_v4(),
  paper_id    uuid not null references public.research_papers(id) on delete cascade,
  name        text not null,
  affiliation text,
  display_order integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists research_paper_authors_paper_idx
  on public.research_paper_authors(paper_id);
create index if not exists research_paper_authors_order_idx
  on public.research_paper_authors(paper_id, display_order);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.research_papers        enable row level security;
alter table public.research_paper_authors enable row level security;

-- Public: read published papers only.
drop policy if exists "research_papers_public_read" on public.research_papers;
create policy "research_papers_public_read"
  on public.research_papers for select
  using (published = true);

-- Public: read authors of published papers only.
drop policy if exists "research_paper_authors_public_read" on public.research_paper_authors;
create policy "research_paper_authors_public_read"
  on public.research_paper_authors for select
  using (
    exists (
      select 1
      from public.research_papers p
      where p.id = research_paper_authors.paper_id
        and p.published = true
    )
  );

-- Admin: full CRUD.
drop policy if exists "research_papers_admin_all" on public.research_papers;
create policy "research_papers_admin_all"
  on public.research_papers for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "research_paper_authors_admin_all" on public.research_paper_authors;
create policy "research_paper_authors_admin_all"
  on public.research_paper_authors for all
  using (public.is_admin())
  with check (public.is_admin());

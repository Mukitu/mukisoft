# MukiSoft Technology — Supabase Setup

This document explains how to connect MukiSoft Technology's website and
admin CMS to a Supabase project.

The admin panel lives at **`/mukisoftadmin`** and is protected by
Supabase Authentication and Row Level Security (RLS).

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Pick a project name, database password, and region.
3. Once the project is ready, go to **Project Settings → API**.

## 2. Copy the project URL and anon key

From **Project Settings → API**, copy:

- **Project URL** — used as `NEXT_PUBLIC_SUPABASE_URL`.
- **anon / public key** — used as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

These two values are **safe to expose to the browser**. They grant
only the permissions allowed by your RLS policies.

Do **NOT** copy the service-role key into any variable starting with
`NEXT_PUBLIC_`. The service-role key bypasses RLS and must never
appear in client-side code.

## 3. Add environment variables

Create `.env.local` at the project root (it is gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

You can copy the structure from `.env.example`.

## 4. Run the database migrations

In the Supabase dashboard, open **SQL Editor** and run the files
in `supabase/migrations/` in numeric order:

1. `0001_init_schema.sql`
2. `0002_blog.sql` (blog posts, categories, tags)
3. `0003_leadership_photo.sql` (founder / team portrait framing controls)
4. `0004_site_branding.sql` (CMS-controlled navbar logo + favicon URLs)
5. `0005_company_name_optional.sql` (allow blank `company_name` for logo-only brands)
6. `0006_navbar_logo_size.sql` (CMS-controlled navbar logo pixel size)
7. `0007_gallery_events.sql` (Company gallery — `gallery_events` table)
8. `0008_gallery_images.sql` (`gallery_images` table attached to events)
9. `0009_research_papers.sql` (Research & publications tables)
10. `0010_storage_pdf_support.sql` (Allow PDF uploads on `mukisoft-media` bucket)
11. `0011_storage_mime_allowlist.sql` (Defensive guard — re-applies the bucket's image + PDF MIME allow-list)

All scripts are idempotent (uses `if not exists`, `drop policy if
exists`, etc.) so they are safe to re-run.

`0001_init_schema.sql` creates every CMS table (`admin_users`,
`site_settings`, `about_pages`, `leadership`, `team_members`,
`process_steps`, `careers`, `portfolio_projects`, `media_assets`),
the `is_admin()` SQL helper used by RLS, RLS policies and the
`updated_at` automatic triggers.

`0002_blog.sql` adds the blog tables (`blog_categories`,
`blog_tags`, `blog_posts`, `blog_post_tags`) and an `alt_text`
column on `portfolio_projects`.

`0007_gallery_events.sql` and `0008_gallery_images.sql` add the
company gallery CMS (events + attached photos). All RLS policies
mirror the existing pattern — public reads for published content
only, full CRUD for admins.

`0009_research_papers.sql` adds the research publications CMS:
`research_papers`, `research_paper_authors`, and an optional
`author_member_id` reference to the existing `team_members` table.

`0010_storage_pdf_support.sql` extends the `mukisoft-media` bucket
allow-list with `application/pdf` so research PDFs can be uploaded
through the admin Research manager.

## 5. Run the seed file

Run `supabase/seed.sql` to insert verified company information:

- One `site_settings` row with the MukiSoft Technology values.
- One published `leadership` row for Mukitu Islam Nishat.
- Eight published `process_steps` rows.

## 6. Create the storage bucket

Run `supabase/storage.sql` to:

- Create the public bucket `mukisoft-media` with a 50 MB per-object size limit and an explicit allow-list of image MIME types.
- Add admin-only write/delete policies and a public read policy.

> The bucket size limit and MIME allow-list are explicitly set on the
> bucket — without them, Supabase may reject uploads with
> *"The object exceeded the maximum allowed size"* even for normal photos.
>
> The admin image uploader also compresses any image larger than 10 MB
> in the browser before uploading, so most portfolio screenshots and
> photos go through without trouble.

## 7. Create the admin user in Supabase Authentication

1. In the Supabase dashboard, go to **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Use the authorized email:

   ```
   mukituislamnishat@gmail.com
   ```

4. Set a strong password and confirm.
5. Click **Create user**.

> Do not put the password into source code or SQL files.

After creation, the user appears in the **Users** table with a UUID
(auth.users.id). Copy that UUID — you will need it in step 8.

## 8. Register the admin in admin_users

Open **SQL Editor** and run `supabase/admin_setup.sql` in full.

This script looks up the user's UUID from `auth.users` by email
automatically — no manual UUID copy/paste is needed. It will print a
`notice` confirming the registration.

If the script reports `No auth.users row found for email …`, the user
has not been created in Supabase Auth yet — go back to step 7.

## 9. Sign in

1. Start the Next.js dev server:

   ```bash
   npm install
   npm run dev
   ```

2. Visit [http://localhost:3000/mukisoftadmin](http://localhost:3000/mukisoftadmin).
3. Sign in with `mukituislamnishat@gmail.com` and the password you set
   in step 7.

## 10. Optional: service-role key for server-side admin operations

If you add server-side code that needs to bypass RLS after explicit
authorization checks, set:

```
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
```

This key is server-only. Never expose it through `NEXT_PUBLIC_*`.

---

## Architecture summary

- **Authentication:** Supabase Auth (email + password).
- **Authorization:** database-backed `admin_users` table + RLS +
  `is_admin()` helper.
- **Content:** every CMS table has an `is_published` (or `status`)
  column; public reads filter to published only.
- **Storage:** public bucket `mukisoft-media` for admin uploads.
- **Public website:** reads only published records via the server
  Supabase client.
- **Admin panel:** writes via the browser Supabase client (RLS
  permits writes only for `is_admin()` users).

---

## Reset / recovery

If the admin account is ever locked or compromised:

1. Update the password in **Authentication → Users**.
2. Or set `is_active = false` on the offending row in `admin_users`:
   ```sql
   update public.admin_users
   set is_active = false
   where email = 'someone@example.com';
   ```

There is no backdoor URL or default password.

---

## Troubleshooting

- **Login form shows "Invalid email or password":** the user has not
  been created in Supabase Auth, or the password is wrong.
- **Login form shows "You do not have permission…":** the user is
  authenticated but not present in `admin_users`, or `is_active` is
  false.
- **Public page is blank:** run `supabase/seed.sql` and
  `supabase/migrations/0001_init_schema.sql`. Publish a few records
  from the admin panel so the public filters return content.
- **TypeScript build fails:** make sure
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
  defined (even temporarily as placeholders) so the build can
  statically import the Supabase helpers.

# Admin Panel ↔ Public Site Verification

Every admin panel CRUD action is wired to flush the public site's edge
cache so admin edits show on the live site instantly (no 60 s delay).

## Cache invalidation pipeline

```
admin write
  └─▶ adminApi.create / update / remove / publishToggle / publishStatusToggle
        (lib/supabase/admin-actions.ts)
        └─▶ flushCache(table)
              └─▶ invalidatePublicCache({ tables: [...] })
                    └─▶ fetch('/api/admin/revalidate', { POST })
                          └─▶ revalidateTag(...)  ← unstable_cache data
                          └─▶ revalidatePath(...) ← App Router page cache
```

Direct DB writes (settings upsert, blog publish toggle, blog tag joins)
also call `invalidatePublicCache` explicitly so they don't bypass the
flush.

Translation operations (`/api/translate`) flush the cache in-line:
generate / save / publish / unpublish / markStale all call
`flushEntityCache(entityType)` which resolves the entity → table → tags
mapping and revalidates both the cache tags and the matching `/bn/*`
pages.

## Admin feature matrix

| Admin page          | Tables                                   | Public page(s) refreshed                                   | Status |
|---------------------|------------------------------------------|-----------------------------------------------------------|--------|
| Dashboard           | (read-only counts)                       | n/a                                                       | OK     |
| Settings            | site_settings                            | every page (navbar/footer/OG tags/logo size)              | OK     |
| Pages → About       | about_pages                              | /, /about                                                 | OK     |
| Leadership          | leadership                               | /, /about, /founder, /team                                | OK     |
| Team                | team_members                             | /, /team                                                  | OK     |
| Process             | process_steps                            | /, /process                                               | OK     |
| Careers             | careers                                  | /, /careers                                               | OK     |
| Portfolio           | portfolio_projects                       | /, /work, /work/[slug] (per-slug tag)                     | OK     |
| Blog                | blog_posts, blog_categories, blog_tags, blog_post_tags | /, /blog, /blog/[slug]                          | OK     |
| Gallery             | gallery_events, gallery_images           | /, /gallery, /gallery/[slug]                              | OK     |
| Research            | research_papers, research_paper_authors  | /, /research, /research/[slug]                            | OK     |
| Translations        | translations                             | /bn/* (locale-scoped)                                     | OK     |
| Media               | media_assets (internal)                  | n/a                                                       | OK     |
| Profile             | admin_users (internal)                   | n/a                                                       | OK     |

## Cache tags per table

| Tag              | Wraps                                                   |
|------------------|---------------------------------------------------------|
| site-settings    | fetchSiteSettings                                       |
| about-page       | fetchPublishedAbout                                     |
| leadership       | fetchPublishedLeadership                                |
| team             | fetchPublishedTeam                                      |
| process          | fetchPublishedProcess                                   |
| careers          | fetchPublishedCareers                                   |
| portfolio        | fetchPublishedPortfolio, fetchAllPublishedBlogSlugs…    |
| blog             | fetchBlogCategories, fetchBlogTags, fetchPublishedBlogPosts |
| gallery          | (no data cache — page path revalidation only)           |
| research         | (no data cache — page path revalidation only)           |

Every fetch also tags itself with the locale string (e.g. `'en'`,
`'bn'`) so flushing the locale tag invalidates every cached payload for
that locale as a safety net.

## Direct-write sites patched

These previously bypassed adminApi and now call invalidatePublicCache
explicitly:

- `app/mukisoftadmin/(authenticated)/settings/settings-editor.tsx` —
  site_settings upsert
- `app/mukisoftadmin/(authenticated)/blog/blog-manager.tsx` —
  blog_posts insert/update, blog_post_tags insert/delete, blog_posts
  publish status toggle, blog_categories create, blog_tags create

## What this means for the admin

1. Edit a team member photo in `/mukisoftadmin/team` → it appears on
   `https://mukisoft.tech/en/team` within seconds (no 60 s wait).
2. Publish a Bangla translation in `/mukisoftadmin/translations` or in
   any entity editor's "Bangla" tab → the `/bn/*` page renders the
   translation immediately.
3. Change `site_settings.navbar_logo_size` in settings → the navbar
   height changes on every page across both locales.
4. Add a new portfolio project → it appears on `/en/work` and
   `/en/work/[slug]` right away.

## How to verify locally

1. `npm run dev`
2. Open `/mukisoftadmin` and log in.
3. Open the public site in another tab (incognito to bypass any
   browser cache) on `http://localhost:3000/en/<page>`.
4. Make a change in admin.
5. Refresh the public page — the change should appear within ~1 s
   (network round-trip to `/api/admin/revalidate`).

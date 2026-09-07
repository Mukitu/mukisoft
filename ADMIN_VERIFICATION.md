# Admin Panel ↔ Public Site — Full Verification

Last verified against `main` branch on the Vercel deployment.

## What was fixed

### 1. The silent cookie/cache bug — root cause

`lib/supabase/public.ts` wraps every public read in
`unstable_cache(...)` for ISR. Inside that wrapper it called
`createSupabaseServerClient()` — which calls `cookies()` from
`next/headers`. Next.js 14 throws:

> Route /en/team used "cookies" inside a function cached with
> "unstable_cache(...)". Accessing Dynamic data sources inside a cache
> scope is not supported.

The catch in `getClient()` swallowed the error and returned `null`,
so every public fetch quietly fell back to an empty array. The pages
rendered the "Public team profiles will appear here once published"
placeholder even when Supabase had real rows.

Fix: introduced `getPublicClient()` in `lib/supabase/public.ts` (and
the matching `getPublicTranslationClient()` in
`lib/i18n/apply-translations.ts`) that uses the bare
`@supabase/supabase-js` anon client — no cookies, no `next/headers`.
All cache-wrapped fetchers fall back to it. The translations read
inside `applyTranslations` (the `/bn/*` path) had the same bug and
was fixed in the same change.

### 2. New admin content defaults to PUBLISHED, not draft

Leadership, Team, Careers, Portfolio, Gallery, Research, About page:
when you click "Save" on a brand-new record, it is published by
default. Only an existing draft stays a draft until you click Publish.

### 3. Cache invalidation is more aggressive on Vercel

`/api/admin/revalidate` now calls `revalidatePath` with BOTH the
dynamic pattern (`/[locale]/team`) and the concrete per-locale paths
(`/en/team`, `/bn/team`). Some Vercel edge nodes respond faster to one
form, others to the other — covering both means the page cache is
flushed no matter which edge serves the next request.

### 4. Every admin mutation flushes the public site cache

`adminApi` (create/update/remove/publishToggle/publishStatusToggle)
calls `invalidatePublicCache` after every successful write. Direct DB
writes in the blog manager and settings editor also flush the cache
explicitly (they bypassed `adminApi`). `/api/translate` flushes the
cache for the affected entity after every save / publish / unpublish /
markStale / generate op, so Bangla translations appear immediately.

### 5. `fetchPublishedCareers` ordered by `display_order`

The `careers` table has no `display_order` column; the build failed
on this during prerender. Switched to `updated_at desc` so freshly
published roles surface first.

## End-to-end matrix

Verified locally with `node scripts/verify-public-pages.mjs` (9/9
PASS):

| Public page | DB rows rendered             | Status |
|-------------|------------------------------|--------|
| /en/team    | Mukitu (leader) + Tauhid     | PASS   |
| /bn/team    | Bangla chrome + leader row   | PASS   |
| /en/about   | About MukiSoft + Mission     | PASS   |
| /bn/about   | About (bn) + লক্ষ্য (Mission)| PASS   |
| /en/process | Strategy + Architecture      | PASS   |
| /en/portfolio | Task Management App        | PASS   |
| /en/research | Mitigating Transaction…     | PASS   |
| /en (home)  | Mukitu (leader cross-link)   | PASS   |
| /bn (home)  | মুকিসফট brand chrome        | PASS   |

| Admin menu     | Submenu / action           | Public page refreshed                       | Verified |
|----------------|----------------------------|---------------------------------------------|----------|
| Dashboard      | (stats only)               | n/a                                         | ✓        |
| Site Settings  | upsert site_settings       | every page (navbar/footer/OG/meta)          | ✓        |
| Pages → About  | create/update about_pages  | /, /about                                   | ✓        |
| Leadership     | create/update/toggle       | /, /about, /founder, /team                  | ✓        |
| Team           | create/update/toggle       | /, /team                                    | ✓        |
| Process        | create/update/toggle       | /, /process                                 | ✓        |
| Careers        | create/update/toggle       | /, /careers                                 | ✓        |
| Portfolio      | create/update/toggle       | /, /work, /work/[slug]                      | ✓        |
| Blog           | create/update/publish      | /, /blog, /blog/[slug]                      | ✓        |
| Gallery        | create/update/toggle       | /, /gallery, /gallery/[slug]                | ✓        |
| Research       | create/update/publish      | /, /research, /research/[slug]              | ✓        |
| Translations   | save/publish/regenerate    | /bn/* (locale-scoped)                       | ✓        |
| Media          | upload/delete              | n/a (internal asset library)                | ✓        |
| Profile        | admin_users updates        | n/a                                         | ✓        |

## How the data flow works after a save

```
admin clicks Save in /mukisoftadmin/leadership
  └─▶ adminApi.update('leadership', id, payload)
        ├─ supabase UPDATE (RLS-allowed)
        └─ flushCache('leadership')
              └─ invalidatePublicCache({ tables: ['leadership'] })
                    └─ fetch('/api/admin/revalidate', POST)
                          └─ revalidateTag('leadership')
                          └─ revalidateTag('en') + revalidateTag('bn')
                          └─ revalidatePath('/[locale]')
                          └─ revalidatePath('/[locale]/about')
                          └─ revalidatePath('/[locale]/founder')
                          └─ revalidatePath('/[locale]/team')
                          └─ (and the /en + /bn concrete variants)
```

The next visitor request hits a cold cache: Next.js rebuilds the page
fresh from Supabase, so the new leadership row appears.

## What you should do if a page still shows old data

1. Open `/mukisoftadmin/<entity>` and confirm the row is marked
   **Published** (not Draft).
2. Click **Unpublish** then **Publish** again — that re-triggers the
   cache flush on Vercel.
3. Hard-refresh the public page in an incognito tab (the public page
   uses ISR + CDN cache; incognito bypasses your browser cache).
4. If still stale after 60 s, the Vercel edge cache for that path
   needs an extra nudge — toggle the row's `is_published` once more
   (Unpublish → Publish) and the revalidation will fire again.
5. If a page still renders the empty-state placeholder when you can
   see the row in `/mukisoftadmin/<entity>`, hit
   `POST /api/admin/revalidate` while logged in as admin with body
   `{ tables: ["<table_name>"] }` to force a tag flush.


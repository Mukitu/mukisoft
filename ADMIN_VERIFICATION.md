# Admin Panel ↔ Public Site — Full Verification

Last verified against `main` branch on the Vercel deployment.

## What was fixed

1. **New admin content now defaults to PUBLISHED, not draft.**
   - Leadership, Team, Careers, Portfolio, Gallery, Research, About page:
     when you click "Save" on a brand-new record, it is published by
     default. Only an existing draft stays a draft until you click
     Publish.
   - Process steps already had `is_published: true` in their empty
     form, so no change needed.
   - Blog posts still use explicit `Save Draft` / `Publish` because
     editorial review makes sense for blog content.
2. **Cache invalidation is more aggressive on Vercel.**
   - `/api/admin/revalidate` now calls `revalidatePath` with BOTH the
     dynamic pattern (`/[locale]/team`) and the concrete per-locale
     paths (`/en/team`, `/bn/team`). Some Vercel edge nodes respond
     faster to one form, others to the other — covering both means the
     page cache is flushed no matter which edge serves the next
     request.
3. **Every admin mutation flushes the public site cache.**
   - `adminApi` (create/update/remove/publishToggle/publishStatusToggle)
     now calls `invalidatePublicCache` after every successful write.
   - Direct DB writes in the blog manager and settings editor also
     flush the cache explicitly (they bypassed `adminApi`).
   - `/api/translate` flushes the cache for the affected entity after
     every save / publish / unpublish / markStale / generate op, so
     Bangla translations appear immediately.
4. **Home page revalidates on every admin write.**
   - The home page pulls from `site_settings`, leadership, process and
     portfolio. We revalidate `/[locale]` (i.e. both `/en/` and
     `/bn/`) on every relevant table write so the home page is always
     fresh.

## End-to-end matrix

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

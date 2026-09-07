-- ============================================================
-- MukiSoft Technology — Storage bucket MIME allow-list guard
-- File: supabase/migrations/0011_storage_mime_allowlist.sql
--
-- Defensive: some Supabase buckets were created before the
-- `supabase/storage.sql` script was run, or were recreated via the
-- dashboard without an explicit `allowed_mime_types` list. Supabase
-- then silently defaults to an empty allow-list on some plans, which
-- causes uploads to fail with errors like:
--
--   "mime type image/jpeg is not supported"
--
-- This migration re-applies the canonical allow-list used by the
-- rest of the app (images + PDF) on the `mukisoft-media` bucket.
-- Idempotent: missing MIME types are appended, never removed — that
-- way re-running this migration never breaks a previous setup that
-- already had additional MIME types approved.
--
-- The canonical image list matches `supabase/storage.sql`:
--   image/png, image/jpeg, image/jpg, image/webp,
--   image/gif, image/svg+xml, image/avif
-- plus `application/pdf` added in migration 0010.
-- ============================================================

do $$
declare
  required_mimes text[] := array[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
    'application/pdf'
  ];
  current_mimes text[];
  m text;
begin
  select coalesce(allowed_mime_types, '{}'::text[])
    into current_mimes
    from storage.buckets
   where id = 'mukisoft-media';

  -- If the bucket row is missing entirely, bail out with a clear hint.
  if current_mimes is null then
    raise notice 'mukisoft-media bucket not found — run supabase/storage.sql first.';
    return;
  end if;

  -- Append any missing MIME types from the canonical list.
  foreach m in array required_mimes loop
    if not (m = any(current_mimes)) then
      current_mimes := array_cat(current_mimes, array[m]);
    end if;
  end loop;

  update storage.buckets
     set allowed_mime_types = current_mimes
   where id = 'mukisoft-media';
end$$;

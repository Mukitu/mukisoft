import 'server-only';
import { fetchSiteSettings } from '@/lib/supabase/public';
import { setCompanySettings, hasCompanySettings } from '@/lib/config/company';

/**
 * Server-only helper. Lazy-fetches `site_settings` and hydrates the
 * per-request company cache used by `company` in
 * `@/lib/config/company`. Safe to call from any server component or
 * `generateMetadata()` — including ones that run in parallel with
 * the layout, before the layout has had a chance to seed the cache.
 *
 * Only fetches when the cache is truly unset for this request; if
 * the layout already ran (and even recorded a `null` row), returns
 * immediately.
 */
export async function ensureCompanySettings() {
  if (hasCompanySettings()) return null;
  const settings = await fetchSiteSettings();
  setCompanySettings(settings);
  return settings;
}
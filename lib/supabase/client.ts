import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ENV, isSupabaseConfigured } from './env';
import type { Database } from './types';

/**
 * Browser-side Supabase client.
 *
 * Safe to import in client components — it only uses the public
 * anon/publishable key. The service-role key is never used here.
 *
 * Throws when called from the browser without Supabase configured, so
 * admins see a clear error rather than silent failures. Server-side
 * callers should use `createSupabaseServerClient()` instead.
 */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    );
  }
  return createBrowserClient<Database>(SUPABASE_ENV.url, SUPABASE_ENV.anonKey);
}
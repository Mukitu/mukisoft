import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_ENV, isSupabaseConfigured } from './env';
import type { Database } from './types';

/**
 * Server-side Supabase client for use in Server Components, Route
 * Handlers and Server Actions.
 *
 * Reads/writes the Supabase session cookies through Next.js cookies().
 * Only uses the public anon/publishable key.
 *
 * When Supabase is not yet configured (e.g. build-time prerender before
 * `.env.local` is set up), this returns null instead of throwing. Callers
 * must check for null and render an empty state in that case.
 */
export function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null as unknown as ReturnType<typeof createServerClient<Database>>;
  }
  const cookieStore = cookies();

  return createServerClient<Database>(SUPABASE_ENV.url, SUPABASE_ENV.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component — ignore. Route Handlers
          // and Server Actions are the only writers in this app.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Same rationale as above.
        }
      },
    },
  });
}

/**
 * Like `createSupabaseServerClient`, but returns null when Supabase is not
 * configured. Use this in admin server pages so a missing `.env.local`
 * during build/preview renders an empty shell rather than crashing.
 */
export function getAdminServerClient() {
  return createSupabaseServerClient() as unknown as ReturnType<typeof createServerClient<Database>> | null;
}
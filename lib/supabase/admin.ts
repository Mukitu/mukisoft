import { createSupabaseServerClient } from './server';
import { createSupabaseBrowserClient } from './client';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import { SUPABASE_ENV } from './env';
import type { AdminUser } from './types';

/**
 * Server-side: returns the currently authenticated Supabase user (or null).
 */
export async function getServerUser() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Server-side: returns the admin record for the authenticated user.
 *
 * Authorization is determined strictly from the database:
 *   auth.uid() matches admin_users.user_id
 *   role = 'admin'
 *   is_active = true
 */
export async function getServerAdmin(): Promise<AdminUser | null> {
  const user = await getServerUser();
  if (!user) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminUser;
}

export async function isAdmin(): Promise<boolean> {
  const admin = await getServerAdmin();
  return !!admin;
}

/**
 * Browser-side: returns the current admin record (or null).
 */
export async function getBrowserAdmin(): Promise<AdminUser | null> {
  const supabase = createSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle();
  return (data as AdminUser | null) ?? null;
}

/**
 * Server-side anonymous Supabase client (uses the service-role key if
 * available, otherwise falls back to the anon key).
 *
 * Used ONLY for admin-side database queries that need to bypass RLS
 * after the admin authorization check has already passed. The
 * service-role key is read from SUPABASE_SERVICE_ROLE_KEY and is never
 * exposed through NEXT_PUBLIC_*.
 */
let cachedServiceClient: ReturnType<typeof createPlainClient> | null = null;

export function getServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Server-side admin writes require it.',
    );
  }
  if (!cachedServiceClient) {
    cachedServiceClient = createPlainClient(SUPABASE_ENV.url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedServiceClient;
}

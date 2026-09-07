/**
 * Centralised Supabase environment access.
 *
 * Only the public anon/publishable key is read from environment
 * variables. The service-role key is never imported here and must
 * never be exposed through NEXT_PUBLIC_* variables.
 */
export const SUPABASE_ENV = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export function isSupabaseConfigured(): boolean {
  return (
    !!SUPABASE_ENV.url &&
    !!SUPABASE_ENV.anonKey &&
    !SUPABASE_ENV.url.includes('YOUR_SUPABASE_URL') &&
    !SUPABASE_ENV.anonKey.includes('YOUR_SUPABASE_ANON_KEY')
  );
}

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TranslationsConsole } from './translations-console';

export const dynamic = 'force-dynamic';

export default async function AdminTranslationsPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await (supabase.from('translations') as any)
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[admin/translations] query failed:', error.message);
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Translations</h2>
          <p>
            Inspect, edit, regenerate and publish translations cached for the public site.
            English is the canonical source — Bangla rows are generated from it.
          </p>
        </div>
      </div>
      <TranslationsConsole initialRows={(data as any[]) ?? []} />
    </div>
  );
}

import { SettingsEditor } from './settings-editor';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SiteSetting } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function SettingsAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Site Settings & SEO</h2>
          <p>Manage global company information and SEO defaults.</p>
        </div>
      </div>
      <SettingsEditor initial={(data as SiteSetting | null) ?? null} />
    </div>
  );
}
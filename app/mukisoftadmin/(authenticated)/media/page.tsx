import { MediaManager } from './media-manager';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { MediaAsset } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function MediaAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false });
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Media</h2>
          <p>Manage images and assets. Existing local assets in <code>/public/assets/</code> continue to work.</p>
        </div>
      </div>
      <MediaManager initial={(data as MediaAsset[] | null) ?? []} />
    </div>
  );
}
import { CareersManager } from './careers-manager';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Career } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function CareersAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('careers')
    .select('*')
    .order('created_at', { ascending: false });
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Careers</h2>
          <p>Manage open positions shown on the public Careers page.</p>
        </div>
      </div>
      <CareersManager initial={(data as Career[] | null) ?? []} />
    </div>
  );
}
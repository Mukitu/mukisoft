import { LeadershipManager } from './leadership-manager';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Leadership } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function LeadershipAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('leadership')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Leadership</h2>
          <p>Manage executive profiles shown on the public Founder/Leadership page.</p>
        </div>
      </div>
      <LeadershipManager initial={(data as Leadership[] | null) ?? []} />
    </div>
  );
}
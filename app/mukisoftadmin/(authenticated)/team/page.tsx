import { TeamManager } from './team-manager';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { TeamMember } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function TeamAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Team</h2>
          <p>Manage team members shown on the public Team page.</p>
        </div>
      </div>
      <TeamManager initial={(data as TeamMember[] | null) ?? []} />
    </div>
  );
}
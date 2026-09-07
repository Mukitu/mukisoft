import { ProcessManager } from './process-manager';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProcessStep } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function ProcessAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('process_steps')
    .select('*')
    .order('display_order', { ascending: true });
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Our Process</h2>
          <p>Manage the eight-stage engineering process shown on the public Process page.</p>
        </div>
      </div>
      <ProcessManager initial={(data as ProcessStep[] | null) ?? []} />
    </div>
  );
}
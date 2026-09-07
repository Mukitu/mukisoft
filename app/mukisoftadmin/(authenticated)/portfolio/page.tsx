import { PortfolioManager } from './portfolio-manager';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { PortfolioProject } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function PortfolioAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('display_order', { ascending: true });
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Selected Work / Portfolio</h2>
          <p>Manage the projects shown on the public Portfolio page.</p>
        </div>
      </div>
      <PortfolioManager initial={(data as PortfolioProject[] | null) ?? []} />
    </div>
  );
}
import { AboutEditor } from './about-editor';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AboutPage } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function AboutAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('about_pages')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const about: AboutPage | null = (data as AboutPage | null) ?? null;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>About page</h2>
          <p>Edit the About page content. Save as draft, then publish when ready.</p>
        </div>
      </div>
      <AboutEditor initial={about} />
    </div>
  );
}
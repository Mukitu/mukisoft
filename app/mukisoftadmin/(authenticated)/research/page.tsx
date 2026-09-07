import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ResearchPaper, ResearchPaperAuthor, TeamMember } from '@/lib/supabase/types';
import { ResearchManager } from './research-manager';

export const dynamic = 'force-dynamic';

export default async function AdminResearchPage() {
  const supabase = createSupabaseServerClient();
  // Each Supabase query returns `{ data, error }` — destructure the
  // rows out before grouping them. Doing it inside `Promise.all` would
  // give us an array of those wrappers, which breaks `.reduce`.
  const [
    { data: papersData, error: papersError },
    { data: authorsData, error: authorsError },
    { data: teamData, error: teamError },
  ] = await Promise.all([
    (supabase.from('research_papers') as any)
      .select('*')
      .order('display_order', { ascending: true })
      .order('publication_date', { ascending: false, nullsFirst: false }),
    (supabase.from('research_paper_authors') as any)
      .select('*')
      .order('display_order', { ascending: true }),
    (supabase.from('team_members') as any)
      .select('id, name, role, image_url')
      .order('display_order', { ascending: true }),
  ]);

  if (papersError) {
    console.error('[admin/research] papers query failed:', papersError.message);
  }
  if (authorsError) {
    console.error('[admin/research] authors query failed:', authorsError.message);
  }
  if (teamError) {
    console.error('[admin/research] team query failed:', teamError.message);
  }

  const authorsByPaper = ((authorsData ?? []) as ResearchPaperAuthor[]).reduce<
    Record<string, ResearchPaperAuthor[]>
  >((acc, a) => {
    const list = acc[a.paper_id] ?? [];
    list.push(a);
    acc[a.paper_id] = list;
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Research Papers</h2>
          <p>Manage research papers, publications and authors.</p>
        </div>
      </div>
      <ResearchManager
        initialPapers={(papersData as ResearchPaper[] | null) ?? []}
        initialAuthorsByPaper={authorsByPaper}
        teamMembers={((teamData ?? []) as TeamMember[]).map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role,
        }))}
      />
    </div>
  );
}
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type Stat = { label: string; value: number };
type RecentItem = { section: string; title: string; updated_at: string; status: string };

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient() as ReturnType<typeof createSupabaseServerClient> | null;
  if (!supabase) {
    return (
      <div className="admin-card">
        <div className="admin-card-pad">
          <h3 className="admin-card-title">Supabase is not configured.</h3>
          <p className="admin-card-sub">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
            your <code>.env.local</code> file, then refresh.
          </p>
        </div>
      </div>
    );
  }

  const [
    portfolioCount,
    teamCount,
    leadershipCount,
    processCount,
    careersCount,
    blogCount,
    galleryCount,
    researchCount,
    portfolioPublished,
    leadershipPublished,
    teamPublished,
    careersPublished,
    processPublished,
    blogPublished,
    galleryPublished,
    researchPublished,
    portfolioRecent,
    teamRecent,
    careersRecent,
    blogRecent,
    galleryRecent,
    researchRecent,
    aboutStatus,
  ] = await Promise.all([
    safeCount(supabase, 'portfolio_projects'),
    safeCount(supabase, 'team_members'),
    safeCount(supabase, 'leadership'),
    safeCount(supabase, 'process_steps'),
    safeCount(supabase, 'careers'),
    safeCount(supabase, 'blog_posts'),
    safeCount(supabase, 'gallery_events'),
    safeCount(supabase, 'research_papers'),
    safeCount(supabase, 'portfolio_projects', { is_published: true }),
    safeCount(supabase, 'leadership', { is_published: true }),
    safeCount(supabase, 'team_members', { is_published: true }),
    safeCount(supabase, 'careers', { is_published: true }),
    safeCount(supabase, 'process_steps', { is_published: true }),
    safeCount(supabase, 'blog_posts', { status: 'published' }),
    safeCount(supabase, 'gallery_events', { is_published: true }),
    safeCount(supabase, 'research_papers', { published: true }),
    safeRecent(supabase, 'portfolio_projects', 'title'),
    safeRecent(supabase, 'team_members', 'name'),
    safeRecent(supabase, 'careers', 'job_title'),
    safeRecent(supabase, 'blog_posts', 'title', 'status'),
    safeRecent(supabase, 'gallery_events', 'title', 'is_published'),
    safeRecent(supabase, 'research_papers', 'title', 'published'),
    safeAboutStatus(supabase),
  ]);

  const stats: Stat[] = [
    { label: 'Published Portfolio', value: portfolioPublished },
    { label: 'Published Blog Posts', value: blogPublished },
    { label: 'Published Team', value: teamPublished },
    { label: 'Open Positions', value: careersPublished },
    { label: 'Process Steps', value: processPublished },
    { label: 'Leadership', value: leadershipPublished },
    { label: 'Gallery Events', value: galleryCount },
    { label: 'Published Gallery Events', value: galleryPublished },
    { label: 'Research Papers', value: researchCount },
    { label: 'Published Research Papers', value: researchPublished },
    { label: 'About page', value: aboutStatus === 'published' ? 1 : 0 },
    { label: 'Total Projects', value: portfolioCount },
    { label: 'Total Blog Posts', value: blogCount },
    { label: 'Total Team Members', value: teamCount },
    { label: 'Total Career Posts', value: careersCount },
  ];

  const recent: RecentItem[] = [
    ...portfolioRecent.map((r: { title: string; updated_at: string; status: string }) => ({ ...r, section: 'Portfolio' })),
    ...blogRecent.map((r: { title: string; updated_at: string; status: string }) => ({ ...r, section: 'Blog' })),
    ...teamRecent.map((r: { title: string; updated_at: string; status: string }) => ({ ...r, section: 'Team' })),
    ...careersRecent.map((r: { title: string; updated_at: string; status: string }) => ({ ...r, section: 'Careers' })),
    ...galleryRecent.map((r: { title: string; updated_at: string; status: string }) => ({ ...r, section: 'Gallery' })),
    ...researchRecent.map((r: { title: string; updated_at: string; status: string }) => ({ ...r, section: 'Research' })),
  ]
    .sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1))
    .slice(0, 10);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Real-time overview of MukiSoft Technology content.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/mukisoftadmin/portfolio" className="admin-btn">Add portfolio</Link>
          <Link href="/mukisoftadmin/blog" className="admin-btn primary">New blog post</Link>
        </div>
      </div>

      <div className="admin-grid admin-grid-4" style={{ marginBottom: '1.5rem' }}>
        {stats.map((s) => (
          <div className="admin-stat-card" key={s.label}>
            <span className="label">{s.label}</span>
            <span className="value">{s.value}</span>
            <span className="meta">Database count</span>
          </div>
        ))}
      </div>

      <div className="admin-grid admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-pad">
            <h3 className="admin-card-title">Recently updated content</h3>
            <p className="admin-card-sub">Latest records by <code>updated_at</code>.</p>
            {recent.length === 0 ? (
              <div className="admin-empty">
                <h4>No content yet</h4>
                <p>When you publish or edit content, the latest updates appear here.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r, idx) => (
                      <tr key={`${r.section}-${idx}`}>
                        <td>{r.section}</td>
                        <td style={{ fontWeight: 500 }}>{r.title}</td>
                        <td>
                          {r.status === 'published' ? (
                            <span className="admin-badge is-published">Published</span>
                          ) : (
                            <span className="admin-badge is-draft">Draft</span>
                          )}
                        </td>
                        <td>{formatDate(r.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-pad">
            <h3 className="admin-card-title">Quick actions</h3>
            <p className="admin-card-sub">Common content tasks.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/mukisoftadmin/pages/about" className="admin-btn">Edit About page</Link>
              <Link href="/mukisoftadmin/leadership" className="admin-btn">Update leadership</Link>
              <Link href="/mukisoftadmin/team" className="admin-btn">Manage team</Link>
              <Link href="/mukisoftadmin/process" className="admin-btn">Edit process steps</Link>
              <Link href="/mukisoftadmin/careers" className="admin-btn">Manage careers</Link>
              <Link href="/mukisoftadmin/portfolio" className="admin-btn">Manage portfolio</Link>
              <Link href="/mukisoftadmin/blog" className="admin-btn">Manage blog</Link>
              <Link href="/mukisoftadmin/gallery" className="admin-btn">Manage gallery</Link>
              <Link href="/mukisoftadmin/research" className="admin-btn">Manage research papers</Link>
              <Link href="/mukisoftadmin/media" className="admin-btn">Upload media</Link>
              <Link href="/mukisoftadmin/settings" className="admin-btn">Site settings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function safeCount(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  table:
    | 'portfolio_projects'
    | 'team_members'
    | 'leadership'
    | 'process_steps'
    | 'careers'
    | 'blog_posts'
    | 'gallery_events'
    | 'research_papers',
  filter?: Record<string, unknown>,
) {
  let query: any = (supabase.from(table) as any).select('id', { count: 'exact', head: true });
  if (filter) query = query.match(filter);
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

async function safeRecent(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  table:
    | 'portfolio_projects'
    | 'team_members'
    | 'careers'
    | 'blog_posts'
    | 'gallery_events'
    | 'research_papers',
  titleField: string,
  statusField: 'is_published' | 'status' | 'published' = 'is_published',
) {
  const { data, error } = await (supabase.from(table) as any)
    .select(`${titleField}, updated_at, ${statusField}`)
    .order('updated_at', { ascending: false })
    .limit(5);
  if (error || !data) return [] as Array<{ title: string; updated_at: string; status: string }>;
  return data.map((row: Record<string, unknown>) => ({
    title: String(row[titleField] ?? 'Untitled'),
    updated_at: String(row.updated_at ?? ''),
    status: row[statusField] ? 'published' : 'draft',
  }));
}

async function safeAboutStatus(
  supabase: ReturnType<typeof createSupabaseServerClient>,
): Promise<'draft' | 'published' | 'missing'> {
  const { data } = await (supabase.from('about_pages') as any)
    .select('status')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return 'missing';
  return 'published';
}

function formatDate(value: string) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { AdminShell } from '@/components/admin/admin-sidebar';

type Props = {
  email: string;
  children: ReactNode;
};

const titleMap: Array<{ match: RegExp; title: string; description?: string }> = [
  { match: /^\/mukisoftadmin\/dashboard$/, title: 'Dashboard', description: 'Overview of your content and site activity.' },
  { match: /^\/mukisoftadmin\/pages\/about$/, title: 'About Page', description: 'Edit the public About page.' },
  { match: /^\/mukisoftadmin\/leadership$/, title: 'Leadership', description: 'Manage leadership profiles shown on the site.' },
  { match: /^\/mukisoftadmin\/team$/, title: 'Team', description: 'Manage team members shown on the site.' },
  { match: /^\/mukisoftadmin\/process$/, title: 'Process Steps', description: 'Manage the steps shown on the Process page.' },
  { match: /^\/mukisoftadmin\/careers$/, title: 'Careers', description: 'Manage open roles and career content.' },
  { match: /^\/mukisoftadmin\/portfolio$/, title: 'Portfolio', description: 'Manage portfolio projects shown on the site.' },
  { match: /^\/mukisoftadmin\/blog$/, title: 'Blog', description: 'Manage blog posts shown on the public blog.' },
  { match: /^\/mukisoftadmin\/gallery$/, title: 'Gallery', description: 'Manage company events and gallery photos.' },
  { match: /^\/mukisoftadmin\/research$/, title: 'Research Papers', description: 'Manage research papers and publications.' },
  { match: /^\/mukisoftadmin\/media$/, title: 'Media Library', description: 'Upload images and assets used across the site.' },
  { match: /^\/mukisoftadmin\/settings$/, title: 'Site Settings', description: 'Brand, contact and SEO defaults for the public site.' },
  { match: /^\/mukisoftadmin\/profile$/, title: 'Admin Profile', description: 'Manage your account.' },
];

export function AdminShellWrapper({ email, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const { title, description } = useMemo(() => {
    const hit = titleMap.find((entry) => entry.match.test(pathname));
    return {
      title: hit?.title ?? 'Admin',
      description: hit?.description,
    };
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore — redirect anyway
    }
    router.replace('/mukisoftadmin/login');
    router.refresh();
  }, [router]);

  // Listen for auth changes; if the session is removed, bounce to login.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/mukisoftadmin/login');
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AdminShell email={email} onLogout={handleLogout} title={title} description={description}>
      {children}
    </AdminShell>
  );
}
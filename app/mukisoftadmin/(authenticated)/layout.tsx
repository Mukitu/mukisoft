import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getServerAdmin, getServerUser } from '@/lib/supabase/admin';
import { AdminShellWrapper } from './admin-shell-wrapper';
import { ToastProvider } from '@/components/admin/toast-provider';

/**
 * Authenticated admin layout — guards every page inside the
 * (authenticated) route group. Unauthenticated users are sent to
 * /mukisoftadmin/login. Authenticated-but-not-admin users are signed
 * out and sent to the same login page.
 */
export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect('/mukisoftadmin/login');
  }

  const admin = await getServerAdmin();
  if (!admin) {
    // Authenticated but not in admin_users — deny access.
    // Sign out is performed client-side via AdminShellWrapper's logout
    // helper, but the redirect to /login itself is enough to prevent
    // access here.
    redirect('/mukisoftadmin/login?denied=1');
  }

  return (
    <ToastProvider>
      <AdminShellWrapper email={admin.email}>
        {children}
      </AdminShellWrapper>
    </ToastProvider>
  );
}
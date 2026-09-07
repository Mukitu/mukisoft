/**
 * Root layout for the /mukisoftadmin section.
 *
 * The login route (/mukisoftadmin/login) renders WITHOUT the
 * sidebar/admin chrome. The (authenticated) route group adds the
 * sidebar + auth guard.
 */
import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin · MukiSoft Technology',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-root">{children}</div>;
}
import { AdminProfile } from './admin-profile';
import { getServerAdmin, getServerUser } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getServerUser();
  const admin = await getServerAdmin();
  return <AdminProfile email={user?.email ?? ''} role={admin?.role ?? 'admin'} createdAt={admin?.created_at ?? ''} />;
}
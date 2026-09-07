'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/toast-provider';

type Props = {
  email: string;
  role: string;
  createdAt: string;
};

export function AdminProfile({ email, role, createdAt }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      push('Password must be at least 8 characters.', 'error');
      return;
    }
    if (password !== confirm) {
      push('Passwords do not match.', 'error');
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      push('Password updated.', 'success');
      setPassword('');
      setConfirm('');
    } catch (err) {
      push((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      push('Signed out.', 'info');
      router.replace('/mukisoftadmin/login');
      router.refresh();
    } catch (err) {
      push((err as Error).message, 'error');
      setSigningOut(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Admin Profile</h2>
          <p>Account details and security controls.</p>
        </div>
      </div>

      <div className="admin-grid admin-grid-2" style={{ alignItems: 'start' }}>
        <div className="admin-card">
          <div className="admin-card-pad">
            <h3 className="admin-card-title">Account</h3>
            <p className="admin-card-sub">Information from Supabase Auth and admin_users.</p>
            <dl style={{ display: 'grid', gap: '0.75rem' }}>
              <Row label="Email" value={email} />
              <Row label="Role" value={role} />
              <Row label="Status" value="Active" />
              <Row label="Member since" value={createdAt ? new Date(createdAt).toLocaleDateString() : '—'} />
            </dl>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-pad">
            <h3 className="admin-card-title">Change password</h3>
            <p className="admin-card-sub">Use a strong password. Stored only in Supabase Auth.</p>
            <form className="admin-form" onSubmit={handleChangePassword}>
              <div className="admin-field">
                <label>New password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="admin-field">
                <label>Confirm password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className="admin-btn primary" disabled={busy}>
                {busy ? <span className="admin-spinner" /> : null}
                Update password
              </button>
            </form>
          </div>
        </div>

        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 className="admin-card-title">Sign out</h3>
              <p className="admin-card-sub">End your admin session on this device.</p>
            </div>
            <button type="button" className="admin-btn danger" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? <span className="admin-spinner" /> : null}
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--admin-border)' }}>
      <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--admin-text-dim)' }}>
        {label}
      </dt>
      <dd style={{ margin: 0, fontSize: '0.875rem' }}>{value}</dd>
    </div>
  );
}
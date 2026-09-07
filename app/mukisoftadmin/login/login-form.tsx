'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get('redirect') ?? '/mukisoftadmin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [email, password]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      setError('Supabase is not configured. Please set environment variables first.');
      return;
    }
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError || !data.user) {
        setError('Invalid email or password.');
        setBusy(false);
        return;
      }

      // Verify admin authorization via admin_users table.
      const { data: adminRow, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .maybeSingle();

      if (adminError || !adminRow) {
        // Authenticated but not an admin — sign out immediately.
        await supabase.auth.signOut();
        setError('You do not have permission to access the MukiSoft Technology administration panel.');
        setBusy(false);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in.';
      setError(message);
      setBusy(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      {error ? (
        <div className="admin-alert error" role="alert">
          <span>{error}</span>
        </div>
      ) : null}
      <div className="admin-field">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={!configured || busy}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={!configured || busy}
        />
      </div>
      <button
        type="submit"
        className="admin-btn primary"
        disabled={!configured || busy || !email || !password}
        style={{ marginTop: '0.5rem' }}
      >
        {busy ? <span className="admin-spinner" /> : null}
        Sign In
      </button>
    </form>
  );
}
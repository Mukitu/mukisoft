import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="admin-brand-mark">MS</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>MukiSoft Technology</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Admin Console
            </div>
          </div>
        </div>
        <h1>Sign in to the admin panel</h1>
        <p>Enter your authorized MukiSoft Technology administrator credentials.</p>

        <Suspense fallback={<div className="admin-form" style={{ minHeight: 220 }} aria-busy="true" />}>
          <LoginForm configured={configured} />
        </Suspense>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)', fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
          Access is restricted to authorized administrators only. All sign-in attempts are protected by Supabase Auth and Row Level Security.
        </div>
      </div>
    </div>
  );
}
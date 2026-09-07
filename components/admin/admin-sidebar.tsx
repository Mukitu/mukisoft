'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';

type IconName = 'dashboard' | 'pages' | 'leadership' | 'team' | 'process' | 'careers' | 'portfolio' | 'blog' | 'gallery' | 'research' | 'media' | 'settings' | 'profile' | 'logout' | 'menu' | 'close' | 'arrow' | 'translations';

type NavEntry = {
  href: string;
  label: string;
  icon: IconName;
};

const primaryNav: NavEntry[] = [
  { href: '/mukisoftadmin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/mukisoftadmin/pages/about', label: 'Pages', icon: 'pages' },
  { href: '/mukisoftadmin/leadership', label: 'Leadership', icon: 'leadership' },
  { href: '/mukisoftadmin/team', label: 'Team', icon: 'team' },
  { href: '/mukisoftadmin/process', label: 'Process', icon: 'process' },
  { href: '/mukisoftadmin/careers', label: 'Careers', icon: 'careers' },
  { href: '/mukisoftadmin/portfolio', label: 'Portfolio', icon: 'portfolio' },
  { href: '/mukisoftadmin/blog', label: 'Blog', icon: 'blog' },
  { href: '/mukisoftadmin/gallery', label: 'Gallery', icon: 'gallery' },
  { href: '/mukisoftadmin/research', label: 'Research', icon: 'research' },
  { href: '/mukisoftadmin/translations', label: 'Translations', icon: 'translations' },
  { href: '/mukisoftadmin/media', label: 'Media', icon: 'media' },
  { href: '/mukisoftadmin/settings', label: 'Site Settings', icon: 'settings' },
];

function Icon({ name }: { name: IconName }) {
  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case 'pages':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
        </svg>
      );
    case 'leadership':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      );
    case 'team':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'process':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case 'careers':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'portfolio':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      );
    case 'blog':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="16" y2="7" />
          <line x1="9" y1="11" x2="16" y2="11" />
          <line x1="9" y1="15" x2="13" y2="15" />
        </svg>
      );
    case 'gallery':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case 'research':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6l5 5v11a2 2 0 0 1-2 2H9" />
          <path d="M9 3v6H3" />
          <path d="M3 9v10a2 2 0 0 0 2 2h4" />
          <path d="M14 13h4" />
          <path d="M14 17h4" />
          <path d="M14 9h4" />
        </svg>
      );
    case 'media':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case 'translations':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5h7" />
          <path d="M9 3v2c0 4-3 7-5 8" />
          <path d="M5 9c0 4 4 6 8 6" />
          <path d="M12 20l4-9 4 9" />
          <path d="M13.5 17h5" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      );
    case 'close':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'arrow':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminShell({
  email,
  title,
  description,
  children,
  onLogout,
}: {
  email: string;
  title: string;
  description?: string;
  children: ReactNode;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/mukisoftadmin/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const closeDrawer = () => setOpen(false);

  return (
    <div className="admin-shell">
      <button
        type="button"
        className="admin-sidebar-overlay"
        aria-label="Close navigation"
        onClick={closeDrawer}
        data-open={open}
        style={open ? { display: 'block', opacity: 1, pointerEvents: 'auto' } : undefined}
      />
      <aside
        className="admin-sidebar"
        data-open={open}
        style={open ? { transform: 'translateX(0)' } : undefined}
      >
        <div className="admin-brand">
          <span className="admin-brand-mark">MS</span>
          <div className="admin-brand-text">
            <strong>MukiSoft Admin</strong>
            <span>Content Studio</span>
          </div>
          <button
            type="button"
            className="admin-btn sm ghost"
            aria-label="Close navigation"
            onClick={closeDrawer}
            style={{ marginLeft: 'auto', padding: 4 }}
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Primary admin navigation">
          <span className="admin-nav-label">Manage</span>
          {primaryNav.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className={`admin-nav-link${isActive(entry.href) ? ' is-active' : ''}`}
              onClick={closeDrawer}
            >
              <Icon name={entry.icon} />
              <span>{entry.label}</span>
            </Link>
          ))}

          <span className="admin-nav-label">Account</span>
          <Link
            href="/mukisoftadmin/profile"
            className={`admin-nav-link${isActive('/mukisoftadmin/profile') ? ' is-active' : ''}`}
            onClick={closeDrawer}
          >
            <Icon name="profile" />
            <span>Admin Profile</span>
          </Link>
          <button
            type="button"
            className="admin-nav-link"
            onClick={() => {
              closeDrawer();
              onLogout();
            }}
            style={{ background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}
          >
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            Signed in as
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-btn"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <div>
              <h1>{title}</h1>
              {description ? <p>{description}</p> : null}
            </div>
          </div>
          <Link href="/mukisoftadmin/profile" className="admin-pill">
            <Icon name="profile" />
            <span>Account</span>
          </Link>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
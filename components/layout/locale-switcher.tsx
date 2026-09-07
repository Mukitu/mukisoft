'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { locales, localeShortLabels, COOKIE_NAME, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

/**
 * Persistent language switcher.
 *
 * Renders the inactive locale as a link so users can switch by clicking.
 * On click we update the cookie + localStorage and navigate to the same
 * path under the target locale.
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const switchTo = React.useCallback(
    (target: Locale) => {
      if (typeof document !== 'undefined') {
        document.cookie = `${COOKIE_NAME}=${target}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        try {
          window.localStorage.setItem('mukisoft_lang', target);
        } catch {
          /* no-op */
        }
      }
      // Strip current locale prefix, then prefix with new locale.
      const stripped = stripLocale(pathname);
      const nextPath = `/${target}${stripped === '/' ? '' : stripped}` || '/';
      router.push(nextPath);
      router.refresh();
    },
    [pathname, router],
  );

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-ink-200 bg-white/70 p-0.5 text-xs font-medium backdrop-blur"
      role="group"
      aria-label={t('language')}
    >
      {locales.map((loc) => {
        const active = loc === current;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => (active ? undefined : switchTo(loc))}
            aria-current={active ? 'true' : undefined}
            aria-pressed={active}
            className={cn(
              'inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-full px-2 transition-colors',
              active
                ? 'bg-ink-900 text-white shadow-soft'
                : 'text-ink-700 hover:bg-ink-100',
              !mounted && 'opacity-0',
              mounted && 'opacity-100 transition-opacity',
            )}
          >
            {localeShortLabels[loc]}
          </button>
        );
      })}
    </div>
  );
}

function stripLocale(pathname: string): string {
  for (const l of locales) {
    const prefix = `/${l}`;
    if (pathname === prefix) return '/';
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { primaryNavigation } from '@/lib/data/navigation';
import { type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

type NavItem = (typeof primaryNavigation)[number];

const NAV_LABEL_MAP: Record<string, string> = {
  Home: 'home',
  Company: 'company',
  Capabilities: 'capabilities',
  Work: 'work',
  Blog: 'blog',
  Contact: 'contact',
};

const NAV_DESC_MAP: Record<string, string> = {
  'Who we are and what we believe': 'about',
  'The leadership behind MukiSoft': 'leadership',
  'The people behind the technology': 'team',
  'How MukiSoft delivers': 'process',
  'Building a career with us': 'careers',
  'Our portfolio across categories': 'portfolio',
  'Events, moments & company activities': 'gallery',
  'Research papers and publications by MukiSoft': 'research',
};

function translateLabel(text: string, t: ReturnType<typeof useTranslations>): string {
  const key = NAV_LABEL_MAP[text];
  if (!key) return text;
  try {
    return t(key as never);
  } catch {
    return text;
  }
}

function translateDesc(text: string, t: ReturnType<typeof useTranslations>): string {
  const key = NAV_DESC_MAP[text];
  if (!key) return text;
  try {
    return t(key as never);
  } catch {
    return text;
  }
}

export function Navbar({
  logoUrl,
  logoHeightPx,
  locale,
}: {
  logoUrl?: string;
  logoHeightPx?: number;
  locale: Locale;
}) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tDesc = useTranslations('navDescriptions');
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-ink-200/70 bg-white/80 backdrop-blur-xl'
            : 'border-b border-transparent bg-white/40 backdrop-blur-md',
        )}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6">
          <Logo src={logoUrl} heightPx={logoHeightPx} />

          <nav className="hidden lg:flex items-center gap-1" aria-label={t('primary')}>
            {primaryNavigation.map((item) => (
              <DesktopNavItem
                key={item.label}
                item={item}
                pathname={pathname}
                label={translateLabel(item.label, t)}
                descriptionT={tDesc}
              />
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <LocaleSwitcher current={locale} />
            <Button size="sm" href="/contact" variant="primary">
              {tCommon('startProject')}
              <Icon name="arrow-right" className="h-4 w-4" />
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <LocaleSwitcher current={locale} />
            <button
              type="button"
              className="relative z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 shadow-sm transition-colors active:bg-ink-50"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? tCommon('closeMenu') : tCommon('openMenu')}
              onClick={() => setOpen((v) => !v)}
            >
              <Icon name={open ? 'close' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/*
        The mobile menu is rendered as a SIBLING of <header>, not a
        child. When the header uses `backdrop-filter`, browsers create
        a stacking context that traps descendants — `position: fixed`
        children of a backdrop-filter parent are painted UNDER later
        siblings in some browsers. Moving the menu outside the header
        fixes that and also gives us a clean z-index hierarchy
        (header = z-40, menu = z-50 → button = z-50).
      */}
      <MobileMenu
        open={open}
        items={primaryNavigation}
        pathname={pathname}
        tNav={t}
        tDesc={tDesc}
        tCommon={tCommon}
      />
    </>
  );
}

function DesktopNavItem({
  item,
  pathname,
  label,
  descriptionT,
}: {
  item: NavItem;
  pathname: string;
  label: string;
  descriptionT: ReturnType<typeof useTranslations>;
}) {
  const [hover, setHover] = React.useState(false);
  const hasChildren = !!item.children && item.children.length > 0;

  const isActive =
    item.href === pathname ||
    (item.href && item.href !== '/' && pathname.startsWith(item.href));

  if (!hasChildren) {
    return (
      <Link
        href={item.href!}
        className={cn(
          'relative inline-flex h-9 items-center rounded-full px-3 text-sm font-medium transition-colors',
          isActive ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900',
        )}
      >
        {label}
        {isActive ? (
          <span className="absolute inset-x-3 -bottom-0.5 h-px bg-ink-900" />
        ) : null}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        className={cn(
          'inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium transition-colors',
          'text-ink-700 hover:text-ink-900',
        )}
        aria-expanded={hover}
        aria-haspopup="true"
      >
        {label}
        <Icon name="chevron-down" className={cn('h-3.5 w-3.5 transition-transform', hover && 'rotate-180')} />
      </button>

      <div
        className={cn(
          'absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-200',
          hover ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1',
        )}
      >
        <div
          className={cn(
            'min-w-[280px] rounded-2xl border border-ink-200/70 bg-white p-2 shadow-soft-lg',
            item.children!.length > 4 && 'min-w-[420px]',
          )}
        >
          <div
            className={cn(
              'grid gap-1',
              item.children!.length > 4 && 'grid-cols-2 gap-x-2',
            )}
          >
            {item.children!.map((child) => {
              const childActive =
                child.href === pathname ||
                (child.href && child.href !== '/' && pathname.startsWith(child.href));
              return (
                <Link
                  key={child.label}
                  href={child.href!}
                  className={cn(
                    'group flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors',
                    childActive ? 'bg-ink-50' : 'hover:bg-ink-50',
                  )}
                >
                  <span className="inline-flex items-center justify-between text-sm font-medium text-ink-900">
                    {translateLabel(child.label, descriptionT)}
                    <Icon
                      name="arrow-up-right"
                      className="h-3.5 w-3.5 -translate-y-px text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-700"
                    />
                  </span>
                  {child.description ? (
                    <span className="text-xs leading-snug text-ink-500">
                      {translateDesc(child.description, descriptionT)}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({
  open,
  items,
  pathname,
  tNav,
  tDesc,
  tCommon,
}: {
  open: boolean;
  items: NavItem[];
  pathname: string;
  tNav: ReturnType<typeof useTranslations>;
  tDesc: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  // Reset expanded state whenever the menu closes so reopening it
  // shows a clean collapsed state.
  React.useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

  return (
    <div
      id="mobile-menu"
      className={cn(
        // Render as a fixed overlay BELOW the header (top-16 = 64px)
        // but ABOVE everything else (z-50). Use a viewport-relative
        // height with overflow-y-auto so long menus scroll instead of
        // getting clipped. The previous grid-rows transition trick
        // caused some mobile browsers (iOS Safari, Android Chrome) to
        // hide children — switching to a simple conditional render
        // is reliable on every device.
        'lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col bg-white shadow-2xl transition-opacity duration-200',
        open
          ? 'pointer-events-auto overflow-y-auto opacity-100'
          : 'pointer-events-none overflow-hidden opacity-0',
      )}
      aria-hidden={!open}
      // Allow scroll on the menu container itself
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="container-x flex flex-col gap-1 py-6">
        <nav aria-label={tNav('mobilePrimary')} className="flex flex-col">
          {items.map((item) => {
            const hasChildren = !!item.children && item.children.length > 0;
            const isExpanded = expanded === item.label;
            const label = translateLabel(item.label, tNav);

            // Active-state helper for items and their children.
            const isActive =
              item.href === pathname ||
              (item.href && item.href !== '/' && pathname.startsWith(item.href));

            return (
              <div
                key={item.label}
                className="border-b border-ink-200/70 last:border-b-0"
              >
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      className="flex w-full min-h-[48px] items-center justify-between py-3 text-left text-base font-medium text-ink-900 active:bg-ink-50"
                      onClick={() => setExpanded(isExpanded ? null : item.label)}
                      aria-expanded={isExpanded}
                      aria-controls={`mobile-section-${item.label}`}
                    >
                      <span>{label}</span>
                      <Icon
                        name="chevron-down"
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </button>
                    {/* Plain conditional render (no grid-rows trick).
                        The parent already has overflow-y-auto so a tall
                        expanded list scrolls naturally. */}
                    {isExpanded ? (
                      <ul
                        id={`mobile-section-${item.label}`}
                        className="flex flex-col gap-0.5 pb-3 pl-2"
                      >
                        {item.children!.map((child) => {
                          const childActive =
                            child.href === pathname ||
                            (child.href &&
                              child.href !== '/' &&
                              pathname.startsWith(child.href));
                          return (
                            <li key={child.label}>
                              <Link
                                href={child.href!}
                                className={cn(
                                  'block min-h-[40px] rounded-lg px-3 py-2 text-sm transition-colors',
                                  childActive
                                    ? 'bg-accent-50 font-medium text-accent-700'
                                    : 'text-ink-700 active:bg-ink-50',
                                )}
                              >
                                {translateLabel(child.label, tNav)}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className={cn(
                      'flex min-h-[48px] items-center py-3 text-base font-medium transition-colors active:bg-ink-50',
                      isActive ? 'text-accent-700' : 'text-ink-900',
                    )}
                  >
                    {label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" href="/contact" variant="primary" className="w-full">
            {tCommon('startProject')}
            <Icon name="arrow-right" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

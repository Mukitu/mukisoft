import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  align?: 'left' | 'center';
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  crumbs,
  align = 'left',
  children,
  className,
}: PageHeaderProps) {
  return (
    <section className={cn('relative isolate overflow-hidden border-b border-ink-200/70 bg-white', className)}>
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden />
      <div className="absolute inset-0 -z-10 gradient-radial" aria-hidden />
      <Container size="lg" className="pt-16 md:pt-24 pb-12 md:pb-16">
        {crumbs && crumbs.length > 0 ? (
          <Reveal className="mb-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs">
              {crumbs.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-ink-500">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-ink-900 transition-colors">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-ink-700">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 ? (
                    <Icon name="chevron-right" className="h-3 w-3 text-ink-300" />
                  ) : null}
                </span>
              ))}
            </nav>
          </Reveal>
        ) : null}

        <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
          {eyebrow ? (
            <Reveal>
              <Badge tone="accent">{eyebrow}</Badge>
            </Reveal>
          ) : null}
          <Reveal delay={60}>
            <h1 className="mt-4 font-display tracking-tighter text-4xl md:text-5xl lg:text-6xl text-balance">
              {title}
            </h1>
          </Reveal>
          {subtitle ? (
            <Reveal delay={120}>
              <p className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-ink-600 text-balance">
                {subtitle}
              </p>
            </Reveal>
          ) : null}
          {children ? (
            <Reveal delay={180}>
              <div className="mt-8">{children}</div>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
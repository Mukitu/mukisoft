'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/reveal';
import { PortfolioImage } from '@/components/ui/brand-image';
import { cn } from '@/lib/utils/cn';
import type { Project } from '@/lib/types';

type PortfolioGridProps = {
  projects: Project[];
};

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const t = useTranslations('common');
  const [filter, setFilter] = React.useState<string>('All');
  const filters = React.useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      set.add(p.category);
      set.add(p.industry);
    });
    return [t('allCategories'), ...Array.from(set).sort()];
  }, [projects, t]);

  const visible = filter === t('allCategories') ? projects : projects.filter((p) => p.category === filter || p.industry === filter);

  return (
    <div className="mt-14">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              filter === f
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, idx) => (
          <Reveal
            key={p.slug}
            delay={(idx % 3) * 60}
            className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-ink-50 to-ink-100">
              <PortfolioImage
                src={p.image}
                alt={`${p.title} — ${p.shortDescription}`}
                priority={idx === 0}
                className="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" aria-hidden />
              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-700 shadow-soft backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                {p.type}
              </div>
              <div className="absolute bottom-5 right-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink-900 shadow-soft transition-transform group-hover:scale-105">
                <Icon
                  name={
                    p.type === 'Mobile'
                      ? 'mobile'
                      : p.type === 'AI'
                        ? 'ai'
                        : p.type === 'SaaS'
                          ? 'saas'
                          : 'web'
                  }
                  className="h-5 w-5"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center gap-2">
                <Badge>{p.category}</Badge>
              </div>
              <h3 className="mt-3 font-display text-xl tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.shortDescription}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.technologies.slice(0, 4).map((tech) => (
                  <span key={tech} className="rounded-full bg-ink-50 px-2.5 py-0.5 text-[11px] font-medium text-ink-700">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-ink-200/70 pt-5 mt-6">
                <Link
                  href={`/portfolio/${p.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
                >
                  {t('viewProject')}
                  <Icon name="arrow-up-right" className="h-4 w-4" />
                </Link>
                {p.caseStudySlug ? (
                  <Link
                    href={`/case-study/${p.caseStudySlug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
                  >
                    {t('caseStudy')}
                    <Icon name="chevron-right" className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
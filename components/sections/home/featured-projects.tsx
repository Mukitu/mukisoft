import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/reveal';
import { fetchPublishedPortfolio } from '@/lib/supabase/public';
import { company } from '@/lib/config/company';
import { getTranslations } from 'next-intl/server';
import { applyTranslations } from '@/lib/i18n/apply-translations';
import type { Locale } from '@/lib/i18n/config';

export async function FeaturedProjects({ locale }: { locale: Locale }) {
  const t = await getTranslations('home.featured');
  const tCommon = await getTranslations('common');
  const raw = await fetchPublishedPortfolio();
  const projects = await applyTranslations(raw, 'portfolio_project', locale);
  const featured = projects.filter((p) => p.is_featured).slice(0, 3);
  const fallback = projects.slice(0, 3);
  const list = (featured.length > 0 ? featured : fallback).slice(0, 3);
  return (
    <Section tone="default">
      <Container size="xl">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('title')}</SectionTitle>
            <SectionLead className="mt-4">
              {t('lead', { company: company.name })}
            </SectionLead>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
          >
            {t('viewAll')}
            <Icon name="arrow-up-right" className="h-4 w-4" />
          </Link>
        </Reveal>

        {list.length === 0 ? (
          <Reveal className="mt-10 rounded-2xl border border-ink-200/70 bg-white p-10 text-center">
            <h3 className="font-display text-xl tracking-tight">{t('emptyTitle')}</h3>
            <p className="mt-2 text-sm text-ink-600">{t('emptyBody')}</p>
          </Reveal>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p, idx) => (
              <Reveal
                key={p.id}
                delay={(idx % 3) * 60}
                className="group flex flex-col rounded-2xl border border-ink-200/70 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-ink-50 to-ink-100">
                  {p.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.image_url}
                      alt={p.alt_text ?? `${p.title} — ${p.short_description ?? ''}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" aria-hidden />
                  <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-700 shadow-soft backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                    {p.category ?? t('categoryFallback')}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2">
                    <Badge>{p.category ?? t('categoryFallback')}</Badge>
                  </div>
                  <h3 className="mt-3 font-display text-xl tracking-tight">{p.title}</h3>
                  {p.short_description ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.short_description}</p>
                  ) : null}

                  {(p.technology ?? []).length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {(p.technology ?? []).slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full bg-ink-50 px-2.5 py-0.5 text-[11px] font-medium text-ink-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-6 flex items-center justify-between border-t border-ink-200/70 pt-5">
                    <Link
                      href={`/portfolio/${p.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
                    >
                      {tCommon('viewProject')}
                      <Icon name="arrow-up-right" className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

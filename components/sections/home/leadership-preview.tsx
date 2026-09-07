import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { FounderImage } from '@/components/ui/brand-image';
import { fetchPublishedLeadership } from '@/lib/supabase/public';
import { company } from '@/lib/config/company';
import { getTranslations } from 'next-intl/server';
import { applyTranslations } from '@/lib/i18n/apply-translations';
import type { Locale } from '@/lib/i18n/config';

export async function LeadershipPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations('home.leadership');
  const raw = await fetchPublishedLeadership();
  const leaders = await applyTranslations(raw, 'leadership_member', locale);
  if (leaders.length === 0) return null;

  const primary = leaders[0];
  const focus = primary.professional_focus ?? [];

  return (
    <Section tone="muted">
      <Container size="xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
              <SectionTitle className="mt-4">{t('title')}</SectionTitle>
              <SectionLead className="mt-5">{t('lead')}</SectionLead>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/founder" variant="primary">
                  {t('viewProfile')}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
                <Button href="/about" variant="outline">
                  {t('eyebrow')}
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-white p-8 md:p-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <FounderImage
                    size="lg"
                    rounded="full"
                    priority
                    className="shadow-soft"
                    alt={`${primary.name} — ${primary.position} of ${company.name}`}
                    src={primary.image_url ?? undefined}
                    objectPosition={primary.image_focus ?? 'center top'}
                    companyName={company.name}
                  />
                  <div className="flex-1">
                    <div className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                      {primary.position}
                    </div>
                    <h3 className="mt-2 font-display text-2xl tracking-tight">{primary.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">
                      {primary.short_bio ?? t('lead')}
                    </p>
                    {focus.length > 0 ? (
                      <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {focus.slice(0, 4).map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-ink-700">
                            <Icon name="check" className="h-3.5 w-3.5 text-accent-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}

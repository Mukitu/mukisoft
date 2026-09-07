import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { IconBox } from '@/components/ui/icon-box';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import { serviceCategories } from '@/lib/data/services';
import { company } from '@/lib/config/company';
import { getTranslations } from 'next-intl/server';

export async function ServicesOverview() {
  const t = await getTranslations('home.services');
  return (
    <Section tone="default">
      <Container size="xl">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('title')}</SectionTitle>
          </div>
          <SectionLead>{t('lead')}</SectionLead>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-ink-200/70 bg-ink-200/70 md:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((category, idx) => (
            <Reveal
              key={category.slug}
              delay={(idx % 3) * 60}
              className="group relative bg-white p-7 md:p-8 transition-colors hover:bg-ink-50/60"
            >
              <div className="flex items-start justify-between">
                <IconBox name={category.icon} size="md" tone="accent" />
                <span className="font-mono text-[11px] tracking-tight text-ink-400">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl tracking-tight text-ink-900">
                {category.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {category.description}
              </p>
              <ul className="mt-5 space-y-1.5">
                {category.services.slice(0, 3).map((s) => (
                  <li key={s.slug} className="flex items-center gap-2 text-sm text-ink-700">
                    <Icon name="check" className="h-3.5 w-3.5 text-accent-500" />
                    {s.title}
                  </li>
                ))}
              </ul>
              <Link
                href={`/services/${category.slug}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors group-hover:text-accent-600"
              >
                {t('ctaAll')}
                <Icon name="arrow-up-right" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

import { isLocale, type Locale } from '@/lib/i18n/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { PageHeader } from '@/components/sections/page-header';
import { Reveal } from '@/components/ui/reveal';
import { IconBox } from '@/components/ui/icon-box';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { getServiceBySlug, getCategoryBySlug } from '@/lib/data/services';

type Params = { slug: string; locale: string };

export async function generateStaticParams() {
  const { getAllServiceSlugs, getAllCategorySlugs } = await import('@/lib/data/services');
  return [
    ...getAllCategorySlugs().map((slug) => ({ slug })),
    ...getAllServiceSlugs().map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  if (isLocale(params.locale)) unstable_setRequestLocale(params.locale);
  const t = await getTranslations('services');
  const category = getCategoryBySlug(params.slug);
  if (category) {
    return {
      title: t('categoryTitle', { category: category.title }),
      description: category.description,
    };
  }
  const found = getServiceBySlug(params.slug);
  if (found) {
    return {
      title: t('serviceTitle', { title: found.service.title, category: found.service.category }),
      description: found.service.shortDescription,
    };
  }
  return { title: t('defaultTitle') };
}

export default function ServiceSlugPage({ params }: { params: Params }) {
  if (!isLocale(params.locale)) return null;
  // Stabilise the request locale for nested async translation calls
  unstable_setRequestLocale(params.locale as Locale);
  const category = getCategoryBySlug(params.slug);
  if (category) {
    return <CategoryView slug={params.slug} />;
  }
  const found = getServiceBySlug(params.slug);
  if (found) {
    return <ServiceView slug={params.slug} />;
  }
  notFound();
}

async function CategoryView({ slug }: { slug: string }) {
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const t = await getTranslations('services');
  const tCommon = await getTranslations('common');

  return (
    <>
      <PageHeader
        eyebrow={category.title}
        title={category.description}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: t('crumbServices'), href: '/services' },
          { label: t('crumbCategory', { title: category.title }) },
        ]}
      />
      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {category.services.map((s, i) => (
              <Reveal
                key={s.slug}
                delay={(i % 3) * 50}
                className="group flex flex-col rounded-2xl border border-ink-200/70 bg-white p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <IconBox name={s.icon} tone="accent" />
                <h3 className="mt-5 font-display text-xl tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.shortDescription}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {s.technologies.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full bg-ink-50 px-2.5 py-0.5 text-[11px] font-medium text-ink-700">
                      {t}
                    </span>
                  ))}
                </div>
                <Button
                  href={`/services/${s.slug}`}
                  variant="ghost"
                  className="mt-6 self-start pl-0 hover:bg-transparent"
                >
                  {tCommon('learnMore')}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Button>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

async function ServiceView({ slug }: { slug: string }) {
  const found = getServiceBySlug(slug);
  if (!found) notFound();
  const { service, category } = found;
  const t = await getTranslations('services');
  const tCommon = await getTranslations('common');

  return (
    <>
      <PageHeader
        eyebrow={service.category}
        title={service.title}
        subtitle={service.shortDescription}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: t('crumbServices'), href: '/services' },
          { label: t('crumbCategory', { title: category.title }), href: `/services/${category.slug}` },
          { label: t('crumbService', { title: service.title }) },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/contact" size="lg" variant="primary">
            {t('discussService', { service: service.title.toLowerCase() })}
            <Icon name="arrow-right" className="h-4 w-4" />
          </Button>
          <Button href={`/services/${category.slug}`} size="lg" variant="outline">
            {t('backToCategory', { category: category.title })}
          </Button>
        </div>
      </PageHeader>

      <Section tone="default">
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <SectionEyebrow>{t('overviewEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">{t('overviewTitle')}</SectionTitle>
                <p className="mt-5 text-base md:text-lg leading-relaxed text-ink-600">
                  {service.detailedDescription}
                </p>
              </Reveal>

              <Reveal delay={80} className="mt-16">
                <SectionEyebrow>{t('benefitsEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">{t('benefitsTitle')}</SectionTitle>
                <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {service.benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 rounded-xl border border-ink-200/70 bg-white p-4"
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                        <Icon name="check" className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm leading-relaxed text-ink-700">{b}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120} className="mt-16">
                <SectionEyebrow>{t('processEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">{t('processTitle')}</SectionTitle>
                <ol className="mt-6 space-y-3">
                  {service.process.map((step, i) => (
                    <li
                      key={step}
                      className="flex items-start gap-4 rounded-xl border border-ink-200/70 bg-white p-4"
                    >
                      <span className="font-mono text-xs tracking-tight text-accent-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm leading-relaxed text-ink-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>

              <Reveal delay={160} className="mt-16">
                <SectionEyebrow>{t('outcomesEyebrow')}</SectionEyebrow>
                <SectionTitle className="mt-4">{t('outcomesTitle')}</SectionTitle>
                <ul className="mt-6 space-y-2">
                  {service.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-3 text-sm text-ink-700">
                      <Icon name="arrow-down-right" className="mt-1 h-3.5 w-3.5 text-accent-500" />
                      <span className="leading-relaxed">{o}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="lg:col-span-4">
              <Reveal delay={100}>
                <div className="sticky top-28 space-y-6">
                  <div className="rounded-2xl border border-ink-200/70 bg-white p-6">
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                      {t('technologiesEyebrow')}
                    </span>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.technologies.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-ink-200/70 bg-white p-6">
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent-600">
                      {t('engagementEyebrow')}
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-ink-700">
                      {t('engagementBody')}
                    </p>
                    <Button href="/contact" variant="primary" className="mt-5 w-full">
                      {t('talkToUs')}
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="xl">
          <Reveal className="max-w-2xl">
            <SectionEyebrow>{t('otherServicesEyebrow')}</SectionEyebrow>
            <SectionTitle className="mt-4">{t('otherServicesTitle', { category: category.title })}</SectionTitle>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {category.services
              .filter((s) => s.slug !== service.slug)
              .map((s) => (
                <Reveal
                  key={s.slug}
                  className="rounded-2xl border border-ink-200/70 bg-white p-6"
                >
                  <IconBox name={s.icon} tone="subtle" />
                  <h3 className="mt-4 font-display text-lg tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {s.shortDescription}
                  </p>
                  <Button
                    href={`/services/${s.slug}`}
                    variant="ghost"
                    className="mt-4 self-start pl-0 hover:bg-transparent"
                  >
                    {tCommon('learnMore')}
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </Button>
                </Reveal>
              ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
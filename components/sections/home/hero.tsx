import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { company, capabilityStatements } from '@/lib/config/company';
import { getTranslations } from 'next-intl/server';

export async function Hero() {
  const t = await getTranslations('home.hero');
  const established = company.foundedYear;
  return (
    <section className="relative isolate overflow-hidden border-b border-ink-200/70 bg-white">
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden />
      <div className="absolute inset-0 -z-10 gradient-radial" aria-hidden />

      <Container size="xl" className="pt-14 pb-24 md:pt-20 md:pb-32 lg:pt-24 lg:pb-40">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Badge tone="accent" className="font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              {t('established', { year: established })}
            </Badge>

            <h1 className="mt-6 font-display tracking-tight text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] lg:leading-[1.04] text-balance">
              <span className="block">{t('headline1')}</span>
              <span className="block">
                <span className="text-gradient">{t('headline2')}</span>
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-ink-600">
              {company.description}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" href="/contact" variant="primary" className="px-6">
                {t('ctaPrimary')}
                <Icon name="arrow-right" className="h-4 w-4" />
              </Button>
              <Button size="lg" href="/portfolio" variant="outline" className="px-6">
                {t('ctaSecondary')}
              </Button>
            </div>

            <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-ink-200 pt-8 sm:grid-cols-3">
              <CapabilityItem label={t('establishedLabel')} value={t('since', { year: established })} />
              <CapabilityItem label={t('headquartersLabel')} value={company.contact.country} />
              <CapabilityItem label={t('reachLabel')} value={t('reachValue')} />
            </dl>
          </div>

          <div className="lg:col-span-5">
            <HeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}

function CapabilityItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-500">{label}</dt>
      <dd className="mt-1 font-display text-lg tracking-tight text-ink-900">{value}</dd>
    </div>
  );
}

async function HeroVisual() {
  const t = await getTranslations('home.hero');
  return (
    <div className="relative">
      <div className="relative isolate rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft-lg">
        <div className="absolute -top-3 left-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500 shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t('consoleBadge', { name: company.shortName })}
        </div>
        <div className="mb-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
        </div>
        <div className="rounded-xl border border-ink-200/70 bg-ink-50 p-4 font-mono text-[12px] leading-relaxed text-ink-700">
          <p>
            <span className="text-ink-400">→</span> {t('consoleLine1')}
          </p>
          <p>
            <span className="text-emerald-600">✓</span> {t('consoleLine2')}
          </p>
          <p>
            <span className="text-emerald-600">✓</span> {t('consoleLine3')}
          </p>
          <p>
            <span className="text-emerald-600">✓</span> {t('consoleLine4')}
          </p>
          <p>
            <span className="text-accent-600">●</span> {t('consoleLine5')}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: t('metricCapabilities'), value: t('metricCapabilitiesValue') },
            { label: t('metricDelivery'), value: t('metricDeliveryValue') },
            { label: t('metricOperations'), value: t('metricOperationsValue') },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-ink-200/70 bg-white p-3"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">
                {m.label}
              </div>
              <div className="mt-1 font-display text-base tracking-tight text-ink-900">
                {m.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-ink-200/70 bg-ink-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-white">
                <Icon name="ai" className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs font-medium text-ink-900">{t('aiCardTitle')}</div>
                <div className="text-[11px] text-ink-500">{t('aiCardSubtitle')}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t('aiStatus')}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-ink-600">
            {capabilityStatements.slice(0, 4).map((c) => (
              <div key={c.label} className="rounded-lg border border-ink-200/70 bg-white px-3 py-2">
                <div className="font-medium text-ink-900">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 -left-8 hidden h-32 w-32 -z-10 rounded-full bg-gradient-to-br from-accent-200 to-cyan-200 blur-2xl md:block" aria-hidden />
      <div className="absolute -right-10 -top-10 hidden h-28 w-28 -z-10 rounded-full bg-gradient-to-br from-cyan-200 to-accent-200 blur-2xl md:block" aria-hidden />
    </div>
  );
}

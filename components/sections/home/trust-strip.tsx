import { Container } from '@/components/ui/container';
import { Marquee } from '@/components/ui/marquee';
import { getAllTechnologies } from '@/lib/data/technologies';
import { getTranslations } from 'next-intl/server';

export async function TrustStrip() {
  const t = await getTranslations('home.trust');
  const technologies = getAllTechnologies().map((tech) => tech.name).slice(0, 22);
  return (
    <section className="border-b border-ink-200/70 bg-white py-12" aria-label={t('label')}>
      <Container size="xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">
            {t('label')}
          </span>
        </div>
        <Marquee items={technologies} />
      </Container>
    </section>
  );
}

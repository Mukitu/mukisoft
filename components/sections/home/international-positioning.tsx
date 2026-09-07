import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section, SectionEyebrow, SectionTitle, SectionLead } from '@/components/ui/section';
import { Reveal } from '@/components/ui/reveal';
import { Icon } from '@/components/ui/icon';
import { getTranslations } from 'next-intl/server';

export async function InternationalPositioning() {
  const t = await getTranslations('home.international');
  return (
    <Section tone="default">
      <Container size="xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
          <SectionTitle className="mt-4">{t('title')}</SectionTitle>
          <SectionLead className="mt-5">{t('body')}</SectionLead>
        </Reveal>

        <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 hover:text-accent-600"
          >
            {t('eyebrow')}
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}

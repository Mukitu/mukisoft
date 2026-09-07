import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <Section tone="default" spacing="lg" className="min-h-[60vh] flex items-center">
      <Container size="md" className="text-center">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent-600">{t('code')}</span>
        <h1 className="mt-4 font-display tracking-tighter text-5xl md:text-6xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base md:text-lg leading-relaxed text-ink-600">
          {t('body')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" size="lg" variant="primary">
            {t('backHome')}
            <Icon name="arrow-right" className="h-4 w-4" />
          </Button>
          <Button href="/contact" size="lg" variant="outline">
            {t('contactUs')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}

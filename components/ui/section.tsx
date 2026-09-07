import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div' | 'article' | 'main' | 'header' | 'footer';
  tone?: 'default' | 'muted' | 'dark' | 'soft';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
};

const tones = {
  default: 'bg-white text-ink-900',
  muted: 'bg-ink-50 text-ink-900',
  dark: 'bg-ink-950 text-white',
  soft: 'bg-gradient-to-b from-white to-ink-50 text-ink-900',
};

const spacings = {
  sm: 'py-14 md:py-20',
  md: 'py-20 md:py-28',
  lg: 'py-24 md:py-32',
  xl: 'py-28 md:py-40',
};

export function Section({
  as: Tag = 'section',
  tone = 'default',
  spacing = 'md',
  className,
  children,
  ...rest
}: SectionProps) {
  const TagAny = Tag as unknown as React.ElementType;
  return (
    <TagAny className={cn('relative isolate overflow-hidden', tones[tone], spacings[spacing], className)} {...rest}>
      {children}
    </TagAny>
  );
}

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-ink-200/70 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-700 backdrop-blur',
        'dark:border-white/10 dark:bg-white/5 dark:text-white/80',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'font-display tracking-tighter text-3xl md:text-4xl lg:text-[2.75rem] text-balance',
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SectionLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'max-w-2xl text-base md:text-lg leading-relaxed text-ink-600',
        className,
      )}
    >
      {children}
    </p>
  );
}
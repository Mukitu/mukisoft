import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'accent' | 'success' | 'outline';
};

const tones = {
  neutral:
    'bg-ink-50 text-ink-700 ring-1 ring-inset ring-ink-200',
  accent:
    'bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200',
  success:
    'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  outline:
    'bg-transparent text-ink-700 ring-1 ring-inset ring-ink-300',
};

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
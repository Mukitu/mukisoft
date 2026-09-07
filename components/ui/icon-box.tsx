import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/lib/types';

type IconBoxProps = {
  name: IconName;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'subtle' | 'accent' | 'dark';
};

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
};

const tones = {
  subtle:
    'bg-ink-50 text-ink-700 ring-1 ring-inset ring-ink-200',
  accent:
    'bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-200',
  dark:
    'bg-ink-900 text-white ring-1 ring-inset ring-white/10',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function IconBox({
  name,
  className,
  size = 'md',
  tone = 'subtle',
}: IconBoxProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-xl',
        sizes[size],
        tones[tone],
        className,
      )}
      aria-hidden="true"
    >
      <Icon name={name} className={iconSizes[size]} />
    </div>
  );
}
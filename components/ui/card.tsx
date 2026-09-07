import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof React.JSX.IntrinsicElements;
  hover?: boolean;
  bordered?: boolean;
};

export function Card({
  as: Tag = 'div',
  className,
  hover = true,
  bordered = true,
  children,
  ...rest
}: CardProps) {
  const TagAny = Tag as unknown as React.ElementType;
  return (
    <TagAny
      className={cn(
        'relative isolate rounded-2xl bg-white p-6 md:p-7',
        bordered && 'border border-ink-200/70',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg hover:border-ink-300/80',
        className,
      )}
      {...rest}
    >
      {children}
    </TagAny>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('mb-4 flex items-start gap-3', className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('font-display text-lg tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm leading-relaxed text-ink-600', className)}>
      {children}
    </p>
  );
}
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: keyof React.JSX.IntrinsicElements;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
};

const widths = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl',
  lg: 'max-w-7xl',
  xl: 'max-w-8xl',
  full: 'max-w-9xl',
};

export function Container({
  as: Tag = 'div',
  size = 'lg',
  className,
  children,
  ...rest
}: ContainerProps) {
  const TagAny = Tag as unknown as React.ElementType;
  return (
    <TagAny className={cn('container-x', widths[size], className)} {...rest}>
      {children}
    </TagAny>
  );
}
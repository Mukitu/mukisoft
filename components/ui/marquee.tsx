import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type MarqueeProps = {
  items: string[];
  className?: string;
  speed?: number;
};

export function Marquee({ items, className, speed = 32 }: MarqueeProps) {
  const repeated = [...items, ...items];
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      aria-label="Technology marquee"
    >
      <div
        className="marquee-track gap-12 pr-12"
        style={{ animationDuration: `${speed}s` }}
      >
        {repeated.map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium tracking-tight text-ink-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ink-300" aria-hidden />
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
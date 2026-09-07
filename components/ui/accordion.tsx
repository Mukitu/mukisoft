'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/icon';

type AccordionItemProps = {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
};

function AccordionItem({ id, question, answer, isOpen, onToggle }: AccordionItemProps) {
  const panelId = `accordion-panel-${id}`;
  const buttonId = `accordion-button-${id}`;
  return (
    <div className="border-b border-ink-200/70 last:border-b-0">
      <h3>
        <button
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(id)}
          className={cn(
            'flex w-full items-center justify-between gap-6 py-5 text-left transition-colors',
            'text-base md:text-lg font-medium text-ink-900 hover:text-ink-700',
          )}
        >
          <span className="text-balance">{question}</span>
          <span
            className={cn(
              'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-transform duration-300',
              isOpen && 'rotate-45 bg-ink-900 text-white border-ink-900',
            )}
            aria-hidden="true"
          >
            <Icon name="plus" className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className={cn(
          'grid transition-all duration-300',
          isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl text-[15px] leading-relaxed text-ink-600">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

type AccordionProps = {
  items: { id: string; question: string; answer: string }[];
  initialOpenId?: string;
  className?: string;
};

export function Accordion({ items, initialOpenId, className }: AccordionProps) {
  const [openId, setOpenId] = React.useState<string | null>(initialOpenId ?? null);
  return (
    <div className={cn('rounded-2xl border border-ink-200/70 bg-white px-6', className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          question={item.question}
          answer={item.answer}
          isOpen={openId === item.id}
          onToggle={(id) => setOpenId(openId === id ? null : id)}
        />
      ))}
    </div>
  );
}
'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

type FormState = {
  name: string;
  email: string;
  company: string;
  service: string;
  topic: string;
  budget: string;
  message: string;
};

const initial: FormState = {
  name: '',
  email: '',
  company: '',
  service: '',
  topic: '',
  budget: '',
  message: '',
};

// English values are kept verbatim — they are sent as email content.
const TOPIC_VALUES = ['newProject', 'existingProject', 'partnership', 'careers', 'other'] as const;
const BUDGET_VALUES = ['under10k', '10to25k', '25to50k', '50to100k', 'over100k', 'notSure'] as const;

export function ContactForm({
  contactEmail,
  companyName,
}: {
  contactEmail: string;
  companyName: string;
}) {
  const t = useTranslations('contactForm');
  const [values, setValues] = React.useState<FormState>(initial);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = t('nameError');
    if (!values.email.trim() || !/^\S+@\S+\.\S+$/.test(values.email)) {
      next.email = t('emailError');
    }
    if (!values.message.trim() || values.message.trim().length < 10) {
      next.message = t('messageError');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildMailto(): string {
    const subject = `Project inquiry — ${values.topic || companyName}`;
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Company: ${values.company || '—'}`,
      `Topic: ${values.topic}`,
      `Budget: ${values.budget || '—'}`,
      `Service: ${values.service || '—'}`,
      '',
      'Project details:',
      values.message,
      '',
      `— Sent from ${companyName} contact form`,
    ].join('\n');
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (typeof window !== 'undefined') {
      window.location.href = buildMailto();
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-ink-200/70 bg-white p-6 md:p-8" noValidate>
      <p className="mb-5 text-xs text-ink-500">{t('requiredHint')}</p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field
          label={t('nameLabel')}
          error={errors.name}
          input={
            <input
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputCls(errors.name)}
              placeholder={t('namePlaceholder')}
              required
            />
          }
        />
        <Field
          label={t('emailLabel')}
          error={errors.email}
          input={
            <input
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputCls(errors.email)}
              placeholder={t('emailPlaceholder')}
              required
            />
          }
        />
        <Field
          label={t('companyLabel')}
          input={
            <input
              type="text"
              autoComplete="organization"
              value={values.company}
              onChange={(e) => update('company', e.target.value)}
              className={inputCls()}
              placeholder={t('companyPlaceholder')}
            />
          }
        />
        <Field
          label={t('roleLabel')}
          input={
            <input
              type="text"
              value={values.service}
              onChange={(e) => update('service', e.target.value)}
              className={inputCls()}
              placeholder={t('rolePlaceholder')}
            />
          }
        />
        <Field
          label={t('topicLabel')}
          input={
            <select
              value={values.topic}
              onChange={(e) => update('topic', e.target.value)}
              className={inputCls()}
            >
              <option value="">{t('topicPlaceholder')}</option>
              {TOPIC_VALUES.map((v) => (
                <option key={v} value={v}>
                  {t(`topicOptions.${v}`)}
                </option>
              ))}
            </select>
          }
        />
        <Field
          label={t('budgetLabel')}
          input={
            <select
              value={values.budget}
              onChange={(e) => update('budget', e.target.value)}
              className={inputCls()}
            >
              <option value="">{t('budgetPlaceholder')}</option>
              {BUDGET_VALUES.map((b) => (
                <option key={b} value={b}>
                  {t(`budgetOptions.${b}`)}
                </option>
              ))}
            </select>
          }
        />
      </div>

      <div className="mt-5">
        <Field
          label={t('messageLabel')}
          error={errors.message}
          input={
            <textarea
              rows={6}
              value={values.message}
              onChange={(e) => update('message', e.target.value)}
              className={cn(inputCls(errors.message), 'min-h-[160px] resize-y')}
              placeholder={t('messagePlaceholder')}
              required
            />
          }
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200/70 pt-6">
        <p className="text-xs text-ink-500">
          {t('successTitle')}
        </p>
        <Button type="submit" size="lg" variant="primary" className="px-6">
          {t('submit')}
          <Icon name="arrow-right" className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function inputCls(error?: string) {
  return cn(
    'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400',
    error ? 'border-red-300' : 'border-ink-200',
  );
}

function Field({
  label,
  input,
  error,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-900">{label}</span>
      {input}
      {error ? <span className="mt-1.5 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type TranslationStatus =
  | 'pending'
  | 'generated'
  | 'edited'
  | 'published'
  | 'deprecated'
  | 'failed'
  | 'missing';

export interface TranslationState {
  status: TranslationStatus;
  translated_value: string;
  last_error?: string | null;
}

export interface TranslationRowProps {
  fieldName: string;
  label: string;
  sourceValue: string;
  initialState?: TranslationState | null;
  entityType: string;
  entityId: string;
  languageLabel?: string;
}

const STATUS_STYLE: Record<TranslationStatus, string> = {
  pending: 'bg-ink-100 text-ink-600',
  generated: 'bg-amber-100 text-amber-700',
  edited: 'bg-sky-100 text-sky-700',
  published: 'bg-emerald-100 text-emerald-700',
  deprecated: 'bg-rose-100 text-rose-700',
  failed: 'bg-rose-100 text-rose-700',
  missing: 'bg-ink-100 text-ink-600',
};

/**
 * Per-field translation editor row. Used inside the "Bangla" tab on
 * every CMS editor and inside the global Translations console.
 */
export function TranslationRow({
  fieldName,
  label,
  sourceValue,
  initialState,
  entityType,
  entityId,
  languageLabel = 'Bangla',
}: TranslationRowProps) {
  const [state, setState] = React.useState<TranslationState>(
    initialState ?? {
      status: 'missing',
      translated_value: '',
      last_error: null,
    },
  );
  const [draft, setDraft] = React.useState<string>(initialState?.translated_value ?? '');
  const [busy, setBusy] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setState(initialState ?? { status: 'missing', translated_value: '', last_error: null });
    setDraft(initialState?.translated_value ?? '');
  }, [initialState]);

  const call = async (op: string, body: Record<string, unknown> = {}) => {
    setBusy(op);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          op,
          entityType,
          entityId,
          fieldName,
          sourceValue,
          ...body,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Request failed');
      }
      return json;
    } finally {
      setBusy(null);
    }
  };

  const onGenerate = async () => {
    try {
      const result = await call('generate');
      setState({
        status: result.status ?? 'generated',
        translated_value: result.translated ?? '',
        last_error: null,
      });
      setDraft(result.translated ?? '');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onSave = async () => {
    try {
      await call('save', { translatedValue: draft });
      setState((prev) => ({
        ...prev,
        status: 'edited',
        translated_value: draft,
      }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onPublish = async () => {
    try {
      await call('publish');
      setState((prev) => ({ ...prev, status: 'published' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed');
    }
  };

  const onUnpublish = async () => {
    try {
      await call('unpublish');
      setState((prev) => ({ ...prev, status: 'generated' }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              {fieldName}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                STATUS_STYLE[state.status] ?? STATUS_STYLE.missing,
              )}
            >
              {state.status}
            </span>
          </div>
          <div className="mt-1 text-sm font-medium text-ink-900">{label}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {state.status === 'missing' || state.status === 'deprecated' || state.status === 'failed' ? (
            <button
              type="button"
              disabled={busy !== null || !sourceValue}
              onClick={onGenerate}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-accent-600 px-3 text-xs font-medium text-white hover:bg-accent-700 disabled:opacity-50"
            >
              {busy === 'generate' ? 'Generating…' : `Generate ${languageLabel}`}
            </button>
          ) : null}
          {state.translated_value || draft ? (
            <>
              {(state.status === 'generated' || state.status === 'edited') ? (
                <button
                  type="button"
                  disabled={busy !== null || !draft.trim()}
                  onClick={onPublish}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy === 'publish' ? 'Publishing…' : 'Publish'}
                </button>
              ) : null}
              {state.status === 'published' ? (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={onUnpublish}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
                >
                  {busy === 'unpublish' ? 'Working…' : 'Unpublish'}
                </button>
              ) : null}
              <button
                type="button"
                disabled={busy !== null || !sourceValue}
                onClick={onGenerate}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
              >
                {busy === 'generate' ? '…' : 'Regenerate'}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">English source</div>
          <div className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-ink-200/70 bg-ink-50 p-3 text-xs leading-relaxed text-ink-800">
            {sourceValue || <em className="text-ink-400">empty</em>}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
            {languageLabel} translation
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`${languageLabel} translation will appear here…`}
            className="mt-1 block h-32 w-full rounded-xl border border-ink-200/70 bg-white p-3 text-xs leading-relaxed text-ink-900 focus:border-accent-400 focus:outline-none"
          />
          {state.status !== 'missing' && state.status !== 'pending' ? (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-ink-500">
                {state.last_error ? (
                  <span className="text-rose-600">{state.last_error}</span>
                ) : (
                  <>Last update stored.</>
                )}
              </span>
              <button
                type="button"
                disabled={busy !== null || draft === state.translated_value}
                onClick={onSave}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
              >
                {busy === 'save' ? 'Saving…' : 'Save edit'}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {errorMsg ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
          {errorMsg}
        </div>
      ) : null}
    </div>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface TranslationRowDb {
  id: string;
  entity_type: string;
  entity_id: string;
  field_name: string;
  target_lang: string;
  source_value: string;
  translated_value: string;
  status: string;
  provider: string | null;
  last_error: string | null;
  updated_at: string;
  published_at: string | null;
}

const STATUS_OPTIONS = ['all', 'published', 'generated', 'edited', 'deprecated', 'failed'] as const;

export function TranslationsConsole({ initialRows }: { initialRows: TranslationRowDb[] }) {
  const [rows, setRows] = React.useState<TranslationRowDb[]>(initialRows);
  const [entityFilter, setEntityFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');

  const entities = React.useMemo(() => {
    const set = new Set<string>(rows.map((r) => r.entity_type));
    return ['all', ...Array.from(set).sort()];
  }, [rows]);

  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      if (entityFilter !== 'all' && r.entity_type !== entityFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const needle = search.toLowerCase();
        const haystack =
          `${r.entity_type} ${r.field_name} ${r.source_value} ${r.translated_value}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, entityFilter, statusFilter, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-ink-200/70 bg-white p-4">
        <div className="flex flex-col">
          <label className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">Entity</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="mt-1 h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm"
          >
            {entities.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col">
          <label className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">Search</label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search source, translation, or field…"
            className="mt-1 h-9 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm"
          />
        </div>
        <div className="ml-auto self-end text-xs text-ink-500">
          {filtered.length} of {rows.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center text-sm text-ink-600">
          No translation rows match the current filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-[10px] uppercase tracking-[0.14em] text-ink-500">
              <tr>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/70">
              {filtered.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-2 font-mono text-[11px] text-ink-700">{row.entity_type}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-ink-700">{row.field_name}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                        row.status === 'published' && 'bg-emerald-100 text-emerald-700',
                        row.status === 'generated' && 'bg-amber-100 text-amber-700',
                        row.status === 'edited' && 'bg-sky-100 text-sky-700',
                        row.status === 'deprecated' && 'bg-rose-100 text-rose-700',
                        row.status === 'failed' && 'bg-rose-100 text-rose-700',
                        row.status === 'pending' && 'bg-ink-100 text-ink-700',
                      )}
                    >
                      {row.status}
                    </span>
                    {row.last_error ? (
                      <div className="mt-1 text-[10px] text-rose-600">{row.last_error}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-600">{row.provider ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-ink-500">
                    {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="line-clamp-2 max-w-md text-ink-900">{row.translated_value || '—'}</div>
                    <div className="mt-1 line-clamp-1 text-[10px] text-ink-500">{row.source_value}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

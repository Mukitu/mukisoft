import 'server-only';
import { createClient, type SupabaseClient as SupabaseJsClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getServiceRoleClient } from '@/lib/supabase/admin';
import { SUPABASE_ENV, isSupabaseConfigured } from '@/lib/supabase/env';
import { defaultLocale, type Locale } from './config';
import {
  ARRAY_FIELDS,
  getTranslatableFields,
  isArrayField,
  type TranslatableEntityType,
} from './translatable-fields';
import { hashSource, translateText } from '@/lib/translate/provider';

type Identifiable = { id: string | number };

interface TranslationRow {
  entity_id: string;
  field_name: string;
  translated_value: string;
  source_hash: string | null;
  source_value: string | null;
}

/**
 * Coerce a raw `source_value` for translation.
 *
 * Plain string fields pass through. Array fields (e.g. `responsibilities`,
 * `technology`) are joined with newlines so LibreTranslate/MyMemory sees
 * one translatable chunk.
 */
function packForTranslate(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string').join('\n');
  if (typeof value === 'string') return value;
  return String(value);
}

/**
 * Inverse of `packForTranslate`. Splits a translated chunk back into an
 * array of strings, one per line. Trims whitespace and drops empties.
 */
function unpackTranslated(value: string): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Apply published translations to a list of rows.
 *
 * If a published row is missing for a given (entity, field), we
 * automatically generate + persist it using the translation provider.
 * This means public readers see English on the first request, then
 * Bangla on every subsequent request — and the admin console has the
 * row already populated.
 */
export async function applyTranslations<
  T extends Identifiable,
  E extends TranslatableEntityType,
>(
  rows: T[],
  entityType: E,
  locale: Locale,
  fields?: readonly string[],
): Promise<T[]> {
  if (!rows.length) return rows;
  if (locale === defaultLocale) return rows;

  const ids = rows
    .map((r) => String(r.id))
    .filter((id) => id.length > 0);
  const targetFields = fields ?? getTranslatableFields(entityType);
  if (!ids.length || !targetFields.length) return rows;

  const translations = await loadTranslations(entityType, ids, targetFields, locale);

  const missing = collectMissingTranslations(rows, translations, entityType, targetFields);
  if (missing.length > 0) {
    // Fire-and-await translation generation so the next request reads
    // the cached value. We don't block the user's render on this — we
    // kick it off in the background and return immediately with
    // English fallbacks for the still-missing fields.
    void autoGenerateTranslations(missing, locale).catch((err) => {
      console.warn('[i18n] auto-translate failed:', err instanceof Error ? err.message : err);
    });
  }

  return rows.map((row) => applyTranslationsToRow(row, translations, entityType, targetFields));
}

/**
 * Apply translations to JSONB blobs (e.g. `about_pages.values`).
 */
export async function applyJsonTranslation<T>(
  value: T,
  entityType: TranslatableEntityType,
  entityId: string,
  fieldName: string,
  locale: Locale,
): Promise<T> {
  if (locale === defaultLocale) return value;
  if (value == null) return value;

  const translations = await loadTranslations(
    entityType,
    [entityId],
    [fieldName],
    locale,
  );
  const tr = translations.get(`${entityId}::${fieldName}`);
  if (!tr) {
    void autoGenerateTranslations(
      [{ entityType, entityId, fieldName, sourceValue: typeof value === 'string' ? value : JSON.stringify(value) }],
      locale,
    ).catch(() => undefined);
    return value;
  }
  try {
    return JSON.parse(tr.translated_value) as T;
  } catch {
    return value;
  }
}

/**
 * Public-read Supabase client for translation lookups. The
 * `translations` table is fully readable to the anon role (it's used
 * to render the public site), so we use a bare anon client here to
 * avoid calling `cookies()` from inside `unstable_cache(...)` —
 * which is forbidden by Next.js.
 */
let _publicTranslationClient: SupabaseJsClient | null = null;
function getPublicTranslationClient(): SupabaseJsClient | null {
  if (_publicTranslationClient) return _publicTranslationClient;
  if (!isSupabaseConfigured()) return null;
  _publicTranslationClient = createClient(SUPABASE_ENV.url, SUPABASE_ENV.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'mukisoft-i18n' } },
  });
  return _publicTranslationClient;
}

/**
 * Internal: load published translations for a batch of (entity, ids, fields).
 */
async function loadTranslations(
  entityType: TranslatableEntityType,
  ids: string[],
  fields: readonly string[],
  locale: Locale,
): Promise<Map<string, TranslationRow>> {
  // Try the cookie-bound server client first (works when called from
  // a Server Component outside any cache). If that throws (because
  // we're inside `unstable_cache(...)`), fall back to the public anon
  // client — both yield the same rows because translations are public.
  let supabase: SupabaseJsClient | null;
  try {
    supabase = (createSupabaseServerClient() as unknown) as SupabaseJsClient | null;
    if (!supabase) {
      supabase = getPublicTranslationClient();
    }
  } catch {
    supabase = getPublicTranslationClient();
  }
  if (!supabase) return new Map();
  const { data, error } = await (supabase.from('translations') as any)
    .select('entity_id, field_name, translated_value, source_hash, source_value')
    .eq('entity_type', entityType)
    .eq('target_lang', locale)
    .eq('status', 'published')
    .in('entity_id', ids)
    .in('field_name', fields);

  const lookup = new Map<string, TranslationRow>();
  if (error || !data) return lookup;

  for (const row of data as TranslationRow[]) {
    lookup.set(`${row.entity_id}::${row.field_name}`, row);
  }
  return lookup;
}

/**
 * Internal: which (entity, field) pairs have no published translation
 * yet, and what's the current English value?
 */
function collectMissingTranslations(
  rows: Identifiable[],
  translations: Map<string, TranslationRow>,
  entityType: TranslatableEntityType,
  fields: readonly string[],
): Array<{ entityType: TranslatableEntityType; entityId: string; fieldName: string; sourceValue: string }> {
  const missing: Array<{ entityType: TranslatableEntityType; entityId: string; fieldName: string; sourceValue: string }> = [];
  for (const row of rows) {
    const id = String(row.id);
    for (const field of fields) {
      const key = `${id}::${field}`;
      if (translations.has(key)) continue;
      const raw = (row as Record<string, unknown>)[field];
      const sourceValue = packForTranslate(raw);
      if (!sourceValue || !sourceValue.trim()) continue;
      missing.push({ entityType, entityId: id, fieldName: field, sourceValue });
    }
  }
  return missing;
}

/**
 * Internal: translate + persist each missing field, marking the row
 * published so future reads skip translation.
 *
 * Uses the service-role client to bypass RLS — server-only, never
 * callable from a browser.
 */
async function autoGenerateTranslations(
  jobs: Array<{ entityType: TranslatableEntityType; entityId: string; fieldName: string; sourceValue: string }>,
  locale: Locale,
): Promise<void> {
  if (locale !== 'bn') return; // v1 only auto-translates English → Bangla
  let service;
  try {
    service = getServiceRoleClient();
  } catch {
    return; // Service role not configured — silently fall back to English.
  }

  await Promise.all(
    jobs.map(async (job) => {
      try {
        const { translated, provider } = await translateText(job.sourceValue, 'bn');
        const sourceHash = await hashSource(job.sourceValue);
        await (service.from('translations') as any).upsert(
          {
            entity_type: job.entityType,
            entity_id: job.entityId,
            field_name: job.fieldName,
            target_lang: locale,
            source_lang: 'en',
            source_value: job.sourceValue,
            source_hash: sourceHash,
            translated_value: translated,
            status: 'published',
            provider,
            published_at: new Date().toISOString(),
            last_error: null,
          },
          { onConflict: 'entity_type,entity_id,field_name,target_lang' },
        );
      } catch (err) {
        // Record the failure so admins can see it in the Translations
        // console and retry. Don't throw — auto-translate is best-effort.
        try {
          const sourceHash = await hashSource(job.sourceValue);
          const message = err instanceof Error ? err.message : 'Unknown translation error';
          await (service.from('translations') as any).upsert(
            {
              entity_type: job.entityType,
              entity_id: job.entityId,
              field_name: job.fieldName,
              target_lang: locale,
              source_lang: 'en',
              source_value: job.sourceValue,
              source_hash: sourceHash,
              translated_value: '',
              status: 'failed',
              last_error: message,
            },
            { onConflict: 'entity_type,entity_id,field_name,target_lang' },
          );
        } catch {
          /* swallow */
        }
      }
    }),
  );
}

/**
 * Internal: substitute translated values into a single row.
 */
function applyTranslationsToRow<T extends Identifiable>(
  row: T,
  translations: Map<string, TranslationRow>,
  entityType: TranslatableEntityType,
  fields: readonly string[],
): T {
  const id = String(row.id);
  const next = { ...(row as Record<string, unknown>) } as T;
  for (const field of fields) {
    const tr = translations.get(`${id}::${field}`);
    if (!tr) continue;
    const value = tr.translated_value;
    if (!value) continue;
    if (isArrayField(entityType, field)) {
      const arr = unpackTranslated(value);
      if (arr.length > 0) {
        (next as Record<string, unknown>)[field] = arr;
      }
    } else {
      (next as Record<string, unknown>)[field] = value;
    }
  }
  return next;
}

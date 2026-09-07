import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { hashSource, translateText, type TargetLang } from '@/lib/translate/provider';
import {
  isTranslatableEntity,
  type TranslatableEntityType,
} from '@/lib/i18n/translatable-fields';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Op = 'generate' | 'regenerate' | 'save' | 'publish' | 'unpublish' | 'markStale';

interface Body {
  op: Op;
  entityType: string;
  entityId: string;
  fieldName: string;
  targetLang?: TargetLang;
  sourceValue?: string;
  translatedValue?: string;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let payload: Body;
  try {
    payload = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { op, entityType, entityId, fieldName } = payload;
  if (!isTranslatableEntity(entityType)) {
    return NextResponse.json({ error: `Unknown entity type: ${entityType}` }, { status: 400 });
  }
  if (!entityId || !fieldName) {
    return NextResponse.json({ error: 'Missing entityId or fieldName' }, { status: 400 });
  }

  switch (op) {
    case 'generate':
    case 'regenerate': {
      const source = (payload.sourceValue ?? '').toString();
      if (!source.trim()) {
        return NextResponse.json({ error: 'sourceValue is required' }, { status: 400 });
      }
      const targetLang: TargetLang = 'bn';
      try {
        const { translated, provider } = await translateText(source, targetLang);
        const sourceHash = await hashSource(source);
        const { error } = await (supabase.from('translations') as any)
          .upsert(
            {
              entity_type: entityType,
              entity_id: entityId,
              field_name: fieldName,
              target_lang: targetLang,
              source_lang: 'en',
              source_value: source,
              source_hash: sourceHash,
              translated_value: translated,
              status: 'generated',
              provider,
              last_error: null,
              translated_by: userData.user.id,
            },
            { onConflict: 'entity_type,entity_id,field_name,target_lang' },
          );
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ ok: true, translated, provider, status: 'generated' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Translation failed';
        await (supabase.from('translations') as any)
          .upsert(
            {
              entity_type: entityType,
              entity_id: entityId,
              field_name: fieldName,
              target_lang: targetLang,
              source_lang: 'en',
              source_value: source,
              translated_value: '',
              status: 'failed',
              last_error: message,
            },
            { onConflict: 'entity_type,entity_id,field_name,target_lang' },
          );
        return NextResponse.json({ error: message }, { status: 502 });
      }
    }

    case 'save': {
      const translated = (payload.translatedValue ?? '').toString();
      const source = (payload.sourceValue ?? '').toString();
      const sourceHash = await hashSource(source);
      const { error } = await (supabase.from('translations') as any)
        .upsert(
          {
            entity_type: entityType,
            entity_id: entityId,
            field_name: fieldName,
            target_lang: 'bn',
            source_lang: 'en',
            source_value: source,
            source_hash: sourceHash,
            translated_value: translated,
            status: 'edited',
            last_error: null,
            translated_by: userData.user.id,
          },
          { onConflict: 'entity_type,entity_id,field_name,target_lang' },
        );
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, status: 'edited' });
    }

    case 'publish': {
      const { error } = await (supabase.from('translations') as any)
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('field_name', fieldName)
        .eq('target_lang', 'bn');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, status: 'published' });
    }

    case 'unpublish': {
      const { error } = await (supabase.from('translations') as any)
        .update({ status: 'generated' })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('field_name', fieldName)
        .eq('target_lang', 'bn');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, status: 'generated' });
    }

    case 'markStale': {
      const source = (payload.sourceValue ?? '').toString();
      const sourceHash = await hashSource(source);
      const { data: existing } = await (supabase.from('translations') as any)
        .select('source_hash, status')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('field_name', fieldName)
        .eq('target_lang', 'bn')
        .maybeSingle();
      if (!existing) return NextResponse.json({ ok: true, status: 'no_row' });
      if (existing.source_hash === sourceHash) {
        return NextResponse.json({ ok: true, status: 'unchanged' });
      }
      const { error } = await (supabase.from('translations') as any)
        .update({
          source_hash: sourceHash,
          source_value: source,
          status: 'deprecated',
        })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('field_name', fieldName)
        .eq('target_lang', 'bn');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, status: 'deprecated' });
    }

    default:
      return NextResponse.json({ error: `Unknown op: ${op}` }, { status: 400 });
  }
}

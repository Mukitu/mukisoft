import 'server-only';

/**
 * Translation provider — server-only.
 *
 * Primary: LibreTranslate (self-hosted or libretranslate.com).
 * Fallback: MyMemory (translated.net) — free anonymous tier, no key needed.
 *
 * Both are invoked with a generous timeout; on failure the caller's
 * caller surfaces a `status='failed'` row so admins can retry.
 */

export type TargetLang = 'bn';

const TIMEOUT_MS = 12_000;

export interface TranslateResult {
  translated: string;
  provider: 'libretranslate' | 'mymemory';
}

/**
 * Translate `text` from English to `targetLang`. Returns the translated
 * string and which provider succeeded. Throws on total failure.
 */
export async function translateText(
  text: string,
  targetLang: TargetLang,
): Promise<TranslateResult> {
  const trimmed = (text ?? '').trim();
  if (!trimmed) {
    return { translated: '', provider: 'libretranslate' };
  }

  if (targetLang !== 'bn') {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  const libre = await tryLibreTranslate(trimmed, targetLang);
  if (libre) return { translated: libre, provider: 'libretranslate' };

  const memory = await tryMyMemory(trimmed, targetLang);
  if (memory) return { translated: memory, provider: 'mymemory' };

  throw new Error('All translation providers failed');
}

async function tryLibreTranslate(
  text: string,
  targetLang: TargetLang,
): Promise<string | null> {
  const url = process.env.LIBRETRANSLATE_URL?.trim();
  if (!url) return null;

  const apiKey = process.env.LIBRETRANSLATE_API_KEY?.trim();
  const body: Record<string, unknown> = {
    q: text,
    source: 'en',
    target: targetLang,
    format: 'text',
  };
  if (apiKey) body.api_key = apiKey;

  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/translate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { translatedText?: string };
    const out = (data.translatedText ?? '').trim();
    return out || null;
  } catch {
    return null;
  }
}

async function tryMyMemory(
  text: string,
  targetLang: TargetLang,
): Promise<string | null> {
  const email = process.env.MYMEMORY_EMAIL?.trim();
  const params = new URLSearchParams({
    q: text,
    langpair: `en|${targetLang}`,
  });
  if (email) params.set('de', email);

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?${params.toString()}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    if (data.responseStatus && data.responseStatus >= 400) return null;
    const out = (data.responseData?.translatedText ?? '').trim();
    if (!out) return null;
    // MyMemory sometimes echoes the input when it can't translate. Treat
    // equality as failure.
    if (out.toLowerCase() === text.toLowerCase()) return null;
    return out;
  } catch {
    return null;
  }
}

/**
 * Compute a stable hash of the English source. Used to detect when a
 * translation has gone stale after the source value changed.
 */
export async function hashSource(value: string): Promise<string> {
  const data = new TextEncoder().encode(value ?? '');
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

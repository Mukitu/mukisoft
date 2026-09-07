import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  COOKIE_NAME,
  defaultLocale,
  isLocale,
  pickLocaleFromHeader,
  type Locale,
} from './config';

export { COOKIE_NAME };

/**
 * Determine the active locale for the current request.
 * Order of precedence:
 *   1. URL segment `/[locale]/...` (handled by Next — `params.locale`)
 *   2. `mukisoft_lang` cookie
 *   3. `Accept-Language` header
 *   4. Default locale
 */
export async function getRequestLocale(): Promise<Locale> {
  const c = cookies();
  const cookieValue = c.get(COOKIE_NAME)?.value;
  if (cookieValue && isLocale(cookieValue)) return cookieValue;

  const h = headers();
  return pickLocaleFromHeader(h.get('accept-language'));
}

export function resolveLocaleFromParams(params: { locale?: string } | undefined): Locale {
  const value = params?.locale;
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

/**
 * `next-intl` request config — drives server-side message loading.
 *
 * For static rendering of `/[locale]` pages we MUST call
 * `unstable_setRequestLocale(locale)` before any `getTranslations`
 * call. We use the dynamic config so `headers()` and `cookies()`
 * are available without forcing every page into dynamic mode.
 */
export default getRequestConfig(async ({ locale }) => {
  if (!isLocale(locale)) {
    notFound();
  }
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return {
    locale,
    messages,
    timeZone: 'UTC',
  };
});

/**
 * Centralized locale configuration.
 *
 * Every other i18n module reads from here so adding a third locale is a
 * matter of appending an entry and adding matching JSON + dictionaries.
 */
export const locales = ['en', 'bn'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
};

export const localeShortLabels: Record<Locale, string> = {
  en: 'EN',
  bn: 'বাংলা',
};

/** Maps a Locale to the value used in `<html lang>` and hreflang tags. */
export const localeToHtmlLang: Record<Locale, string> = {
  en: 'en',
  bn: 'bn',
};

/** Maps a Locale to its BCP-47 tag (used by OpenGraph, etc.). */
export const localeToBcp47: Record<Locale, string> = {
  en: 'en_US',
  bn: 'bn_BD',
};

/** Lookup list used by middleware to detect a locale prefix. */
export const localePrefixes = locales.map((l) => `/${l}`);

/** Cookie name used to remember the visitor's chosen locale. */
export const COOKIE_NAME = 'mukisoft_lang';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Pick the best supported locale from a header value (e.g. `Accept-Language`). */
export function pickLocaleFromHeader(headerValue: string | null | undefined): Locale {
  if (!headerValue) return defaultLocale;
  const tags = headerValue
    .split(',')
    .map((entry) => {
      const [tag] = entry.trim().split(';');
      return tag?.toLowerCase() ?? '';
    })
    .filter(Boolean);
  for (const tag of tags) {
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

/** Strip the locale prefix off a pathname. Returns `/foo/bar` and the locale. */
export function splitLocale(pathname: string): { locale: Locale; rest: string } {
  for (const l of locales) {
    const prefix = `/${l}`;
    if (pathname === prefix) return { locale: l, rest: '/' };
    if (pathname.startsWith(`${prefix}/`)) {
      return { locale: l, rest: pathname.slice(prefix.length) || '/' };
    }
  }
  return { locale: defaultLocale, rest: pathname || '/' };
}

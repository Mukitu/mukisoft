import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { defaultLocale, pickLocaleFromHeader, isLocale, COOKIE_NAME } from '@/lib/i18n/config';

/**
 * Root entry — picks a locale and 302-redirects to /<locale>/.
 *
 * Precedence:
 *   1. `mukisoft_lang` cookie
 *   2. `Accept-Language` header
 *   3. Default locale
 */
export const dynamic = 'force-dynamic';

export default function RootRedirect() {
  const cookieValue = cookies().get(COOKIE_NAME)?.value;
  const acceptLang = headers().get('accept-language');
  const locale =
    (cookieValue && isLocale(cookieValue) ? cookieValue : null) ??
    pickLocaleFromHeader(acceptLang) ??
    defaultLocale;
  redirect(`/${locale}`);
}

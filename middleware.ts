import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { SUPABASE_ENV, isSupabaseConfigured } from '@/lib/supabase/env';
import { defaultLocale, isLocale, locales, pickLocaleFromHeader, COOKIE_NAME } from '@/lib/i18n/config';

/**
 * Edge middleware — three responsibilities:
 *
 *   1. Locale routing: any public path that doesn't already start with
 *      a locale prefix is redirected to /<cookieLang|Accept-Language|en>/...
 *      This keeps existing deep links working after the i18n migration.
 *
 *   2. Admin guard: /mukisoftadmin/* requires a Supabase session.
 *
 *   3. Locale validation: paths like /<locale>/... with an UNKNOWN locale
 *      are bounced to the user's preferred locale instead of letting
 *      Vercel serve a static 404.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ---- Locale routing (public paths only) ---------------------------
  // Admin, API, Next internals, and static assets bypass the locale
  // redirect. The admin's pathname space is owned by Supabase auth.
  const isAdmin = pathname.startsWith('/mukisoftadmin');
  const isApi = pathname.startsWith('/api');
  const isInternal =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.');
  const hasLocalePrefix = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  // Strip the leading "/<locale>" segment (if any) to inspect the inner path.
  const innerPath = hasLocalePrefix
    ? pathname.replace(/^\/(en|bn)(?=\/|$)/, '') || '/'
    : pathname;

  // Treat an unknown locale prefix (e.g. /fr/about) as "no prefix" so we
  // redirect cleanly to a supported locale. Without this, Vercel serves
  // a 404 page for the unknown locale segment on a hard reload.
  const looksLikeLocaleButUnknown = /^\/[a-z]{2}(\/|$)/.test(pathname) && !hasLocalePrefix;

  if (!isAdmin && !isApi && !isInternal && (!hasLocalePrefix || looksLikeLocaleButUnknown)) {
    const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
    const picked = (cookieValue && isLocale(cookieValue)
      ? cookieValue
      : pickLocaleFromHeader(request.headers.get('accept-language'))) ?? defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${picked}${looksLikeLocaleButUnknown ? innerPath : pathname === '/' ? '/' : pathname}`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  // ---- Admin guard --------------------------------------------------
  if (!isAdmin) return NextResponse.next();
  if (pathname === '/mukisoftadmin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/mukisoftadmin/login', request.url));
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE_ENV.url, SUPABASE_ENV.anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const loginUrl = new URL('/mukisoftadmin/login', request.url);
    if (pathname !== '/mukisoftadmin') {
      loginUrl.searchParams.set('redirect', pathname + (search ?? ''));
    }
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

export const config = {
  // Skip Next internals + static files but keep locale & admin paths.
  // The leading "/" makes the root path match too, so a hard reload of
  // "/" runs middleware and gets redirected to /<defaultLocale>/.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/server.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Vercel-friendly image config — allow any remote host so we can pull
  // logos/assets from Supabase Storage without listing every bucket.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Power-user headers. Vercel applies these to every matching route,
  // including reloaded deep paths.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Social crawlers (Facebook, WhatsApp, LinkedIn, Slack, Telegram)
      // re-scrape OG images on a long TTL. Make sure the response is
      // explicitly marked `public, max-age=86400` so the CDN at the
      // edge caches it correctly and the Content-Type header is
      // pinned (some scrapers reject images served with the wrong
      // mime type).
      {
        source: '/og.png',
        headers: [
          { key: 'Content-Type', value: 'image/png' },
          { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
        ],
      },
      {
        source: '/og.jpg',
        headers: [
          { key: 'Content-Type', value: 'image/jpeg' },
          { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

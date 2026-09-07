import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config/site';
import { serviceCategories } from '@/lib/data/services';
import {
  fetchAllPublishedBlogSlugs,
  fetchPublishedGallerySlugs,
  fetchPublishedPortfolio,
  fetchPublishedResearchSlugs,
} from '@/lib/supabase/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes = [
    '/',
    '/about',
    '/founder',
    '/team',
    '/careers',
    '/services',
    '/portfolio',
    '/process',
    '/gallery',
    '/research',
    '/contact',
    '/blog',
    '/privacy-policy',
    '/terms-and-conditions',
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: p === '/' ? 1 : 0.7,
  }));

  const categoryRoutes = serviceCategories.map((c) => ({
    url: `${base}/services/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const serviceRoutes = serviceCategories.flatMap((c) =>
    c.services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  );

  // Dynamic CMS-driven portfolio routes — published projects only.
  const portfolio = await fetchPublishedPortfolio();
  const projectRoutes = portfolio.map((p) => ({
    url: `${base}/portfolio/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic CMS-driven blog routes — published posts only.
  const blog = await fetchAllPublishedBlogSlugs();
  const blogRoutes = blog.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic CMS-driven gallery routes — published events only.
  const gallery = await fetchPublishedGallerySlugs();
  const galleryRoutes = gallery.map((g) => ({
    url: `${base}/gallery/${g.slug}`,
    lastModified: new Date(g.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic CMS-driven research routes — published papers only.
  const research = await fetchPublishedResearchSlugs();
  const researchRoutes = research.map((r) => ({
    url: `${base}/research/${r.slug}`,
    lastModified: new Date(r.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...serviceRoutes,
    ...projectRoutes,
    ...blogRoutes,
    ...galleryRoutes,
    ...researchRoutes,
  ];
}
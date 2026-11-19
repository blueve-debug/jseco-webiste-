import { MetadataRoute } from 'next';
import { SEO_PAGES } from '@/lib/seo-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://goodecosolutions.in';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sell`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const landingRoutes: MetadataRoute.Sitemap = Object.keys(SEO_PAGES).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...landingRoutes];
}


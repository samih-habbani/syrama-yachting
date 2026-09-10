import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { resolveYachtHrefSync } from '@/lib/slug'
import { normalizeCity } from '@/lib/yacht-service'
import { getAllDestinations, destinationFullPath } from '@/lib/destinations'
import { getPublishedPosts } from '@/lib/blog'

const BASE_URL = 'https://www.syrama-yachting.com'

// Destinations and yachts are both DB-backed and editable without a
// redeploy (see /admin/dashboard/destinations and the yacht admin) — with
// no revalidate set here, Next.js renders this once at build time and
// serves that exact snapshot until the next deploy, so a destination or
// yacht added afterward would never appear in the sitemap. An hour keeps
// it reasonably fresh without re-querying every destination + yacht on
// every crawler hit (sitemaps get fetched often).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/yacht-charter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/yacht-sale`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    // /yachting/fleet itself is intentionally absent — it's a 308 redirect
    // to /yacht-charter/all-yachts now (see next.config.ts), and a sitemap
    // should never list a URL that redirects (wasted crawl budget, and a
    // conflicting signal alongside the destination it points to). These two
    // are its real replacements.
    { url: `${BASE_URL}/yacht-charter/all-yachts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/yacht-sale/all-yachts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/experiences`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Published blog articles — see lib/blog.ts (DB-backed: yachting_blog_post).
  const blogRoutes: MetadataRoute.Sitemap = (await getPublishedPosts()).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // The destination SEO landing pages — see lib/destinations.ts (DB-backed:
  // the `destination` table). Every URL is region-first: /yacht-charter/[region]
  // (or /yacht-sale/[region] for a sale destination) for a region-only
  // page, with /[city] added for a city.
  const destinations = await getAllDestinations()
  const destinationRoutes: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${BASE_URL}${destinationFullPath(d)}`,
    lastModified: d.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  try {
    const yachts = await prisma.yacht.findMany({
      where: { available: true },
      select: { id: true, model: true, builder: true, status: true, region: true, city: true, createdAt: true },
    })

    const yachtRoutes: MetadataRoute.Sitemap = yachts.map((yacht) => ({
      url: `${BASE_URL}${resolveYachtHrefSync({ ...yacht, city: normalizeCity(yacht.city) }, destinations)}`,
      lastModified: yacht.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticRoutes, ...destinationRoutes, ...blogRoutes, ...yachtRoutes]
  } catch {
    return [...staticRoutes, ...destinationRoutes, ...blogRoutes]
  }
}

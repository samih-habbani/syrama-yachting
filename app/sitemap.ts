import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { resolveYachtHrefSync } from '@/lib/slug'
import { normalizeCity } from '@/lib/yacht-service'
import { getAllDestinations, destinationPath } from '@/lib/destinations'

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
    { url: `${BASE_URL}/charters`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/sales`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/yachting/fleet`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/experiences`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  // The destination SEO landing pages — see lib/destinations.ts (DB-backed:
  // the `destination` table). Every URL is region-first: /yacht-charter/[region]
  // for a region-only page, /yacht-charter/[region]/[city] for a city.
  const destinations = await getAllDestinations()
  const destinationRoutes: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${BASE_URL}/yacht-charter/${destinationPath(d)}`,
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

    return [...staticRoutes, ...destinationRoutes, ...yachtRoutes]
  } catch {
    return [...staticRoutes, ...destinationRoutes]
  }
}

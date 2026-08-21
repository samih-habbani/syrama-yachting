import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://www.syrama-yachting.com'

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

  try {
    const yachts = await prisma.yacht.findMany({
      where: { available: true },
      select: { id: true, createdAt: true },
    })

    const yachtRoutes: MetadataRoute.Sitemap = yachts.map((yacht) => ({
      url: `${BASE_URL}/yachting/fleet/${yacht.id}`,
      lastModified: yacht.createdAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticRoutes, ...yachtRoutes]
  } catch {
    return staticRoutes
  }
}

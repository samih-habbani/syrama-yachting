// City-level SEO landing pages, always nested under their region —
// /yacht-charter/french-riviera/monaco, /yacht-charter/emirates/dubai, etc.
// The region-only overview page lives one level up, at
// /yacht-charter/[region]/page.tsx — see app/destination-page-shared.tsx
// for the page itself (shared with the /yacht-sale equivalent).
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDestinationByPath, allCityParams } from '@/lib/destinations'
import { generateDestinationMetadata, DestinationPageContent } from '@/app/destination-page-shared'

// Revalidated periodically rather than fully static, so a destination page
// picks up newly added/removed yachts without a full redeploy — same
// pattern as app/yachting/fleet/page.tsx. dynamicParams stays at its
// default (true): destinations are DB-backed and creatable from
// /admin/dashboard/destinations, so a city created after the last build
// still needs to render on first request instead of 404ing until the next
// deploy — it's then cached like any other page for `revalidate` seconds.
export const revalidate = 300

export async function generateStaticParams() {
  return allCityParams('charter')
}

export async function generateMetadata({ params }: { params: Promise<{ region: string; city: string }> }): Promise<Metadata> {
  const { region, city } = await params
  const destination = await getDestinationByPath(region, city, 'charter')
  if (!destination) return { title: 'Destination Not Found' }
  return generateDestinationMetadata(destination)
}

export default async function CityPage({ params }: { params: Promise<{ region: string; city: string }> }) {
  const { region, city } = await params
  const destination = await getDestinationByPath(region, city, 'charter')
  if (!destination) notFound()
  return <DestinationPageContent destination={destination} />
}

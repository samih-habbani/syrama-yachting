// Region-only SEO landing pages — /yacht-charter/french-riviera,
// /yacht-charter/greece, /yacht-charter/italy, etc. City pages within a
// region live one level down, at /yacht-charter/[region]/[city]/page.tsx —
// see app/yacht-charter/destination-page-shared.tsx for the page itself.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDestinationByPath, allRegionOnlyParams } from '@/lib/destinations'
import { generateDestinationMetadata, DestinationPageContent } from '../destination-page-shared'

// Revalidated periodically rather than fully static, so a destination page
// picks up newly added/removed yachts without a full redeploy — same
// pattern as app/yachting/fleet/page.tsx. dynamicParams stays at its
// default (true): destinations are DB-backed and creatable from
// /admin/dashboard/destinations, so a region created after the last build
// still needs to render on first request instead of 404ing until the next
// deploy — it's then cached like any other page for `revalidate` seconds.
export const revalidate = 300

export async function generateStaticParams() {
  return allRegionOnlyParams()
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params
  const destination = await getDestinationByPath(region, null)
  if (!destination) return { title: 'Destination Not Found' }
  return generateDestinationMetadata(destination)
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params
  const destination = await getDestinationByPath(region, null)
  if (!destination) notFound()
  return <DestinationPageContent destination={destination} />
}

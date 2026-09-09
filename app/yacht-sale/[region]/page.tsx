// Region-only SEO landing pages for yachts *for sale* — e.g.
// /yacht-sale/french-riviera. City pages within a region live one level
// down, at /yacht-sale/[region]/[city]/page.tsx — see
// app/destination-page-shared.tsx for the page itself (shared with the
// /yacht-charter equivalent).
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDestinationByPath, allRegionOnlyParams } from '@/lib/destinations'
import { generateDestinationMetadata, DestinationPageContent } from '@/app/destination-page-shared'

// Revalidated periodically rather than fully static, so a destination page
// picks up newly added/removed yachts without a full redeploy — same
// pattern as app/yachting/fleet/page.tsx. dynamicParams stays at its
// default (true): destinations are DB-backed and creatable from
// /admin/dashboard/destinations, so a region created after the last build
// still needs to render on first request instead of 404ing until the next
// deploy — it's then cached like any other page for `revalidate` seconds.
export const revalidate = 300

export async function generateStaticParams() {
  return allRegionOnlyParams('sale')
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params
  const destination = await getDestinationByPath(region, null, 'sale')
  if (!destination) return { title: 'Destination Not Found' }
  return generateDestinationMetadata(destination)
}

export default async function SaleRegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params
  const destination = await getDestinationByPath(region, null, 'sale')
  if (!destination) notFound()
  return <DestinationPageContent destination={destination} />
}

// Dual-purpose: a real city-level sale destination (e.g.
// /yacht-sale/french-riviera/cannes, once one exists) OR — since the
// site's only sale destination today (French Riviera) is region-only — a
// sale yacht's detail page nested directly under its region instead, e.g.
// /yacht-sale/french-riviera/22-akhir-532. A real city destination always
// wins if the segment matches one; see the comment on resolveYachtHrefSync
// in lib/slug.ts for why a region-only sale match nests one level
// shallower than a city match would.
//
// Charter never needs this: every region-only charter destination (Greece,
// Italy, ...) keeps its yachts on the flat /yachting/fleet/charters/[slug]
// URL instead — app/yacht-charter/[region]/[city]/page.tsx stays
// single-purpose (destinations only), do not copy this pattern there
// without first checking whether it's actually needed.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDestinationByPath, allCityParams } from '@/lib/destinations'
import { generateDestinationMetadata, DestinationPageContent } from '@/app/destination-page-shared'
import { generateYachtDetailMetadata, YachtDetailPageContent } from '@/app/yachting/fleet/yacht-detail-shared'

// Revalidated periodically rather than fully static, so a destination page
// picks up newly added/removed yachts without a full redeploy — same
// pattern as app/yachting/fleet/page.tsx. Also covers the yacht-detail
// branch below (which would otherwise want the longer 86400s used by the
// flat /yachting/fleet/sales/[slug] route) since a single route file can
// only declare one revalidate window — refreshing sale yacht content a
// bit more often than that isn't a real cost given the volume involved.
// dynamicParams stays at its default (true): both destinations and yachts
// are DB-backed and can appear after the last build, so either needs to
// render on first request instead of 404ing until the next deploy — it's
// then cached like any other page for `revalidate` seconds.
export const revalidate = 300

export async function generateStaticParams() {
  return allCityParams('sale')
}

export async function generateMetadata({ params }: { params: Promise<{ region: string; city: string }> }): Promise<Metadata> {
  const { region, city } = await params
  const destination = await getDestinationByPath(region, city, 'sale')
  if (destination) return generateDestinationMetadata(destination)
  return generateYachtDetailMetadata(city)
}

export default async function SaleCityOrYachtPage({ params }: { params: Promise<{ region: string; city: string }> }) {
  const { region, city } = await params

  const destination = await getDestinationByPath(region, city, 'sale')
  if (destination) {
    return <DestinationPageContent destination={destination} />
  }

  // Not a real city — try it as a yacht slug nested under this region's
  // own region-only sale destination. Never render a yacht page under a
  // region that has no sale destination at all (nothing could have linked
  // here for real).
  const regionDestination = await getDestinationByPath(region, null, 'sale')
  if (!regionDestination) notFound()

  return YachtDetailPageContent({
    slug: city,
    expectedSegment: 'sales',
    requestedPath: `/yacht-sale/${region}/${city}`,
  })
}

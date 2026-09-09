// A sale yacht's detail page, nested under its destination — e.g.
// /yacht-sale/french-riviera/[city]/[slug] once a city-level sale
// destination exists (today's one sale destination, French Riviera, is
// region-only, so sale yachts stay on the flat
// /yachting/fleet/sales/[slug] scheme instead — see the comment on
// resolveYachtHrefSync in lib/slug.ts for why a region-only match never
// nests). This route exists so the mechanism is ready the moment a
// city-level sale destination is added via the admin — mirrors
// app/yacht-charter/[region]/[city]/[yacht]/page.tsx exactly.
//
// This isn't a separate implementation: it calls into the exact same
// generateYachtDetailMetadata / YachtDetailPageContent as
// /yachting/fleet/sales/[slug]/page.tsx (see
// app/yachting/fleet/yacht-detail-shared.tsx), just reached by a different
// URL. A yacht requested here whose canonical URL doesn't actually match
// (wrong region/city, stale slug, no longer for sale...) 301-redirects to
// wherever it really belongs, same as the flat routes already do.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateYachtDetailMetadata, YachtDetailPageContent } from '@/app/yachting/fleet/yacht-detail-shared'
import { getDestinationByPath } from '@/lib/destinations'

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ region: string; city: string; yacht: string }> }): Promise<Metadata> {
  const { yacht } = await params
  return generateYachtDetailMetadata(yacht)
}

export default async function NestedSaleYachtDetailPage({ params }: { params: Promise<{ region: string; city: string; yacht: string }> }) {
  const { region, city, yacht } = await params
  // Not a real destination at all (unknown region/city combo) — never
  // render a yacht page under a URL that couldn't have come from a real
  // "Available Now" listing or Other Destinations link.
  if (!(await getDestinationByPath(region, city, 'sale'))) notFound()

  return YachtDetailPageContent({
    slug: yacht,
    expectedSegment: 'sales',
    requestedPath: `/yacht-sale/${region}/${city}/${yacht}`,
  })
}

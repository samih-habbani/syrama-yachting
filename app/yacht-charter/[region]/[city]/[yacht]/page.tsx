// A charter yacht's detail page, nested under its destination — e.g.
// /yacht-charter/french-riviera/monaco/520-fly-prestige-yacht-49 — so the
// URL reads as the logical next step after the destination page that
// linked to it (/yacht-charter/french-riviera/monaco). Region-only
// destination matches (Greece, Italy, a generic French Riviera yacht with
// no specific city...) stay on the flat /yachting/fleet/charters/[slug]
// scheme instead — see the comment on yachtHref in lib/slug.ts for why.
//
// This isn't a separate implementation: it calls into the exact same
// generateYachtDetailMetadata / YachtDetailPageContent as
// /yachting/fleet/charters/[slug]/page.tsx (see
// app/yachting/fleet/yacht-detail-shared.tsx), just reached by a different
// URL. A yacht requested here whose canonical URL doesn't actually match
// (wrong region/city, stale slug, no longer a charter...) 301-redirects to
// wherever it really belongs, same as the flat routes already do.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateYachtDetailMetadata, YachtDetailPageContent } from '@/app/yachting/fleet/yacht-detail-shared'
import { getDestinationByPath } from '@/lib/destinations'

export const revalidate = 86400
export const dynamicParams = true

// Without this, Next.js has no static shell to extend for this dynamic
// segment and renders every single request fully dynamically — `revalidate`
// above is silently ignored and no response is ever cached (confirmed via
// `Cache-Control: no-store` and multi-second response times even on repeat
// hits, same issue found on the flat /yachting/fleet/charters|sales/[slug]
// routes). An empty list is enough: the first visit to any yacht still
// generates on-demand (dynamicParams: true), but that render is then
// cached per `revalidate` instead of re-querying the database on every
// single yacht-page view.
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ region: string; city: string; yacht: string }> }): Promise<Metadata> {
  const { yacht } = await params
  return generateYachtDetailMetadata(yacht)
}

export default async function NestedCharterYachtDetailPage({ params }: { params: Promise<{ region: string; city: string; yacht: string }> }) {
  const { region, city, yacht } = await params
  // Not a real destination at all (unknown region/city combo) — never
  // render a yacht page under a URL that couldn't have come from a real
  // "Available Now" listing or Other Destinations link.
  if (!(await getDestinationByPath(region, city))) notFound()

  return YachtDetailPageContent({
    slug: yacht,
    expectedSegment: 'charters',
    requestedPath: `/yacht-charter/${region}/${city}/${yacht}`,
  })
}

// Shared implementation behind /yachting/fleet/charters/[slug] and
// /yachting/fleet/sales/[slug] — not a route itself (no page/layout/route
// export at this path), just the logic both thin page.tsx files call into
// so a charter and a sale yacht page never drift apart by accident.
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getYachtById, getSimilarYachts } from '@/lib/yacht-service'
import YachtDetailClient from '@/components/YachtDetailClient'
import { idFromSlug, type YachtTypeSegment } from '@/lib/slug'
import { getDestinationForYacht, getRelatedDestinations, destinationFullPath } from '@/lib/destinations'
import { breadcrumbJsonLd } from '@/lib/breadcrumb'

const SITE_URL = 'https://www.syrama-yachting.com'

export async function generateYachtDetailMetadata(slug: string): Promise<Metadata> {
  const id = idFromSlug(slug)
  const yacht = id !== null ? await getYachtById(id) : null
  if (!yacht) return { title: 'Yacht Not Found' }

  const canonicalPath = yacht.href
  const isCharter = (yacht.status || '').toLowerCase() === 'location'
  const lengthLabel = `${yacht.length}${yacht.lengthUnit || 'm'}`
  const title = `${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''} — ${lengthLabel} Yacht`
  const description = isCharter
    ? `Charter the ${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''}, a ${lengthLabel} yacht${yacht.maxGuests ? ` for up to ${yacht.maxGuests} guests` : ''}${yacht.region ? ` in ${yacht.region}` : ''}. Request availability with Syrama Yachting.`
    : `${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''} for sale — a ${lengthLabel} yacht${yacht.region ? ` in ${yacht.region}` : ''}. Contact Syrama Yachting to speak with a broker.`
  const imageUrl = yacht.media?.[0]?.url ? `/uploads/yachts/${yacht.media[0].url}` : undefined

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

// `requestedPath` defaults to the flat /yachting/fleet/[segment]/[slug]
// shape for the two thin routes still using that scheme; the nested
// /yacht-charter/[region]/[city]/[yacht] route passes its own full path in
// explicitly, since it doesn't follow that pattern.
export async function YachtDetailPageContent({ slug, expectedSegment, requestedPath }: { slug: string; expectedSegment: YachtTypeSegment; requestedPath?: string }) {
  const id = idFromSlug(slug)
  if (id === null) notFound()

  const yachtData = await getYachtById(id)
  if (!yachtData) notFound()

  // Single check covers every reason to redirect: an old bare-id link, a
  // stale slug (model/builder text changed), the wrong charter/sale segment
  // (e.g. a yacht switched from charter to sale after being listed), or —
  // now — a charter yacht accessed at its old flat URL when it actually
  // belongs under a destination's nested URL (see lib/slug.ts's yachtHref).
  const canonicalPath = yachtData.href
  if ((requestedPath ?? `/yachting/fleet/${expectedSegment}/${slug}`) !== canonicalPath) {
    permanentRedirect(canonicalPath)
  }

  const isCharter = expectedSegment === 'charters'
  const offerPrice = isCharter ? yachtData.priceDay : yachtData.priceSale
  // Independent of each other (both only need yachtData) — run concurrently
  // rather than as two sequential round trips.
  const [similarYachts, destination] = await Promise.all([
    getSimilarYachts(yachtData),
    getDestinationForYacht(yachtData),
  ])
  // Same "Other Destinations" internal-mesh links shown on the destination
  // page itself (see app/destination-page-shared.tsx) — reused here so a
  // yacht page also crawls out toward every sibling destination, not just
  // back to its own one. getRelatedDestinations is kind-aware internally,
  // so this is correct for both charter and sale once `destination` has
  // matched (a sale yacht only ever gets sale siblings). Depends on
  // `destination` above, so it can't join that Promise.all.
  const relatedDestinations = destination ? await getRelatedDestinations(destination) : []

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: isCharter ? 'Yacht Charter' : 'Yachts for Sale', href: isCharter ? '/yacht-charter' : '/yacht-sale' },
    ...(destination ? [{ label: destination.name, href: destinationFullPath(destination) }] : []),
    { label: yachtData.model },
  ]

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: yachtData.model,
    brand: yachtData.builder || undefined,
    description: `${yachtData.model}${yachtData.builder ? ` by ${yachtData.builder}` : ''}, a ${yachtData.length}${yachtData.lengthUnit || 'm'} yacht${yachtData.maxGuests ? ` for up to ${yachtData.maxGuests} guests` : ''}.`,
    image: yachtData.media?.[0]?.url ? `${SITE_URL}/uploads/yachts/${yachtData.media[0].url}` : undefined,
    offers: offerPrice ? {
      '@type': 'Offer',
      priceCurrency: yachtData.currency || 'EUR',
      price: offerPrice,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}${canonicalPath}`,
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }}
      />
      <YachtDetailClient
        yacht={yachtData}
        similarYachts={similarYachts}
        destinationHref={destination ? destinationFullPath(destination) : undefined}
        destinationName={destination?.name}
        itineraries={destination?.itineraries}
        destinationFaq={destination?.faq}
        relatedDestinations={relatedDestinations.map((rel) => ({ name: rel.name, href: destinationFullPath(rel) }))}
      />
    </>
  )
}

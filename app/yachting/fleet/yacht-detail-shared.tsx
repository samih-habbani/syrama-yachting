// Shared implementation behind /yachting/fleet/charters/[slug] and
// /yachting/fleet/sales/[slug] — not a route itself (no page/layout/route
// export at this path), just the logic both thin page.tsx files call into
// so a charter and a sale yacht page never drift apart by accident.
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getYachtById, getSimilarYachts } from '@/lib/yacht-service'
import YachtDetailClient from '@/components/YachtDetailClient'
import { idFromSlug, yachtHref, type YachtTypeSegment } from '@/lib/slug'

const SITE_URL = 'https://www.syrama-yachting.com'

export async function generateYachtDetailMetadata(slug: string): Promise<Metadata> {
  const id = idFromSlug(slug)
  const yacht = id !== null ? await getYachtById(id) : null
  if (!yacht) return { title: 'Yacht Not Found' }

  const canonicalPath = yachtHref(yacht)
  const isCharter = (yacht.status || '').toLowerCase() === 'location'
  const title = `${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''} — ${yacht.length}m Yacht`
  const description = isCharter
    ? `Charter the ${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''}, a ${yacht.length}m yacht${yacht.maxGuests ? ` for up to ${yacht.maxGuests} guests` : ''}${yacht.region ? ` in ${yacht.region}` : ''}. Request availability with Syrama Yachting.`
    : `${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''} for sale — a ${yacht.length}m yacht${yacht.region ? ` in ${yacht.region}` : ''}. Contact Syrama Yachting to speak with a broker.`
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

export async function YachtDetailPageContent({ slug, expectedSegment }: { slug: string; expectedSegment: YachtTypeSegment }) {
  const id = idFromSlug(slug)
  if (id === null) notFound()

  const yachtData = await getYachtById(id)
  if (!yachtData) notFound()

  // Single check covers every reason to redirect: an old bare-id link, a
  // stale slug (model/builder text changed), or the wrong charter/sale
  // segment (e.g. a yacht switched from charter to sale after being listed).
  const canonicalPath = yachtHref(yachtData)
  if (`/yachting/fleet/${expectedSegment}/${slug}` !== canonicalPath) {
    permanentRedirect(canonicalPath)
  }

  const similarYachts = await getSimilarYachts(yachtData)
  const isCharter = expectedSegment === 'charters'
  const offerPrice = isCharter ? yachtData.priceDay : yachtData.priceSale

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: yachtData.model,
    brand: yachtData.builder || undefined,
    description: `${yachtData.model}${yachtData.builder ? ` by ${yachtData.builder}` : ''}, a ${yachtData.length}m yacht${yachtData.maxGuests ? ` for up to ${yachtData.maxGuests} guests` : ''}.`,
    image: yachtData.media?.[0]?.url ? `${SITE_URL}/uploads/yachts/${yachtData.media[0].url}` : undefined,
    offers: offerPrice ? {
      '@type': 'Offer',
      priceCurrency: 'EUR',
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
      <YachtDetailClient yacht={yachtData} similarYachts={similarYachts} />
    </>
  )
}

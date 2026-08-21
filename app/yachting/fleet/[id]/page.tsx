import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import YachtDetailClient from '@/components/YachtDetailClient'

interface Media {
  id: number
  url: string | null
  alt: string | null
}

interface Yacht {
  id: number
  model: string
  builder: string | null
  length: number
  maxGuests: number | null
  cabins: number
  year: number | null
  priceDay: number | null
  region: string | null
  city: string | null
  media?: Media[]
}

export const revalidate = 86400
export const dynamicParams = true

const SITE_URL = 'https://www.syrama-yachting.com'

async function getYacht(id: string) {
  const yachtId = parseInt(id)

  const yacht = await prisma.$queryRaw<(Yacht & { media: Media[] | null })[]>`
    SELECT
      y.id, y.model, y.builder, y.length, y.max_guests as "maxGuests",
      y.cabins, y.year, y.price_day as "priceDay",
      y.region, y.city,
      (SELECT json_agg(json_build_object('id', m.id, 'url', m.url, 'alt', m.alt) ORDER BY m.id)
       FROM media m WHERE m.yacht_id = y.id) as media
    FROM yacht y
    WHERE y.id = ${yachtId}
  `

  if (!yacht || yacht.length === 0) return null

  return {
    ...yacht[0],
    media: yacht[0].media || []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const yacht = await getYacht(id)
  if (!yacht) return { title: 'Yacht Not Found' }

  const title = `${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''} — ${yacht.length}m Yacht`
  const description = `Charter the ${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''}, a ${yacht.length}m yacht${yacht.maxGuests ? ` for up to ${yacht.maxGuests} guests` : ''}${yacht.region ? ` in ${yacht.region}` : ''}. Request availability with Syrama Yachting.`
  const imageUrl = yacht.media?.[0]?.url ? `/uploads/yachts/${yacht.media[0].url}` : undefined

  return {
    title,
    description,
    alternates: { canonical: `/yachting/fleet/${yacht.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/yachting/fleet/${yacht.id}`,
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

export default async function YachtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const yachtData = await getYacht(id)
  if (!yachtData) notFound()

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: yachtData.model,
    brand: yachtData.builder || undefined,
    description: `${yachtData.model}${yachtData.builder ? ` by ${yachtData.builder}` : ''}, a ${yachtData.length}m yacht${yachtData.maxGuests ? ` for up to ${yachtData.maxGuests} guests` : ''}.`,
    image: yachtData.media?.[0]?.url ? `${SITE_URL}/uploads/yachts/${yachtData.media[0].url}` : undefined,
    offers: yachtData.priceDay ? {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: yachtData.priceDay,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/yachting/fleet/${yachtData.id}`,
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <YachtDetailClient yacht={yachtData} />
    </>
  )
}

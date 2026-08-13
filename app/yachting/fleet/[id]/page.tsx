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

export default async function YachtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const yachtId = parseInt(id)

  const yacht = await prisma.$queryRaw`
    SELECT
      y.id, y.model, y.builder, y.length, y.max_guests as "maxGuests",
      y.cabins, y.year, y.price_day as "priceDay",
      y.region, y.city,
      (SELECT json_agg(json_build_object('id', m.id, 'url', m.url, 'alt', m.alt) ORDER BY m.id)
       FROM media m WHERE m.yacht_id = y.id) as media
    FROM yacht y
    WHERE y.id = ${yachtId}
  ` as Promise<(Yacht & { media: Media[] | null })[]>

  if (!yacht || yacht.length === 0) notFound()

  const yachtData = {
    ...yacht[0],
    media: yacht[0].media || []
  }

  return <YachtDetailClient yacht={yachtData} />
}

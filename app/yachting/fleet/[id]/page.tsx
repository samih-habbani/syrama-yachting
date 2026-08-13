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

export default async function YachtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const yachtId = parseInt(id)

  const yacht = await prisma.yacht.findUnique({
    where: { id: yachtId },
    select: {
      id: true,
      model: true,
      builder: true,
      length: true,
      maxGuests: true,
      cabins: true,
      year: true,
      priceDay: true,
      region: true,
      city: true,
      media: {
        orderBy: { id: 'asc' },
        select: { id: true, url: true, alt: true }
      }
    }
  })

  if (!yacht) notFound()

  return <YachtDetailClient yacht={yacht} />
}

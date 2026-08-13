import { prisma } from './prisma'

export async function getYachts(options: {
  type?: 'charter' | 'sale'
  limit?: number
  region?: string | null
  builder?: string | null
  minLength?: number
  maxLength?: number
  minGuests?: number
  maxGuests?: number
} = {}) {
  const {
    type = 'charter',
    limit = 100,
    region = null,
    builder = null,
    minLength = 0,
    maxLength = 200,
    minGuests = 0,
    maxGuests = 100,
  } = options

  const where: any = {}

  if (type === 'charter') {
    where.status = { in: ['Location', 'location'] }
  } else if (type === 'sale') {
    where.status = { in: ['Vente', 'vente'] }
  }

  if (region) {
    where.region = { equals: region, mode: 'insensitive' }
  }

  if (builder) {
    where.builder = { equals: builder, mode: 'insensitive' }
  }

  if (minLength || maxLength) {
    where.length = {}
    if (minLength) where.length.gte = minLength
    if (maxLength) where.length.lte = maxLength
  }

  if (minGuests || maxGuests) {
    where.maxGuests = {}
    if (minGuests) where.maxGuests.gte = minGuests
    if (maxGuests) where.maxGuests.lte = maxGuests
  }

  return prisma.yacht.findMany({
    where,
    orderBy: { id: 'asc' },
    take: limit,
    select: {
      id: true,
      builder: true,
      model: true,
      length: true,
      maxGuests: true,
      cabins: true,
      priceDay: true,
      status: true,
      media: {
        take: 1,
        orderBy: { id: 'asc' },
        select: { id: true, url: true, alt: true }
      }
    }
  })
}

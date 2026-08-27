import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

export type YachtSortBy = 'default' | 'price-asc' | 'price-desc' | 'length-asc' | 'length-desc'

export async function getYachts(options: {
  type?: 'charter' | 'sale' | 'all'
  limit?: number
  region?: string | null
  builder?: string | null
  minLength?: number
  maxLength?: number
  minGuests?: number
  maxGuests?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: YachtSortBy
} = {}) {
  const {
    type = 'all',
    limit = 500,
    region = null,
    builder = null,
    // No default bounds here: a range filter must only be applied when the
    // caller actually asks for one. Defaulting maxGuests to e.g. 100 would
    // turn into a `lte: 100` clause, which in Postgres silently excludes
    // every yacht with maxGuests = NULL (common on sale listings) even
    // though no one asked to filter by guests.
    minLength,
    maxLength,
    minGuests,
    maxGuests,
    minPrice,
    maxPrice,
    sortBy = 'default',
  } = options

  const where: any = {
    available: true,
  }

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

  if (minPrice || maxPrice) {
    where.priceDay = {}
    if (minPrice) where.priceDay.gte = minPrice
    if (maxPrice) where.priceDay.lte = maxPrice
  }

  const orderBy: Prisma.YachtOrderByWithRelationInput =
    sortBy === 'price-asc' ? { priceDay: { sort: 'asc', nulls: 'last' } } :
    sortBy === 'price-desc' ? { priceDay: { sort: 'desc', nulls: 'last' } } :
    sortBy === 'length-asc' ? { length: 'asc' } :
    sortBy === 'length-desc' ? { length: 'desc' } :
    { id: 'asc' }

  return prisma.yacht.findMany({
    where,
    orderBy,
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
      region: true,
      media: {
        take: 1,
        orderBy: { id: 'asc' },
        select: { id: true, url: true, alt: true }
      }
    }
  })
}

interface SimilarYachtRow {
  id: number
  builder: string | null
  model: string
  length: number
  maxGuests: number | null
  cabins: number
  priceDay: number | null
  status: string | null
  region: string | null
  media: { id: number; url: string | null; alt: string | null }[] | null
}

// Other yachts of the same kind (charter/sale) closest in length to the
// given yacht — used for the "Similar Yachts" section on a yacht's page.
// Sorted and limited in the database so only the `limit` winning rows (and
// their thumbnail) are ever fetched, instead of pulling the whole fleet.
export async function getSimilarYachts(yacht: { id: number; length: number; status: string | null }, limit = 3) {
  const isCharter = (yacht.status || '').toLowerCase() === 'location'
  const [statusA, statusB] = isCharter ? ['Location', 'location'] : ['Vente', 'vente']

  const rows = await prisma.$queryRaw<SimilarYachtRow[]>`
    SELECT
      y.id, y.builder, y.model, y.length, y.max_guests as "maxGuests",
      y.cabins, y.price_day as "priceDay", y.status, y.region,
      (SELECT json_agg(t) FROM (
        SELECT m.id, m.url, m.alt FROM media m WHERE m.yacht_id = y.id ORDER BY m.id ASC LIMIT 1
      ) t) as media
    FROM yacht y
    WHERE y.available = true
      AND y.id != ${yacht.id}
      AND (y.status = ${statusA} OR y.status = ${statusB})
    ORDER BY ABS(y.length - ${yacht.length})
    LIMIT ${limit}
  `

  return rows.map((row) => ({ ...row, media: row.media || [] }))
}

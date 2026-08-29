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
      priceSale: true,
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

export interface YachtDetail {
  id: number
  model: string
  builder: string | null
  length: number
  maxGuests: number | null
  cabins: number
  bathrooms: number | null
  maxSleeping: number | null
  year: number | null
  priceDay: number | null
  priceSale: number | null
  priceHour: number | null
  priceWeek: number | null
  region: string | null
  city: string | null
  status: string | null
  engines: string | null
  engineHours: number | null
  beam: number | null
  beamOpenPlatform: number | null
  draft: number | null
  cruiseSpeed: number | null
  maxSpeed: number | null
  consumption: string | null
  autonomy: string | null
  fuelCapacity: number | null
  waterCapacity: number | null
  navigationClass: string | null
  dryWeight: number | null
  hull: string | null
  media: { id: number; url: string | null; alt: string | null }[]
}

// Full detail record for a single yacht's page — id, every spec field (used
// to build the full "all info we have" spec sheet on a sale yacht's page),
// and its full media gallery (unlike getYachts()/getSimilarYachts(), which
// only take a thumbnail for card display).
export async function getYachtById(id: number): Promise<YachtDetail | null> {
  const rows = await prisma.$queryRaw<(Omit<YachtDetail, 'media'> & { media: YachtDetail['media'] | null })[]>`
    SELECT
      y.id, y.model, y.builder, y.length, y.max_guests as "maxGuests",
      y.cabins, y.bathrooms, y.max_sleeping as "maxSleeping",
      y.year, y.price_day as "priceDay", y.price_sale as "priceSale",
      y.price_hour as "priceHour", y.price_week as "priceWeek",
      y.region, y.city, y.status,
      y.engines, y.engine_hours as "engineHours",
      y.beam, y.beam_open_platform as "beamOpenPlatform", y.draft,
      y.cruise_speed as "cruiseSpeed", y.max_speed as "maxSpeed",
      y.consumption, y.autonomy,
      y.fuel_capacity as "fuelCapacity", y.water_capacity as "waterCapacity",
      y.navigation_class as "navigationClass", y.dry_weight as "dryWeight", y.hull,
      (SELECT json_agg(json_build_object('id', m.id, 'url', m.url, 'alt', m.alt) ORDER BY m.id)
       FROM media m WHERE m.yacht_id = y.id) as media
    FROM yacht y
    WHERE y.id = ${id}
  `

  if (!rows || rows.length === 0) return null

  return {
    ...rows[0],
    media: rows[0].media || []
  }
}

interface SimilarYachtRow {
  id: number
  builder: string | null
  model: string
  length: number
  maxGuests: number | null
  cabins: number
  priceDay: number | null
  priceSale: number | null
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
      y.cabins, y.price_day as "priceDay", y.price_sale as "priceSale", y.status, y.region,
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

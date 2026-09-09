import { cache } from 'react'
import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import { resolveYachtHref, resolveYachtHrefSync } from './slug'
import { getAllDestinations } from './destinations'

export type YachtSortBy = 'default' | 'price-asc' | 'price-desc' | 'length-asc' | 'length-desc'

interface YachtListRow {
  id: number
  builder: string | null
  model: string
  length: number
  lengthUnit: string
  maxGuests: number | null
  cabins: number
  priceDay: number | null
  priceHour: number | null
  priceWeek: number | null
  priceSale: number | null
  currency: string
  status: string | null
  region: string | null
  city: string | null
  mediaId: number | null
  mediaUrl: string | null
  mediaAlt: string | null
}

// Raw SQL with a LATERAL join, rather than Prisma's `findMany({ select: {
// media: { take: 1 } } })` — a nested relation with `take` forces Prisma's
// query engine into a separate correlated-subquery round trip for the
// media, on top of the main yacht query. Against this project's remote DB
// (real network latency per round trip, not local), that doubled the total
// time: ~2.8s instead of ~1.5s for the exact same 400+ rows, measured
// directly. A LATERAL join gets the same "one thumbnail per yacht" result
// in a single round trip.
export async function getYachts(options: {
  type?: 'charter' | 'sale' | 'all'
  limit?: number
  region?: string | null
  city?: string | null
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
    city = null,
    builder = null,
    // No default bounds here: a range filter must only be applied when the
    // caller actually asks for one. Defaulting maxGuests to e.g. 100 would
    // turn into a `<= 100` clause, which in Postgres silently excludes
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

  const conditions: Prisma.Sql[] = [Prisma.sql`y.available = true`]

  if (type === 'charter') {
    conditions.push(Prisma.sql`y.status IN ('Location', 'location')`)
  } else if (type === 'sale') {
    conditions.push(Prisma.sql`y.status IN ('Vente', 'vente')`)
  }

  if (region) conditions.push(Prisma.sql`LOWER(y.region) = LOWER(${region})`)
  if (city) conditions.push(Prisma.sql`LOWER(y.city) = LOWER(${city})`)
  if (builder) conditions.push(Prisma.sql`LOWER(y.builder) = LOWER(${builder})`)
  if (minLength) conditions.push(Prisma.sql`y.length >= ${minLength}`)
  if (maxLength) conditions.push(Prisma.sql`y.length <= ${maxLength}`)
  if (minGuests) conditions.push(Prisma.sql`y.max_guests >= ${minGuests}`)
  if (maxGuests) conditions.push(Prisma.sql`y.max_guests <= ${maxGuests}`)
  if (minPrice) conditions.push(Prisma.sql`y.price_day >= ${minPrice}`)
  if (maxPrice) conditions.push(Prisma.sql`y.price_day <= ${maxPrice}`)

  const whereSql = Prisma.join(conditions, ' AND ')

  const orderBySql =
    sortBy === 'price-asc' ? Prisma.sql`y.price_day ASC NULLS LAST` :
    sortBy === 'price-desc' ? Prisma.sql`y.price_day DESC NULLS LAST` :
    sortBy === 'length-asc' ? Prisma.sql`y.length ASC` :
    sortBy === 'length-desc' ? Prisma.sql`y.length DESC` :
    Prisma.sql`y.id ASC`

  const rows = await prisma.$queryRaw<YachtListRow[]>`
    SELECT
      y.id, y.builder, y.model, y.length, y.length_unit as "lengthUnit", y.max_guests as "maxGuests",
      y.cabins, y.price_day as "priceDay", y.price_hour as "priceHour", y.price_week as "priceWeek",
      y.price_sale as "priceSale", y.currency, y.status, y.region, y.city,
      m.id as "mediaId", m.url as "mediaUrl", m.alt as "mediaAlt"
    FROM yacht y
    LEFT JOIN LATERAL (
      SELECT id, url, alt FROM media WHERE media.yacht_id = y.id ORDER BY id ASC LIMIT 1
    ) m ON true
    WHERE ${whereSql}
    ORDER BY ${orderBySql}
    LIMIT ${limit}
  `

  const yachts = rows.map((r) => ({
    id: r.id, builder: r.builder, model: r.model, length: r.length, lengthUnit: r.lengthUnit,
    maxGuests: r.maxGuests, cabins: r.cabins, priceDay: r.priceDay, priceHour: r.priceHour,
    priceWeek: r.priceWeek, priceSale: r.priceSale, currency: r.currency, status: r.status,
    region: r.region, city: r.city,
    media: r.mediaId !== null ? [{ id: r.mediaId, url: r.mediaUrl, alt: r.mediaAlt }] : [],
  }))

  // A few legacy rows spell the same town differently ("Golfe Juan" vs
  // "Golfe-Juan") — normalized here, at the source, so every consumer (the
  // public fleet's City filter, the destination pages) sees one canonical
  // spelling instead of two near-duplicate entries.
  const normalized = yachts.map((y) => ({ ...y, city: normalizeCity(y.city) }))

  // `href` resolved once, here, server-side — client components (Fleet.tsx's
  // cards, FleetFilters.tsx's search field) just read yacht.href instead of
  // ever calling resolveYachtHref themselves, since that needs a DB read for
  // the destination match. One getAllDestinations() call for the whole
  // batch (not one per yacht via resolveYachtHref — see the comment on
  // resolveYachtHrefSync for why that matters).
  const destinations = await getAllDestinations()
  return normalized.map((y) => ({ ...y, href: resolveYachtHrefSync(y, destinations) }))
}

const CITY_ALIASES: Record<string, string> = {
  'golfe-juan': 'Golfe Juan',
}

// Exported so other raw-Prisma consumers of yacht.city (e.g. app/sitemap.ts,
// which doesn't go through getYachts() above) apply the same normalization
// — otherwise a row spelled the "wrong" way would silently fail to match
// its destination (see lib/destinations.ts / getDestinationForYacht).
export function normalizeCity(city: string | null): string | null {
  if (!city) return city
  return CITY_ALIASES[city.toLowerCase()] || city
}

export interface YachtDetail {
  id: number
  model: string
  builder: string | null
  length: number
  lengthUnit: string
  maxGuests: number | null
  cabins: number
  bathrooms: number | null
  maxSleeping: number | null
  year: number | null
  priceDay: number | null
  priceSale: number | null
  priceHour: number | null
  priceWeek: number | null
  currency: string
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
  href: string
}

// Full detail record for a single yacht's page — id, every spec field (used
// to build the full "all info we have" spec sheet on a sale yacht's page),
// and its full media gallery (unlike getYachts()/getSimilarYachts(), which
// only take a thumbnail for card display).
//
// cache()'d — a yacht's page.tsx calls this once via generateMetadata and
// once via the page component itself (the standard Next.js pattern), which
// without this were two separate, un-deduped round trips to the database
// for the exact same row on every single page load.
export const getYachtById = cache(async (id: number): Promise<YachtDetail | null> => {
  // Fetched alongside the yacht row instead of after it — resolveYachtHref
  // below needs the destinations list but not the yacht row itself, so
  // there's no reason to pay these as two sequential round trips when they
  // can run concurrently (this call is also the one that ends up
  // populating getAllDestinations()'s cache()'d result for every other
  // caller on the same page — getSimilarYachts, getDestinationForYacht —
  // so kicking it off this early means it's already warm by the time
  // they need it too).
  const [rows] = await Promise.all([
    prisma.$queryRaw<(Omit<YachtDetail, 'media' | 'href'> & { media: YachtDetail['media'] | null })[]>`
      SELECT
        y.id, y.model, y.builder, y.length, y.length_unit as "lengthUnit", y.max_guests as "maxGuests",
        y.cabins, y.bathrooms, y.max_sleeping as "maxSleeping",
        y.year, y.price_day as "priceDay", y.price_sale as "priceSale",
        y.price_hour as "priceHour", y.price_week as "priceWeek", y.currency,
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
    `,
    getAllDestinations(),
  ])

  if (!rows || rows.length === 0) return null

  const yacht = { ...rows[0], city: normalizeCity(rows[0].city), media: rows[0].media || [] }
  return { ...yacht, href: await resolveYachtHref(yacht) }
})

interface SimilarYachtRow {
  id: number
  builder: string | null
  model: string
  length: number
  lengthUnit: string
  maxGuests: number | null
  cabins: number
  priceDay: number | null
  priceHour: number | null
  priceWeek: number | null
  priceSale: number | null
  currency: string
  status: string | null
  region: string | null
  city: string | null
  media: { id: number; url: string | null; alt: string | null }[] | null
}

// Other yachts of the same kind (charter/sale) closest in length to the
// given yacht — used for the "Similar Yachts" section on a yacht's page.
// Sorted and limited in the database so only the `limit` winning rows (and
// their thumbnail) are ever fetched, instead of pulling the whole fleet.
//
// Excludes any row sharing the same builder+model as the source yacht: the
// imported fleet has several models (e.g. "Sanlorenzo 52") duplicated
// verbatim — same specs, same price, same photo — across many regions as
// separate rows (real inventory per the source data, not something this
// project rewrites). Without this exclusion, a yacht's own duplicates tied
// for the closest length match and "Similar Yachts" ended up showing the
// same yacht three times over instead of three actually different options.
export async function getSimilarYachts(yacht: { id: number; length: number; status: string | null; builder?: string | null; model?: string }, limit = 3) {
  const isCharter = (yacht.status || '').toLowerCase() === 'location'
  const [statusA, statusB] = isCharter ? ['Location', 'location'] : ['Vente', 'vente']

  const rows = await prisma.$queryRaw<SimilarYachtRow[]>`
    SELECT
      y.id, y.builder, y.model, y.length, y.length_unit as "lengthUnit", y.max_guests as "maxGuests",
      y.cabins, y.price_day as "priceDay", y.price_hour as "priceHour", y.price_week as "priceWeek",
      y.price_sale as "priceSale", y.currency, y.status, y.region, y.city,
      (SELECT json_agg(t) FROM (
        SELECT m.id, m.url, m.alt FROM media m WHERE m.yacht_id = y.id ORDER BY m.id ASC LIMIT 1
      ) t) as media
    FROM yacht y
    WHERE y.available = true
      AND y.id != ${yacht.id}
      AND (y.status = ${statusA} OR y.status = ${statusB})
      AND NOT (LOWER(COALESCE(y.builder, '')) = LOWER(${yacht.builder || ''}) AND LOWER(y.model) = LOWER(${yacht.model || ''}))
    ORDER BY ABS(y.length - ${yacht.length}), y.id
    LIMIT ${limit}
  `

  const normalized = rows.map((row) => ({ ...row, city: normalizeCity(row.city), media: row.media || [] }))
  const destinations = await getAllDestinations()
  return normalized.map((row) => ({ ...row, href: resolveYachtHrefSync(row, destinations) }))
}

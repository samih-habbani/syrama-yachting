// Destination catalogue for the /yacht-charter and /yacht-sale SEO landing
// pages — a region always appears in the URL, prefixed by kind:
//   /yacht-charter/[region](/[city])   — see app/yacht-charter/[region](/[city])/page.tsx
//   /yacht-sale/[region](/[city])      — see app/yacht-sale/[region](/[city])/page.tsx
// e.g. /yacht-charter/french-riviera/monaco and /yacht-sale/french-riviera.
// A charter and a sale destination can share the same region/city — every
// lookup below is scoped by `kind` so the two never cross (see
// DestinationKind).
//
// Backed by the `destination` / `destination_faq` / `destination_itinerary`
// tables (see prisma/schema.prisma) — editable from
// /admin/dashboard/destinations, so adding or changing a destination is a
// database edit, not a code change. Every row is loaded once per request
// (React's `cache()` dedupes repeat calls within the same render pass) and
// the helper functions below operate on that in-memory snapshot — this
// file is Server Component / route-handler only; a client component must
// never import it directly (see lib/slug.ts's resolveYachtHref for how a
// yacht's destination-aware URL still reaches client-rendered cards without
// doing so).
//
// There is no formal DB relation from Yacht to Destination: geography only
// exists as free-text Yacht.region / Yacht.city. Each row's `region`/`city`
// columns map to the exact values actually stored on yacht rows, so the
// yacht list on a destination page is always real inventory, never a
// fabricated placeholder.
import { cache } from 'react'
import { prisma } from './prisma'

export interface DestinationFaqItem {
  question: string
  answer: string
}

export interface DestinationItinerary {
  name: string
  description: string
}

export type DestinationKind = 'charter' | 'sale'

export interface Destination {
  id: number
  // "charter" (/yacht-charter/...) or "sale" (/yacht-sale/...) — a charter
  // and a sale destination can share the same regionSlug/citySlug (both
  // can have a French Riviera entry), so every lookup below is scoped by
  // kind to avoid crossing the two.
  kind: DestinationKind
  // URL segments — see the module comment above. citySlug is null for a
  // region-only page (e.g. Greece, French Riviera itself).
  regionSlug: string
  citySlug: string | null
  name: string
  // Value(s) to query the DB with — see lib/yacht-service.ts getYachts().
  // Note: getYachts() normalizes a couple of inconsistent legacy city
  // spellings (e.g. "Golfe-Juan" → "Golfe Juan") before this is ever
  // compared against, so `city` here should always be the canonical form.
  region: string
  city: string | null
  title: string
  metaDescription: string
  h1: string
  heroImage: string
  eyebrow: string
  intro: string[]
  itineraries: DestinationItinerary[]
  faq: DestinationFaqItem[]
  // Other destinations to cross-link from this page's "Explore other
  // destinations" section — see point 9 of the SEO brief (internal mesh).
  // Each entry is a `regionSlug` (region-only page) or `regionSlug/citySlug`
  // (city page) — resolved via getDestinationByKey(). Same-region siblings
  // are added automatically by the page itself (see app/yacht-charter), so
  // this only needs cross-region suggestions.
  related: string[]
  // Real last-edit timestamp (from the admin) — used as the sitemap's
  // lastModified for this URL instead of a freshly generated "now" on
  // every build, per the original SEO brief's instruction not to fake one.
  updatedAt: Date
}

interface DestinationRow {
  id: number
  kind: DestinationKind
  regionSlug: string
  citySlug: string | null
  name: string
  region: string
  city: string | null
  title: string
  metaDescription: string
  h1: string
  heroImage: string
  eyebrow: string
  intro: string[]
  relatedKeys: string[]
  updatedAt: Date
  faqItems: { question: string; answer: string }[] | null
  itineraries: { name: string; description: string }[] | null
}

// The one DB read for the whole catalogue (~21 rows with their FAQ/
// itineraries) — cache()'d so multiple helper calls within one request
// (page + metadata + breadcrumbs + related-destinations, say) share a
// single query instead of one each.
//
// Raw SQL with a json_agg subquery per relation, rather than Prisma's
// `findMany({ include: { faqItems: ..., itineraries: ... } })` — each
// `include` triggers its own separate round trip to the database (one for
// destinations, one for every faq row, one for every itinerary row), and
// against this project's remote DB that's real added latency per round
// trip: ~3.1s measured for this exact query via `include`, vs ~1.7s as one
// query. Every destination/yacht page calls this, so it sets a floor on
// how fast any of them can ever load.
export const getAllDestinations = cache(async (): Promise<Destination[]> => {
  const rows = await prisma.$queryRaw<DestinationRow[]>`
    SELECT
      d.id, d.kind, d.region_slug as "regionSlug", d.city_slug as "citySlug", d.name, d.region, d.city,
      d.title, d.meta_description as "metaDescription", d.h1, d.hero_image as "heroImage",
      d.eyebrow, d.intro, d.related_keys as "relatedKeys", d.updated_at as "updatedAt",
      (SELECT json_agg(json_build_object('question', f.question, 'answer', f.answer) ORDER BY f.position ASC)
       FROM destination_faq f WHERE f.destination_id = d.id) as "faqItems",
      (SELECT json_agg(json_build_object('name', it.name, 'description', it.description) ORDER BY it.position ASC)
       FROM destination_itinerary it WHERE it.destination_id = d.id) as "itineraries"
    FROM destination d
    ORDER BY d.id ASC
  `

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    regionSlug: row.regionSlug,
    citySlug: row.citySlug,
    name: row.name,
    region: row.region,
    city: row.city,
    title: row.title,
    metaDescription: row.metaDescription,
    h1: row.h1,
    heroImage: row.heroImage,
    eyebrow: row.eyebrow,
    intro: row.intro,
    related: row.relatedKeys,
    updatedAt: row.updatedAt,
    faq: row.faqItems ?? [],
    itineraries: row.itineraries ?? [],
  }))
})

// The public URL prefix for a destination's kind.
export function destinationUrlPrefix(kind: DestinationKind): string {
  return kind === 'sale' ? '/yacht-sale' : '/yacht-charter'
}

// The path segment(s) after the kind's prefix for a destination — a single
// regionSlug for a region-only page, or `regionSlug/citySlug` for a city.
export function destinationPath(d: Pick<Destination, 'regionSlug' | 'citySlug'>): string {
  return d.citySlug ? `${d.regionSlug}/${d.citySlug}` : d.regionSlug
}

// The full public URL, e.g. /yacht-charter/french-riviera/monaco or
// /yacht-sale/french-riviera.
export function destinationFullPath(d: Pick<Destination, 'kind' | 'regionSlug' | 'citySlug'>): string {
  return `${destinationUrlPrefix(d.kind)}/${destinationPath(d)}`
}

export async function getDestinationByPath(regionSlug: string, citySlug: string | null = null, kind: DestinationKind = 'charter'): Promise<Destination | undefined> {
  const destinations = await getAllDestinations()
  return destinations.find((d) => d.kind === kind && d.regionSlug === regionSlug && d.citySlug === citySlug)
}

export interface DestinationLink { kind: DestinationKind; region: string; city: string | null; path: string }

// A lightweight {kind, region, city, path} projection of every destination
// — safe to pass down into a 'use client' component (components/Fleet.tsx),
// unlike the full Destination array. Lets the Destination/City filters
// there navigate to the matching dedicated /yacht-charter or /yacht-sale
// page instead of only filtering the currently-loaded grid: a client-side
// filter change can't by itself update that page's title, H1, intro or
// FAQ, so without this a user picking "Cannes" while on the
// Beaulieu-sur-Mer page would keep seeing Beaulieu-sur-Mer's copy above a
// Cannes-filtered grid. `kind` lets the caller only match within the same
// kind as the page it's currently on (see components/Fleet.tsx).
export async function getDestinationLinks(): Promise<DestinationLink[]> {
  const destinations = await getAllDestinations()
  return destinations.map((d) => ({ kind: d.kind, region: d.region, city: d.city, path: destinationFullPath(d) }))
}

// Resolves a `related` entry — either a bare regionSlug ('greece') or a
// 'regionSlug/citySlug' pair ('french-riviera/monaco') — always within the
// same kind as the destination that referenced it.
export async function getDestinationByKey(key: string, kind: DestinationKind = 'charter'): Promise<Destination | undefined> {
  const [region, city] = key.split('/')
  return getDestinationByPath(region, city ?? null, kind)
}

// The region-level overview page for a given regionSlug, if one exists —
// not every region does (Emirates only has the Dubai city page) — used to
// decide whether a breadcrumb's region segment should be a link.
export async function getRegionOverviewDestination(regionSlug: string, kind: DestinationKind = 'charter'): Promise<Destination | undefined> {
  const destinations = await getAllDestinations()
  return destinations.find((d) => d.kind === kind && d.regionSlug === regionSlug && d.citySlug === null)
}

// Every other destination sharing the same region AND kind as `destination`
// — used so a destination page's "Explore More" section always lists every
// sibling city automatically (see app/yacht-charter), without needing each
// row's `related` list hand-maintained for same-region completeness. A
// charter page never lists a sale destination here, or vice versa.
export async function getSameRegionDestinations(destination: Destination): Promise<Destination[]> {
  const destinations = await getAllDestinations()
  return destinations.filter((d) => d.kind === destination.kind && d.regionSlug === destination.regionSlug && d.id !== destination.id)
}

// Same-region siblings first, then the hand-curated cross-region
// suggestions from destination.related (e.g. Corsica from the French
// Riviera page), deduped — the "Other Destinations" list shown on a
// destination page and, for internal-mesh value, on the pages of yachts
// based there (see components/YachtDetailClient.tsx).
export async function getRelatedDestinations(destination: Destination): Promise<Destination[]> {
  const sameRegion = await getSameRegionDestinations(destination)
  const curated = (
    await Promise.all(destination.related.map((key) => getDestinationByKey(key, destination.kind)))
  ).filter((d): d is Destination => Boolean(d))
  const seenPaths = new Set<string>()
  return [...sameRegion, ...curated].filter((d) => {
    const path = destinationFullPath(d)
    if (seenPaths.has(path)) return false
    seenPaths.add(path)
    return true
  })
}

// generateStaticParams for app/yacht-charter/[region]/page.tsx and
// app/yacht-sale/[region]/page.tsx.
export async function allRegionOnlyParams(kind: DestinationKind = 'charter'): Promise<{ region: string }[]> {
  const destinations = await getAllDestinations()
  return destinations.filter((d) => d.kind === kind && d.citySlug === null).map((d) => ({ region: d.regionSlug }))
}

// generateStaticParams for app/yacht-charter/[region]/[city]/page.tsx and
// app/yacht-sale/[region]/[city]/page.tsx.
export async function allCityParams(kind: DestinationKind = 'charter'): Promise<{ region: string; city: string }[]> {
  const destinations = await getAllDestinations()
  return destinations
    .filter((d): d is Destination & { citySlug: string } => d.kind === kind && d.citySlug !== null)
    .map((d) => ({ region: d.regionSlug, city: d.citySlug }))
}

// Charter vs sale, derived the same way lib/slug.ts's yachtTypeSegment
// does — duplicated here (rather than imported) since lib/slug.ts already
// imports from this file and importing back would be circular.
function isCharterStatus(status: string | null | undefined): boolean {
  return (status || '').toLowerCase() === 'location'
}

// Reverse lookup used to link a yacht's page back to "its" destination page
// — a city-specific match (e.g. city="Cannes") wins over a region-only page
// (e.g. "French Riviera" with city: null) so a Cannes yacht links to
// /yacht-charter/french-riviera/cannes, not the broader Riviera page. Only
// matches within the yacht's own kind (derived from `status`) — a sale
// yacht in French Riviera must never pick up a charter destination's
// content, and vice versa. Returns undefined when the yacht isn't in any
// of the mapped destinations — callers must fall back to the existing
// fleet link, never invent a destination page that doesn't exist.
//
// Synchronous and takes the already-loaded `destinations` list explicitly
// — used when resolving many yachts at once (see
// lib/yacht-service.ts's getYachts/getSimilarYachts and app/sitemap.ts) so
// the caller fetches getAllDestinations() exactly once for the whole batch
// instead of once per yacht (which, relying on cache() alone across a
// Promise.all of hundreds of yachts, was enough concurrent DB calls to
// exhaust the connection pool).
export function matchDestinationForYacht(destinations: Destination[], yacht: { region?: string | null; city?: string | null; status?: string | null }): Destination | undefined {
  const kind: DestinationKind = isCharterStatus(yacht.status) ? 'charter' : 'sale'
  const pool = destinations.filter((d) => d.kind === kind)
  const region = (yacht.region || '').toLowerCase()
  const city = (yacht.city || '').toLowerCase()

  const cityMatch = pool.find((d) => d.city && d.city.toLowerCase() === city && d.region.toLowerCase() === region)
  if (cityMatch) return cityMatch

  return pool.find((d) => d.city === null && d.region.toLowerCase() === region)
}

// Single-yacht async convenience wrapper — see lib/slug.ts's
// resolveYachtHref for the same split applied to href resolution.
export async function getDestinationForYacht(yacht: { region?: string | null; city?: string | null; status?: string | null }): Promise<Destination | undefined> {
  const destinations = await getAllDestinations()
  return matchDestinationForYacht(destinations, yacht)
}

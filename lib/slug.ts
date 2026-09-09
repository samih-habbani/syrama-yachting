// Shared slug helpers for SEO-friendly yacht URLs, e.g.
// /yachting/fleet/charters/520-fly-prestige-yacht-49 instead of
// /yachting/fleet/49. The numeric id always stays as the last hyphen-
// separated segment, so a yacht can always be looked up from its slug
// regardless of the text part.
import { type Destination, getAllDestinations, matchDestinationForYacht, destinationPath } from './destinations'

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function yachtSlug(yacht: { id: number; model: string; builder?: string | null }): string {
  const base = slugify(`${yacht.model} ${yacht.builder || ''}`.trim())
  return base ? `${base}-${yacht.id}` : String(yacht.id)
}

// Pulls the trailing numeric id out of a slug — works for both the new
// "520-fly-prestige-yacht-49" format and a bare legacy "49" URL.
export function idFromSlug(slug: string): number | null {
  const match = /(\d+)$/.exec(slug)
  return match ? parseInt(match[1], 10) : null
}

// The URL segment that distinguishes a charter yacht's page from a sale
// yacht's page — matches the DB status convention used everywhere else
// ('Location'/'location' = charter, everything else = sale).
export type YachtTypeSegment = 'charters' | 'sales'

export function yachtTypeSegment(status: string | null | undefined): YachtTypeSegment {
  return (status || '').toLowerCase() === 'location' ? 'charters' : 'sales'
}

// Plain flat URL — /yachting/fleet/charters|sales/[slug] — with no
// destination awareness (destinations are DB-backed now, so matching one
// needs an async lookup; see resolveYachtHref below for the real canonical
// URL). Kept as a synchronous, no-DB fallback for the rare case a yacht
// object reaches a component without its resolved `href` already attached
// — every normal code path should have one (see the comment there).
export function yachtHref(yacht: { id: number; model: string; builder?: string | null; status?: string | null }): string {
  return `/yachting/fleet/${yachtTypeSegment(yacht.status)}/${yachtSlug(yacht)}`
}

// The real canonical path to a yacht's detail page. A charter yacht whose
// region/city matches a dedicated SEO destination *city* page (see
// lib/destinations.ts) gets a nested URL under that destination instead —
// e.g. /yacht-charter/french-riviera/monaco/520-fly-prestige-yacht-49 — so
// the yacht page reads as the logical next step after the destination page
// that linked to it. A region-only match (e.g. Greece, or French Riviera
// with no specific city) is deliberately excluded: that URL depth is
// already taken by the destination route itself
// (/yacht-charter/[region]/[city]/page.tsx), so nesting a yacht slug there
// too would collide with it. Those, and sale yachts, keep the flat
// /yachting/fleet/charters|sales/[slug] scheme (yachtHref above).
//
// Async because the destination match now needs a DB read — called once,
// server-side, wherever a yacht is fetched (lib/yacht-service.ts's
// getYachts/getYachtById/getSimilarYachts), with the result attached as
// that yacht's own `href` field. Client components (Fleet.tsx's cards,
// FleetFilters.tsx's search field, YachtDetailClient.tsx's Similar Yachts)
// then just read `yacht.href` — they never call this themselves, since a
// client component can't await a database query mid-render.
//
// For a SINGLE yacht (getYachtById). For resolving many yachts at once, use
// resolveYachtHrefSync with an already-loaded destinations list instead —
// see the comment there for why.
export async function resolveYachtHref(yacht: { id: number; model: string; builder?: string | null; status?: string | null; region?: string | null; city?: string | null }): Promise<string> {
  const destinations = await getAllDestinations()
  return resolveYachtHrefSync(yacht, destinations)
}

// Same as resolveYachtHref, but synchronous over an already-loaded
// `destinations` list — used to resolve a whole batch of yachts (getYachts,
// getSimilarYachts, app/sitemap.ts) from a single getAllDestinations() call
// instead of one per yacht. That per-yacht version technically worked
// (getAllDestinations is cache()'d), but cache() dedupes within one React
// render pass, not across a route handler's plain Promise.all over
// hundreds of yachts — that fired that many concurrent queries and
// exhausted the database's connection pool.
export function resolveYachtHrefSync(yacht: { id: number; model: string; builder?: string | null; status?: string | null; region?: string | null; city?: string | null }, destinations: Destination[]): string {
  const segment = yachtTypeSegment(yacht.status)
  if (segment === 'charters') {
    const destination = matchDestinationForYacht(destinations, yacht)
    if (destination?.citySlug) {
      return `/yacht-charter/${destinationPath(destination)}/${yachtSlug(yacht)}`
    }
  }
  return `/yachting/fleet/${segment}/${yachtSlug(yacht)}`
}

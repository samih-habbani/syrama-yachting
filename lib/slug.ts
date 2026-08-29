// Shared slug helpers for SEO-friendly yacht URLs, e.g.
// /yachting/fleet/charters/520-fly-prestige-yacht-49 instead of
// /yachting/fleet/49. The numeric id always stays as the last hyphen-
// separated segment, so a yacht can always be looked up from its slug
// regardless of the text part.

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

// Full canonical path to a yacht's detail page, e.g.
// /yachting/fleet/charters/520-fly-prestige-yacht-49
export function yachtHref(yacht: { id: number; model: string; builder?: string | null; status?: string | null }): string {
  return `/yachting/fleet/${yachtTypeSegment(yacht.status)}/${yachtSlug(yacht)}`
}

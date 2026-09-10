// Data access + shared types for the blog (/blog and /blog/[slug]).
//
// Backed by the `yachting_blog_post` table (see prisma/schema.prisma) —
// deliberately NOT `blog_post`, which belongs to a different Syrama
// Services property sharing this database. Editable from
// /admin/dashboard/blog.
//
// This module is published-content only (every helper filters to
// status = 'published') and Server Component / route-handler only. The
// admin API routes query `prisma.yachtingBlogPost` directly instead, since
// they need drafts too.
import { cache } from 'react'
import { prisma } from './prisma'

export const BLOG_CATEGORIES = [
  'Charter Guides',
  'Destinations',
  'Buying a Yacht',
  'Yachting Advice',
  // Dedicated topical cluster for Dubai-specific charter content (price,
  // routes, occasions, pre-booking questions). Drives the same-category
  // "Related Articles" block so a reader stays inside the Dubai cluster,
  // and has one real hub page at /blog/category/dubai-yacht-charter (see
  // app/blog/category/[category]/page.tsx). Broader educational articles
  // stay in "Charter Guides" — this is only for pieces that are genuinely
  // Dubai-focused.
  'Dubai Yacht Charter',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

// A blog post body is an ordered list of these. `text` on paragraph / quote
// / list items may contain inline [label](/path) links and **bold** — see
// renderInline in components/blog/BlogContent.tsx. Kept intentionally small:
// enough for well-segmented long-form editorial, nothing that turns an
// article into a landing page.
export type BlogBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string; attribution?: string }
  // A Q&A block. Rendered as a styled list by BlogContent, and — when a
  // post contains at least one — also emitted as FAQPage JSON-LD by the
  // article page. Use only where the questions are real pre-booking
  // searches, not filler.
  | { type: 'faq'; items: { q: string; a: string }[] }

export interface BlogPost {
  id: number
  slug: string
  title: string
  metaTitle: string | null
  metaDescription: string
  excerpt: string
  content: BlogBlock[]
  coverImage: string
  coverImageAlt: string
  category: string
  tags: string[]
  publishedAt: Date | null
  readingMinutes: number
  updatedAt: Date
}

// Prisma returns `content` as `unknown` (Json column). Narrow it to
// BlogBlock[] defensively — a malformed row should render as an empty
// article, never throw during a page render.
function asBlocks(raw: unknown): BlogBlock[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (b): b is BlogBlock =>
      !!b && typeof b === 'object' && typeof (b as { type?: unknown }).type === 'string',
  )
}

type Row = {
  id: number
  slug: string
  title: string
  metaTitle: string | null
  metaDescription: string
  excerpt: string
  content: unknown
  coverImage: string
  coverImageAlt: string
  category: string
  tags: string[]
  publishedAt: Date | null
  readingMinutes: number
  updatedAt: Date
}

function toPost(row: Row): BlogPost {
  return { ...row, content: asBlocks(row.content) }
}

const SELECT = {
  id: true,
  slug: true,
  title: true,
  metaTitle: true,
  metaDescription: true,
  excerpt: true,
  content: true,
  coverImage: true,
  coverImageAlt: true,
  category: true,
  tags: true,
  publishedAt: true,
  readingMinutes: true,
  updatedAt: true,
} as const

// Every published post, newest first. Cached per request so the index page
// and its pagination count don't hit the DB twice.
export const getPublishedPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await prisma.yachtingBlogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: SELECT,
  })
  return rows.map(toPost)
})

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const row = await prisma.yachtingBlogPost.findFirst({
    where: { slug, status: 'published' },
    select: SELECT,
  })
  return row ? toPost(row) : null
})

// Up to `limit` other published posts in the same category, newest first,
// then topped up with any recent posts if the category is thin — an
// article should always have a few onward links.
export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const all = (await getPublishedPosts()).filter((p) => p.slug !== post.slug)
  const sameCategory = all.filter((p) => p.category === post.category)
  const rest = all.filter((p) => p.category !== post.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  return (await getPublishedPosts()).map((p) => p.slug)
}

// Published posts in one category, newest first — used by the category hub
// page (app/blog/category/[category]/page.tsx).
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  return (await getPublishedPosts()).filter((p) => p.category === category)
}

// ~200 words per minute, floored at 1 — used at save time (admin API and
// the seed script), not at render time.
export function computeReadingMinutes(content: BlogBlock[]): number {
  const words = content.reduce((n, block) => {
    if (block.type === 'list') return n + block.items.join(' ').split(/\s+/).length
    if (block.type === 'faq') return n + block.items.map((i) => `${i.q} ${i.a}`).join(' ').split(/\s+/).length
    if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'quote') {
      return n + block.text.split(/\s+/).length
    }
    return n
  }, 0)
  return Math.max(1, Math.round(words / 200))
}

// ---- Admin write helpers (used by the /api/admin/blog route handlers) ----

// Shape validation shared by create (POST) and update (PUT).
export function validateBlogPayload(data: Record<string, unknown>): { error: string } | { ok: true } {
  const required = ['slug', 'title', 'metaDescription', 'excerpt', 'coverImage', 'coverImageAlt', 'category']
  for (const field of required) {
    const v = data[field]
    if (typeof v !== 'string' || !v.trim()) return { error: `"${field}" is required` }
  }
  if (!Array.isArray(data.content) || data.content.length === 0) {
    return { error: 'The article needs at least one content block' }
  }
  if (data.status !== undefined && data.status !== 'draft' && data.status !== 'published') {
    return { error: 'status must be "draft" or "published"' }
  }
  return { ok: true }
}

// Normalises a raw JSON payload into a Prisma write object. `existingPublishedAt`
// carries the current value on update so an already-published post keeps its
// original publish date; a post pulled back to draft loses it.
export function toBlogWriteData(data: Record<string, unknown>, existingPublishedAt?: Date | null) {
  const status = data.status === 'published' ? 'published' : 'draft'
  const content = data.content as BlogBlock[]
  return {
    slug: String(data.slug).trim().toLowerCase(),
    title: String(data.title).trim(),
    metaTitle: data.metaTitle ? String(data.metaTitle).trim() : null,
    metaDescription: String(data.metaDescription).trim(),
    excerpt: String(data.excerpt).trim(),
    content: content as unknown as object,
    coverImage: String(data.coverImage).trim(),
    coverImageAlt: String(data.coverImageAlt).trim(),
    category: String(data.category).trim(),
    tags: Array.isArray(data.tags)
      ? (data.tags as unknown[]).map((t) => String(t).trim()).filter(Boolean)
      : [],
    status,
    publishedAt: status === 'published' ? (existingPublishedAt ?? new Date()) : null,
    readingMinutes: computeReadingMinutes(content),
  }
}

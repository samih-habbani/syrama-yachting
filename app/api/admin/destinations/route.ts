import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

function destinationPublicPath(d: { kind: string; regionSlug: string; citySlug: string | null }) {
  const prefix = d.kind === 'sale' ? '/yacht-sale' : '/yacht-charter'
  return d.citySlug ? `${prefix}/${d.regionSlug}/${d.citySlug}` : `${prefix}/${d.regionSlug}`
}

// GET — every destination, for the admin list page. Lightweight (no
// faq/itineraries) — the edit page fetches the full row by id separately.
export async function GET() {
  try {
    await checkAuth()
    const destinations = await prisma.destination.findMany({
      orderBy: [{ kind: 'asc' }, { id: 'asc' }],
      select: {
        id: true, kind: true, regionSlug: true, citySlug: true, name: true,
        region: true, city: true, updatedAt: true,
      },
    })
    return Response.json({ destinations })
  } catch (error) {
    console.error('List destinations error:', error)
    return Response.json({ error: 'Failed to fetch destinations' }, { status: 500 })
  }
}

// POST — create a new destination page (region-only, or a city under an
// existing region), of either kind. `citySlug`/`city` empty = a
// region-only page. A charter and a sale destination can share the same
// regionSlug/citySlug (e.g. both have a French Riviera entry) — every
// uniqueness check here is scoped by kind.
export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const {
      kind, regionSlug, citySlug, name, region, city,
      title, metaDescription, h1, heroImage, eyebrow,
      intro, relatedKeys, faqItems, itineraries,
    } = data

    const normalizedKind = kind === 'sale' ? 'sale' : 'charter'

    if (!regionSlug || !name || !region || !title || !metaDescription || !h1 || !heroImage || !eyebrow) {
      return Response.json({ error: 'Region slug, name, region, and every SEO field are required' }, { status: 400 })
    }

    // "all-yachts" is a literal folder at this exact depth for both kinds
    // (app/yacht-charter/all-yachts, app/yacht-sale/all-yachts — the full
    // unfiltered fleet page) and Next.js always matches a literal segment
    // before a sibling [region] one — a region-only destination with this
    // slug would be permanently unreachable (shadowed by that page) despite
    // existing in the DB and the sitemap.
    if (regionSlug === 'all-yachts') {
      return Response.json({ error: '"all-yachts" is reserved (it\'s the full-fleet page\'s own URL) and can\'t be used as a region slug' }, { status: 400 })
    }

    const normalizedCitySlug = citySlug ? String(citySlug).trim() || null : null

    // Postgres' unique index on (kind, region_slug, city_slug) lets
    // multiple NULL city_slug rows through — enforce "one region-only page
    // per region and kind" here instead.
    if (!normalizedCitySlug) {
      const existing = await prisma.destination.findFirst({ where: { kind: normalizedKind, regionSlug, citySlug: null } })
      if (existing) {
        return Response.json({ error: `A ${normalizedKind} region-only page for "${regionSlug}" already exists` }, { status: 409 })
      }
    }

    const created = await prisma.destination.create({
      data: {
        kind: normalizedKind, regionSlug, citySlug: normalizedCitySlug, name, region, city: city || null,
        title, metaDescription, h1, heroImage, eyebrow,
        intro: Array.isArray(intro) ? intro : [],
        relatedKeys: Array.isArray(relatedKeys) ? relatedKeys : [],
        faqItems: {
          create: (Array.isArray(faqItems) ? faqItems : []).map((f: { question: string; answer: string }, i: number) => ({
            question: f.question, answer: f.answer, position: i,
          })),
        },
        itineraries: {
          create: (Array.isArray(itineraries) ? itineraries : []).map((it: { name: string; description: string }, i: number) => ({
            name: it.name, description: it.description, position: i,
          })),
        },
      },
      include: { faqItems: true, itineraries: true },
    })

    revalidatePath(destinationPublicPath(created))
    revalidatePath(normalizedKind === 'sale' ? '/yacht-sale' : '/yacht-charter')
    revalidatePath('/sitemap.xml')

    return Response.json(created, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return Response.json({ error: 'A destination with this kind/region/city already exists' }, { status: 409 })
    }
    console.error('Create destination error:', error)
    return Response.json({ error: 'Failed to create destination' }, { status: 500 })
  }
}

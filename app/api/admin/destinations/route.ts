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

function destinationPublicPath(d: { regionSlug: string; citySlug: string | null }) {
  return d.citySlug ? `/yacht-charter/${d.regionSlug}/${d.citySlug}` : `/yacht-charter/${d.regionSlug}`
}

// GET — every destination, for the admin list page. Lightweight (no
// faq/itineraries) — the edit page fetches the full row by id separately.
export async function GET() {
  try {
    await checkAuth()
    const destinations = await prisma.destination.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true, regionSlug: true, citySlug: true, name: true,
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
// existing region). `citySlug`/`city` empty = a region-only page.
export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const {
      regionSlug, citySlug, name, region, city,
      title, metaDescription, h1, heroImage, eyebrow,
      intro, relatedKeys, faqItems, itineraries,
    } = data

    if (!regionSlug || !name || !region || !title || !metaDescription || !h1 || !heroImage || !eyebrow) {
      return Response.json({ error: 'Region slug, name, region, and every SEO field are required' }, { status: 400 })
    }

    const normalizedCitySlug = citySlug ? String(citySlug).trim() || null : null

    // Postgres' unique index on (region_slug, city_slug) lets multiple
    // NULL city_slug rows through — enforce "one region-only page per
    // region" here instead.
    if (!normalizedCitySlug) {
      const existing = await prisma.destination.findFirst({ where: { regionSlug, citySlug: null } })
      if (existing) {
        return Response.json({ error: `A region-only page for "${regionSlug}" already exists` }, { status: 409 })
      }
    }

    const created = await prisma.destination.create({
      data: {
        regionSlug, citySlug: normalizedCitySlug, name, region, city: city || null,
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
    revalidatePath('/sitemap.xml')

    return Response.json(created, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return Response.json({ error: 'A destination with this region/city already exists' }, { status: 409 })
    }
    console.error('Create destination error:', error)
    return Response.json({ error: 'Failed to create destination' }, { status: 500 })
  }
}

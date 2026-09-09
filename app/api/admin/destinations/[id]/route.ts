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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    const destination = await prisma.destination.findUnique({
      where: { id: parseInt(id) },
      include: {
        faqItems: { orderBy: { position: 'asc' } },
        itineraries: { orderBy: { position: 'asc' } },
      },
    })
    if (!destination) return Response.json({ error: 'Destination not found' }, { status: 404 })
    return Response.json(destination)
  } catch (error) {
    console.error('Get destination error:', error)
    return Response.json({ error: 'Failed to fetch destination' }, { status: 500 })
  }
}

// PUT — full replace of a destination's content, including its FAQ and
// itinerary lists: the child rows are deleted and recreated from the
// submitted arrays rather than diffed, since the admin form always submits
// the complete list (add/remove/reorder all happen client-side first) —
// simpler and correct as long as this stays the only writer, which it is.
// Done as nested `deleteMany`+`create` writes inside one `update()` call
// (not a wrapping $transaction) — an interactive transaction against the
// remote Prisma Postgres connection was intermittently outliving its 5s
// timeout between statements; a single query's nested writes stay atomic
// without that separate timeout budget.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    const destinationId = parseInt(id)
    const data = await request.json()
    const {
      regionSlug, citySlug, name, region, city,
      title, metaDescription, h1, heroImage, eyebrow,
      intro, relatedKeys, faqItems, itineraries,
    } = data

    if (!regionSlug || !name || !region || !title || !metaDescription || !h1 || !heroImage || !eyebrow) {
      return Response.json({ error: 'Region slug, name, region, and every SEO field are required' }, { status: 400 })
    }

    const existing = await prisma.destination.findUnique({ where: { id: destinationId } })
    if (!existing) return Response.json({ error: 'Destination not found' }, { status: 404 })

    const normalizedCitySlug = citySlug ? String(citySlug).trim() || null : null

    if (!normalizedCitySlug) {
      const clash = await prisma.destination.findFirst({ where: { regionSlug, citySlug: null, id: { not: destinationId } } })
      if (clash) {
        return Response.json({ error: `A region-only page for "${regionSlug}" already exists` }, { status: 409 })
      }
    }

    const updated = await prisma.destination.update({
      where: { id: destinationId },
      data: {
        regionSlug, citySlug: normalizedCitySlug, name, region, city: city || null,
        title, metaDescription, h1, heroImage, eyebrow,
        intro: Array.isArray(intro) ? intro : [],
        relatedKeys: Array.isArray(relatedKeys) ? relatedKeys : [],
        faqItems: {
          deleteMany: {},
          create: (Array.isArray(faqItems) ? faqItems : []).map((f: { question: string; answer: string }, i: number) => ({
            question: f.question, answer: f.answer, position: i,
          })),
        },
        itineraries: {
          deleteMany: {},
          create: (Array.isArray(itineraries) ? itineraries : []).map((it: { name: string; description: string }, i: number) => ({
            name: it.name, description: it.description, position: i,
          })),
        },
      },
      include: { faqItems: true, itineraries: true },
    })

    // Revalidate both the old and new public URL — the slug fields are
    // editable, so a save can move a page to a different path.
    revalidatePath(destinationPublicPath(existing))
    revalidatePath(destinationPublicPath(updated))
    revalidatePath('/sitemap.xml')

    return Response.json(updated)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return Response.json({ error: 'A destination with this region/city already exists' }, { status: 409 })
    }
    console.error('Update destination error:', error)
    return Response.json({ error: 'Failed to update destination' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    const destinationId = parseInt(id)

    const existing = await prisma.destination.findUnique({ where: { id: destinationId } })
    if (!existing) return Response.json({ error: 'Destination not found' }, { status: 404 })

    await prisma.destination.delete({ where: { id: destinationId } })

    revalidatePath(destinationPublicPath(existing))
    revalidatePath('/sitemap.xml')

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete destination error:', error)
    return Response.json({ error: 'Failed to delete destination' }, { status: 500 })
  }
}

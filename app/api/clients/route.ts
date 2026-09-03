import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// GET clients
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const fullName = searchParams.get('fullName')
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const services = searchParams.getAll('services')
    const tag = searchParams.get('tag')
    const tags = searchParams.getAll('tags')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where: any = {}

    if (fullName) {
      where.fullName = { contains: fullName, mode: 'insensitive' }
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' }
    }
    if (phone) {
      where.phone = { contains: phone, mode: 'insensitive' }
    }
    if (services.length > 0) {
      where.services = { hasSome: services }
    }
    if (tags.length > 0) {
      // Exact match against picked hashtags (multi-select filter).
      where.tags = { hasSome: tags }
    } else if (tag) {
      // Free-text fallback — a partial, case-insensitive match on any tag,
      // since `hasSome` can't do substring matching inside a String[] column.
      const tagMatches = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM client
        WHERE EXISTS (SELECT 1 FROM unnest(tags) AS t WHERE t ILIKE ${'%' + tag + '%'})
      `
      where.id = { in: tagMatches.map((r) => r.id) }
    }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          services: true,
          tags: true,
          createdAt: true,
          _count: {
            select: { reservations: true }
          },
          // Powers the "products" chips in the admin list — what a client
          // actually booked (yacht/villa name + a thumbnail), so the list
          // is a visual reminder rather than just a reservation count.
          reservations: {
            select: {
              id: true,
              objectTitle: true,
              image: true,
              yacht: { select: { model: true, builder: true, media: { select: { url: true }, take: 1 } } },
              property: { select: { title: true } },
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.client.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return Response.json({
      clients,
      currentPage: page,
      totalPages,
      total
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return Response.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// POST create client
export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { fullName, email, phone, services, tags } = data

    if (!fullName) {
      return Response.json({ error: 'Full name is required' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        services: services || [],
        tags: tags || [],
      }
    })

    return Response.json(client, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return Response.json({ error: 'A client with this email already exists' }, { status: 409 })
    }
    console.error('Create client error:', error)
    return Response.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}

// PUT update client
export async function PUT(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { id, fullName, email, phone, services, tags } = data

    if (!id) {
      return Response.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { fullName, email, phone, services, tags, updatedAt: new Date() }
    })

    return Response.json(client)
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return Response.json({ error: 'A client with this email already exists' }, { status: 409 })
    }
    console.error('Update client error:', error)
    return Response.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

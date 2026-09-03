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
    const service = searchParams.get('service')
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
    if (service) {
      where.service = { equals: service, mode: 'insensitive' }
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
          service: true,
          createdAt: true,
          _count: {
            select: { reservations: true }
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

// PUT update client
export async function PUT(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { id, fullName, email, phone, service } = data

    if (!id) {
      return Response.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { fullName, email, phone, service }
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

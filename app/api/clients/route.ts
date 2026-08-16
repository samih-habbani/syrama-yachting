import { prisma } from '@/lib/prisma'

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

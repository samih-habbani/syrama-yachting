import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return parseInt(userId)
}

// GET all yachts for admin with pagination and filtering
export async function GET(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause with filters
    const where: any = {}

    if (searchParams.has('model')) {
      where.model = { contains: searchParams.get('model'), mode: 'insensitive' }
    }

    if (searchParams.has('minLength') || searchParams.has('maxLength')) {
      where.length = {}
      if (searchParams.has('minLength')) {
        where.length.gte = parseFloat(searchParams.get('minLength')!)
      }
      if (searchParams.has('maxLength')) {
        where.length.lte = parseFloat(searchParams.get('maxLength')!)
      }
    }

    if (searchParams.has('minGuests') || searchParams.has('maxGuests')) {
      where.maxGuests = {}
      if (searchParams.has('minGuests')) {
        where.maxGuests.gte = parseInt(searchParams.get('minGuests')!)
      }
      if (searchParams.has('maxGuests')) {
        where.maxGuests.lte = parseInt(searchParams.get('maxGuests')!)
      }
    }

    if (searchParams.has('region')) {
      where.region = { contains: searchParams.get('region'), mode: 'insensitive' }
    }

    if (searchParams.has('city')) {
      where.city = { contains: searchParams.get('city'), mode: 'insensitive' }
    }

    if (searchParams.has('status')) {
      const status = searchParams.get('status')
      if (status === 'charter') {
        where.status = { in: ['Location', 'location'] }
      } else if (status === 'sale') {
        where.status = { in: ['Vente', 'vente'] }
      } else {
        where.status = status
      }
    }

    const [yachts, total] = await Promise.all([
      prisma.yacht.findMany({
        where,
        select: {
          id: true,
          model: true,
          builder: true,
          length: true,
          maxGuests: true,
          cabins: true,
          year: true,
          priceDay: true,
          priceSale: true,
          region: true,
          city: true,
          currency: true,
          status: true,
          available: true,
          media: {
            select: { id: true, url: true, alt: true },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.yacht.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return Response.json({
      yachts,
      currentPage: page,
      totalPages,
      total
    })
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return Response.json(
      { error: 'Failed to fetch yachts' },
      { status: 500 }
    )
  }
}

// POST create yacht
export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()

    const yacht = await prisma.yacht.create({
      data: {
        model: data.model,
        builder: data.builder || null,
        length: parseFloat(data.length),
        cabins: parseInt(data.cabins),
        available: data.available !== false,
        status: data.status || 'charter',
        maxGuests: data.maxGuests ? parseInt(data.maxGuests) : null,
        year: data.year ? parseInt(data.year) : null,
        priceDay: data.priceDay ? parseFloat(data.priceDay) : null,
        priceSale: data.priceSale ? parseFloat(data.priceSale) : null,
        region: data.region || null,
        city: data.city || null,
        currency: data.currency || 'EUR',
        lengthUnit: data.lengthUnit || 'm'
      }
    })

    return Response.json(yacht, { status: 201 })
  } catch (error) {
    console.error('Create yacht error:', error)
    return Response.json(
      { error: 'Failed to create yacht' },
      { status: 500 }
    )
  }
}

// PUT update yacht
export async function PUT(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { id } = data

    if (!id) {
      return Response.json(
        { error: 'Yacht ID is required' },
        { status: 400 }
      )
    }

    const yacht = await prisma.yacht.update({
      where: { id: parseInt(id) },
      data: {
        model: data.model,
        builder: data.builder || null,
        length: data.length ? parseFloat(data.length) : undefined,
        cabins: data.cabins ? parseInt(data.cabins) : undefined,
        available: data.available !== undefined ? data.available : undefined,
        status: data.status,
        maxGuests: data.maxGuests ? parseInt(data.maxGuests) : null,
        year: data.year ? parseInt(data.year) : null,
        priceDay: data.priceDay ? parseFloat(data.priceDay) : null,
        priceSale: data.priceSale ? parseFloat(data.priceSale) : null,
        region: data.region || null,
        city: data.city || null
      },
      include: { media: true }
    })

    return Response.json(yacht)
  } catch (error) {
    console.error('Update yacht error:', error)
    return Response.json(
      { error: 'Failed to update yacht' },
      { status: 500 }
    )
  }
}

// DELETE yacht
export async function DELETE(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json(
        { error: 'Yacht ID is required' },
        { status: 400 }
      )
    }

    await prisma.media.deleteMany({
      where: { yachtId: parseInt(id) }
    })

    await prisma.yacht.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete yacht error:', error)
    return Response.json(
      { error: 'Failed to delete yacht' },
      { status: 500 }
    )
  }
}

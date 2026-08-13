import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const region = url.searchParams.get('region')
    const builder = url.searchParams.get('builder')
    const minLength = url.searchParams.get('minLength')
    const maxLength = url.searchParams.get('maxLength')
    const minGuests = url.searchParams.get('minGuests')
    const maxGuests = url.searchParams.get('maxGuests')
    const type = url.searchParams.get('type') || 'charter'

    const where: any = {}

    // Déterminer le type basé sur le statut
    if (type === 'charter') {
      where.status = { in: ['Location', 'location'] }
    } else if (type === 'sale') {
      where.status = { in: ['Vente', 'vente'] }
    }

    if (region) {
      where.region = { contains: region, mode: 'insensitive' }
    }

    if (builder) {
      where.builder = { contains: builder, mode: 'insensitive' }
    }

    if (minLength) {
      where.length = { ...(where.length || {}), gte: parseFloat(minLength) }
    }

    if (maxLength) {
      where.length = { ...(where.length || {}), lte: parseFloat(maxLength) }
    }

    if (minGuests) {
      where.maxGuests = { ...(where.maxGuests || {}), gte: parseInt(minGuests) }
    }

    if (maxGuests) {
      where.maxGuests = { ...(where.maxGuests || {}), lte: parseInt(maxGuests) }
    }

    const yachts = await prisma.yacht.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        media: {
          take: 1,
          orderBy: { id: 'asc' }
        }
      }
    })

    return Response.json(yachts)
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return Response.json({ error: 'Failed to fetch yachts' }, { status: 500 })
  }
}

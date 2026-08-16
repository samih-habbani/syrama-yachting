import { prisma } from '@/lib/prisma'

// POST create reservation
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { clientId, fullName, email, phone, yachtId, date, numberOfPeople, location, price } = data

    if (!yachtId || !date || !numberOfPeople) {
      return Response.json(
        { error: 'Yacht, date and number of people are required' },
        { status: 400 }
      )
    }

    // Check if creating new client or using existing
    const isNewClient = clientId === undefined
    if (isNewClient && (!fullName || !email || !phone)) {
      return Response.json(
        { error: 'Client name, email and phone are required' },
        { status: 400 }
      )
    }
    if (!isNewClient && !clientId) {
      return Response.json(
        { error: 'Please select a client' },
        { status: 400 }
      )
    }

    // Get yacht region
    const yacht = await prisma.yacht.findUnique({
      where: { id: parseInt(yachtId) },
      select: { region: true, model: true }
    })

    if (!yacht) {
      return Response.json(
        { error: 'Yacht not found' },
        { status: 404 }
      )
    }

    // Get or create client
    let clientIdToUse: number
    if (isNewClient) {
      const newClient = await prisma.client.create({
        data: {
          fullName,
          email,
          phone
        }
      })
      clientIdToUse = newClient.id
    } else {
      clientIdToUse = clientId
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        clientId: clientIdToUse,
        yachtId: parseInt(yachtId),
        date: new Date(date),
        numberOfPeople: parseInt(numberOfPeople),
        location: location || 'Not specified',
        region: yacht.region || 'Unknown',
        price: price ? parseFloat(price) : null
      },
      include: {
        client: true,
        yacht: { select: { id: true, model: true } }
      }
    })

    return Response.json(reservation, { status: 201 })
  } catch (error) {
    console.error('Create reservation error:', error)
    return Response.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}

// GET reservations (for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const resId = searchParams.get('id')
    const clientName = searchParams.get('clientName')
    const yachtModel = searchParams.get('yachtModel')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where: any = {}

    if (resId) {
      where.id = parseInt(resId)
    }
    if (clientName) {
      where.client = {
        fullName: { contains: clientName, mode: 'insensitive' }
      }
    }
    if (yachtModel) {
      where.yacht = {
        model: { contains: yachtModel, mode: 'insensitive' }
      }
    }
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        where.date.lte = end
      }
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        select: {
          id: true,
          date: true,
          numberOfPeople: true,
          location: true,
          price: true,
          status: true,
          createdAt: true,
          client: { select: { fullName: true, email: true, phone: true } },
          yacht: { select: { model: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.reservation.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return Response.json({
      reservations,
      currentPage: page,
      totalPages,
      total
    })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return Response.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

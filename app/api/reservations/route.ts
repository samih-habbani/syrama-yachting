import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

async function isAdmin() {
  const cookieStore = await cookies()
  return !!cookieStore.get('userId')?.value
}

// POST create reservation
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { clientId, fullName, email, phone, yachtId, propertyId, objectTitle, date, numberOfPeople, location, price } = data

    // Admin "quick add" path — used from the Clients admin page to tag a
    // product (yacht or villa) a client has booked, as a visual reminder.
    // Deliberately lighter than the public booking flow below: only the
    // client and one product reference are required, everything else is
    // optional and filled in later from the Reservations page if needed.
    if (await isAdmin() && clientId && (yachtId || propertyId || objectTitle)) {
      const yacht = yachtId
        ? await prisma.yacht.findUnique({ where: { id: parseInt(yachtId) }, select: { region: true } })
        : null
      const property = propertyId
        ? await prisma.property.findUnique({ where: { id: parseInt(propertyId) }, select: { region: true } })
        : null

      const reservation = await prisma.reservation.create({
        data: {
          clientId: parseInt(clientId),
          yachtId: yachtId ? parseInt(yachtId) : null,
          propertyId: propertyId ? parseInt(propertyId) : null,
          objectTitle: objectTitle || null,
          date: date ? new Date(date) : null,
          location: location || null,
          region: yacht?.region || property?.region || null,
          price: price ? parseFloat(price) : null,
          status: 'confirmed',
        },
        include: {
          client: { select: { fullName: true } },
          yacht: { select: { model: true, builder: true, media: { select: { url: true }, take: 1 } } },
          property: { select: { title: true } },
        }
      })

      return Response.json(reservation, { status: 201 })
    }

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

// PUT update reservation
export async function PUT(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { id, date, numberOfPeople, location, price, status } = data

    if (!id) {
      return Response.json({ error: 'Reservation ID is required' }, { status: 400 })
    }

    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        ...(date && { date: new Date(date) }),
        ...(numberOfPeople && { numberOfPeople: parseInt(numberOfPeople) }),
        ...(location !== undefined && { location }),
        ...(price !== undefined && { price: price === '' || price === null ? null : parseFloat(price) }),
        ...(status && { status })
      },
      include: {
        client: { select: { fullName: true, email: true, phone: true } },
        yacht: { select: { model: true } }
      }
    })

    return Response.json(reservation)
  } catch (error) {
    console.error('Update reservation error:', error)
    return Response.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

// DELETE a reservation — e.g. undoing a product mistakenly added from the
// Clients admin page.
export async function DELETE(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Reservation ID is required' }, { status: 400 })
    }

    await prisma.reservation.delete({ where: { id: parseInt(id) } })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete reservation error:', error)
    return Response.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    )
  }
}

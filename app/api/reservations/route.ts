import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email'

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

    // Get or create client — `email` is unique, so a returning guest (or
    // anyone already in the CRM, e.g. from the legacy import) submitting
    // this public form again must reuse their existing row rather than
    // hit a P2002 and silently fail the whole booking.
    let clientIdToUse: number
    if (isNewClient) {
      const existingClient = await prisma.client.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      })

      if (existingClient) {
        clientIdToUse = existingClient.id
        // Backfill anything the existing record was missing, without
        // clobbering data already curated in the admin.
        const updates: { fullName?: string; phone?: string } = {}
        if (!existingClient.fullName && fullName) updates.fullName = fullName
        if (!existingClient.phone && phone) updates.phone = phone
        if (Object.keys(updates).length > 0) {
          await prisma.client.update({ where: { id: existingClient.id }, data: updates })
        }
      } else {
        const newClient = await prisma.client.create({
          data: {
            fullName,
            email,
            phone
          }
        })
        clientIdToUse = newClient.id
      }
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

    // Notify the team by email — same fire-and-forget pattern as the
    // contact form, so a slow/failed email never holds up or breaks the
    // booking itself.
    const emailPromise = sendEmail(
      'contact@syrama-services.com',
      `New Charter Request: ${reservation.yacht?.model || 'Yacht'}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b8974a;">New Charter Request</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Yacht:</strong> ${reservation.yacht?.model || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(reservation.date!).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${reservation.numberOfPeople}</p>
            <p><strong>Location:</strong> ${reservation.location}</p>
            ${reservation.price ? `<p><strong>Price:</strong> ${reservation.price}</p>` : ''}
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #b8974a; margin: 20px 0;">
            <p><strong>Client:</strong> ${reservation.client.fullName}</p>
            <p><strong>Email:</strong> ${reservation.client.email}</p>
            ${reservation.client.phone ? `<p><strong>Phone:</strong> ${reservation.client.phone}</p>` : ''}
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This request was sent from the charter request form on the website.
          </p>
        </div>
      `
    )

    emailPromise
      .then(() => {
        console.log('[API] Email sent successfully for reservation ID:', reservation.id)
      })
      .catch((err) => {
        console.error('[API] Email sending failed for reservation ID:', reservation.id, err)
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
          endDate: true,
          numberOfPeople: true,
          location: true,
          price: true,
          status: true,
          createdAt: true,
          startTime: true,
          endTime: true,
          plannedItinerary: true,
          deposit: true,
          paymentDeadline: true,
          client: { select: { fullName: true, email: true, phone: true } },
          yacht: { select: { id: true, model: true, builder: true, providerId: true } },
          contract: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.reservation.count({ where })
    ])

    // BookingLink.reservationId is a loose reference (no formal relation),
    // so a still-pending link generated for one of these reservations is
    // fetched separately — lets the admin UI offer "Get Link" (share the
    // existing one) instead of "Generate Booking Link" (make a new one).
    const reservationIds = reservations.map((r) => r.id)
    const pendingLinks = reservationIds.length > 0
      ? await prisma.bookingLink.findMany({
          where: { reservationId: { in: reservationIds }, status: 'pending' },
          select: { token: true, reservationId: true },
          orderBy: { createdAt: 'desc' },
        })
      : []
    const tokenByReservationId = new Map(pendingLinks.map((l) => [l.reservationId, l.token]))

    // Same loose-reference pattern for invoices — lets the admin UI offer
    // "Download Invoice" once one already exists for a reservation instead
    // of "Generate Invoice" again. Split by category since a reservation
    // can carry both a client-facing service invoice and a separate
    // provider commission invoice.
    const invoices = reservationIds.length > 0
      ? await prisma.invoice.findMany({
          where: { reservationId: { in: reservationIds } },
          select: { id: true, reservationId: true, category: true },
          orderBy: { createdAt: 'desc' },
        })
      : []
    const invoiceIdByReservationId = new Map(
      invoices.filter((inv) => inv.category === 'service').map((inv) => [inv.reservationId, inv.id])
    )
    const commissionInvoiceIdByReservationId = new Map(
      invoices.filter((inv) => inv.category === 'commission').map((inv) => [inv.reservationId, inv.id])
    )

    const reservationsWithLink = reservations.map((r) => ({
      ...r,
      bookingLinkToken: tokenByReservationId.get(r.id) || null,
      commissionInvoiceId: commissionInvoiceIdByReservationId.get(r.id) || null,
      invoiceId: invoiceIdByReservationId.get(r.id) || null,
    }))

    const totalPages = Math.ceil(total / limit)

    return Response.json({
      reservations: reservationsWithLink,
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
    const { id, date, numberOfPeople, location, price, status, startTime, endTime, plannedItinerary, deposit, paymentDeadline } = data

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
        ...(status && { status }),
        ...(startTime !== undefined && { startTime: startTime || null }),
        ...(endTime !== undefined && { endTime: endTime || null }),
        ...(plannedItinerary !== undefined && { plannedItinerary: plannedItinerary || null }),
        ...(deposit !== undefined && { deposit: deposit === '' || deposit === null ? null : parseFloat(deposit) }),
        ...(paymentDeadline !== undefined && { paymentDeadline: paymentDeadline ? new Date(paymentDeadline) : null }),
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

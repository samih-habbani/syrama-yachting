import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { findConflictingReservations, combineDateTime } from '@/lib/booking-availability'
import { createContractForReservation, contractToPdfData } from '@/lib/contract'
import { generateContractPdf } from '@/lib/contract-pdf'

// The imported provider dataset used dash-only strings ('-', '--', ...) as
// a "no value" placeholder — same convention used across the admin.
const isPlaceholder = (v: string) => /^-+$/.test(v.trim())
const realStr = (v?: string | null) => (v && !isPlaceholder(v) ? v : null)

// POST — a client fills in their details on the public /book/[token] page.
// Creates (or reuses, matching the public charter-request flow) the client,
// creates the reservation with the date/time already fixed by the link, and
// marks the link completed so it can't be used to create a second booking.
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const data = await request.json()
    const { firstName, lastName, email, phone, country } = data

    if (!firstName || !lastName || !email || !phone || !country) {
      return Response.json({ error: 'First name, last name, email, phone and country are required' }, { status: 400 })
    }

    const link = await prisma.bookingLink.findUnique({
      where: { token },
      include: {
        yacht: {
          select: {
            id: true, model: true, builder: true, region: true,
            provider: { select: { name: true, firstName: true, company: true } },
          },
        },
      },
    })

    if (!link) {
      return Response.json({ error: 'Booking link not found' }, { status: 404 })
    }
    if (link.status === 'completed') {
      return Response.json({ error: 'This booking link has already been used' }, { status: 409 })
    }

    // A link generated "from" an existing reservation (one without a
    // contract yet) carries `reservationId` from the moment it's created,
    // not just once completed — submitting it should attach the contract
    // to that same reservation instead of creating a new one.
    const existingReservation = link.reservationId
      ? await prisma.reservation.findUnique({ where: { id: link.reservationId }, select: { id: true, contract: { select: { id: true } } } })
      : null
    if (existingReservation?.contract) {
      return Response.json({ error: 'This reservation already has a contract' }, { status: 409 })
    }

    // Multi-day link: `endDate` holds the last day, and `endTime` (if set)
    // applies to that day. Single-day link: fall back to `date` itself.
    const lastDay = link.endDate || link.date
    const reservationStart = combineDateTime(link.date, link.startTime)
    const reservationEnd = link.endTime ? combineDateTime(lastDay, link.endTime) : (link.endDate || reservationStart)

    // Someone may have completed a different link (or been booked
    // manually) for the same yacht and an overlapping slot since this
    // link was generated — block rather than silently double-book.
    // A link sourced from an existing reservation naturally overlaps
    // itself, so exclude it from the check.
    const conflicts = await findConflictingReservations(
      link.yachtId,
      { start: reservationStart, end: reservationEnd },
      existingReservation?.id
    )
    if (conflicts.length > 0) {
      return Response.json({ error: 'This time slot is no longer available for this yacht. Please contact us for alternative options.' }, { status: 409 })
    }

    const fullName = `${firstName} ${lastName}`.trim()

    // Get or create client — same email-dedup logic as the public charter
    // request form, so a returning client reuses their existing record.
    let clientIdToUse: number
    const existingClient = await prisma.client.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    })

    if (existingClient) {
      clientIdToUse = existingClient.id
      const updates: { fullName?: string; phone?: string; country?: string } = {}
      if (!existingClient.fullName && fullName) updates.fullName = fullName
      if (!existingClient.phone && phone) updates.phone = phone
      if (!existingClient.country && country) updates.country = country
      if (Object.keys(updates).length > 0) {
        await prisma.client.update({ where: { id: existingClient.id }, data: updates })
      }
    } else {
      const newClient = await prisma.client.create({
        data: { fullName, email, phone, country },
      })
      clientIdToUse = newClient.id
    }

    const reservationData = {
      clientId: clientIdToUse,
      yachtId: link.yachtId,
      // Calendar days only — embarkation/disembarkation time of day lives
      // in `startTime`/`endTime`, same convention as BookingLink itself.
      date: link.date,
      endDate: link.endDate,
      startTime: link.startTime,
      endTime: link.endTime,
      region: link.yacht.region || null,
      firstName,
      lastName,
      email,
      phone,
    }

    const reservation = existingReservation
      ? await prisma.reservation.update({
          where: { id: existingReservation.id },
          data: reservationData,
          include: { client: true, yacht: { select: { id: true, model: true } } },
        })
      : await prisma.reservation.create({
          data: reservationData,
          include: { client: true, yacht: { select: { id: true, model: true } } },
        })

    await prisma.bookingLink.update({
      where: { token },
      data: { status: 'completed', reservationId: reservation.id },
    })

    const yachtLabel = link.yacht.builder && !link.yacht.model.toLowerCase().startsWith(link.yacht.builder.toLowerCase().split(' ')[0])
      ? `${link.yacht.builder} ${link.yacht.model}`
      : link.yacht.model
    // The Yacht Operator's legal name on the contract is the company, not
    // the provider contact's personal name — only fall back to a person's
    // name if no company is on file.
    const yachtOperatorLabel = realStr(link.yacht.provider?.company)
      || [realStr(link.yacht.provider?.firstName), realStr(link.yacht.provider?.name)].filter(Boolean).join(' ')
      || null

    // The SYRAMA Private Yacht Experience Agreement — generated once, right
    // after the reservation, so it can be shown for download immediately,
    // emailed to the client, and re-downloaded later (by the client if the
    // same link is reopened, or by the team from the admin).
    const contract = await createContractForReservation({
      reservationId: reservation.id,
      clientFullName: fullName,
      clientEmail: email,
      clientPhone: phone,
      clientCountry: country,
      yachtModel: yachtLabel,
      yachtOperator: yachtOperatorLabel,
      experienceDate: link.date,
      experienceEndDate: link.endDate,
      startTime: link.startTime,
      endTime: link.endTime,
      numberOfGuests: reservation.numberOfPeople,
      plannedItinerary: reservation.plannedItinerary,
      deposit: reservation.deposit,
      paymentDeadline: reservation.paymentDeadline,
      totalPrice: reservation.price,
      reservationCreatedAt: reservation.createdAt,
    })
    const pdfBuffer = await generateContractPdf(contractToPdfData(contract))

    const adminEmailPromise = sendEmail(
      'contact@syrama-services.com',
      `New Booking Link Reservation: ${reservation.yacht?.model || 'Yacht'}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b8974a;">New Reservation via Booking Link</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Yacht:</strong> ${reservation.yacht?.model || 'N/A'}</p>
            <p><strong>Date:</strong> ${link.date.toLocaleDateString()}${link.endDate ? ` – ${link.endDate.toLocaleDateString()}` : ''}</p>
            <p><strong>Time:</strong> ${link.startTime}${link.endTime ? ` – ${link.endTime}` : ''}</p>
            <p><strong>Contract:</strong> ${contract.bookingReference}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #b8974a; margin: 20px 0;">
            <p><strong>Client:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Country of residence:</strong> ${country}</p>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This reservation was submitted via a booking link. The signed-ready agreement is attached.
          </p>
        </div>
      `,
      [{ filename: `${contract.bookingReference}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    )

    const clientEmailPromise = sendEmail(
      email,
      `Your Syrama Yachting Agreement — ${contract.bookingReference}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b8974a;">Thank you, ${firstName}</h2>
          <p>Your charter request has been received. Please find your Private Yacht Experience Agreement attached — our team will be in touch shortly to confirm the remaining details and payment.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Yacht:</strong> ${reservation.yacht?.model || 'N/A'}</p>
            <p><strong>Date:</strong> ${link.date.toLocaleDateString()}${link.endDate ? ` – ${link.endDate.toLocaleDateString()}` : ''}</p>
            <p><strong>Time:</strong> ${link.startTime}${link.endTime ? ` – ${link.endTime}` : ''}</p>
            <p><strong>Booking Reference:</strong> ${contract.bookingReference}</p>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Syrama Concierge Services - FZCO | Trade Licence No. 74796 | Dubai, UAE
          </p>
        </div>
      `,
      [{ filename: `${contract.bookingReference}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    )

    Promise.all([adminEmailPromise, clientEmailPromise])
      .then(() => console.log('[API] Emails sent successfully for booking link reservation ID:', reservation.id))
      .catch((err) => console.error('[API] Email sending failed for booking link reservation ID:', reservation.id, err))

    return Response.json({ success: true, bookingReference: contract.bookingReference }, { status: 201 })
  } catch (error) {
    console.error('Booking link reserve error:', error)
    return Response.json({ error: 'Failed to create reservation' }, { status: 500 })
  }
}

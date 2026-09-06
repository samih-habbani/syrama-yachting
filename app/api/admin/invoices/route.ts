import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createInvoice } from '@/lib/invoice'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// GET — two modes:
//   - `reservationId` given: every invoice for that one reservation, so the
//     admin UI can show "Download Invoice" instead of "Generate Invoice"
//     once one already exists.
//   - otherwise: the paginated, filterable admin Invoices page — plus its
//     headline stats, always scoped to the current calendar year regardless
//     of the table's own filters.
export async function GET(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('reservationId')

    if (reservationId) {
      const invoices = await prisma.invoice.findMany({
        where: { reservationId: parseInt(reservationId) },
        orderBy: { createdAt: 'desc' },
      })
      return Response.json({ invoices })
    }

    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: { status?: string; category?: string } = {}
    if (status) where.status = status
    if (category) where.category = category

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.invoice.count({ where }),
    ])

    // reservationId/customerId/providerId are all loose references (no
    // formal relation) — batch-fetch the yacht, client and provider for
    // every row up front, same pattern used elsewhere in the admin. Shown
    // independently of category, so the table always reads "yacht,
    // client, provider" regardless of which party the invoice was billed to.
    const reservationIds = [...new Set(invoices.map((i) => i.reservationId).filter((id): id is number => id != null))]
    const customerIds = [...new Set(invoices.map((i) => i.customerId).filter((id): id is number => id != null))]

    const reservations = reservationIds.length > 0
      ? await prisma.reservation.findMany({
          where: { id: { in: reservationIds } },
          select: {
            id: true, firstName: true, lastName: true, objectTitle: true,
            // Loose reference (no formal relation) — batched below
            // alongside the invoice's own providerId, as a fallback for
            // legacy commission invoices that never had one set directly.
            providerId: true,
            client: { select: { fullName: true } },
            yacht: { select: { model: true, builder: true } },
            property: { select: { title: true } },
          },
        })
      : []
    const reservationById = new Map(reservations.map((r) => [r.id, r]))

    const providerIds = [...new Set([
      ...invoices.map((i) => i.providerId),
      ...reservations.map((r) => r.providerId),
    ].filter((id): id is number => id != null))]

    const [customers, providers] = await Promise.all([
      customerIds.length > 0
        ? prisma.client.findMany({ where: { id: { in: customerIds } }, select: { id: true, fullName: true } })
        : [],
      providerIds.length > 0
        ? prisma.provider.findMany({ where: { id: { in: providerIds } }, select: { id: true, company: true, name: true } })
        : [],
    ])
    const customerById = new Map(customers.map((c) => [c.id, c]))
    const providerById = new Map(providers.map((p) => [p.id, p]))

    const invoicesWithParties = invoices.map((inv) => {
      const reservation = inv.reservationId ? reservationById.get(inv.reservationId) : null
      const customer = inv.customerId ? customerById.get(inv.customerId) : null
      const provider = providerById.get(inv.providerId ?? reservation?.providerId ?? -1)

      const yachtLabel = reservation?.yacht
        ? [reservation.yacht.builder, reservation.yacht.model].filter(Boolean).join(' ')
        : reservation?.property?.title || reservation?.objectTitle || null

      const clientName = customer?.fullName
        || (reservation ? [reservation.firstName, reservation.lastName].filter(Boolean).join(' ') || reservation.client?.fullName : null)
        || null

      const providerName = provider?.company || provider?.name || null

      return { ...inv, yachtLabel, clientName, providerName }
    })

    // Headline stats — always "this year", so switching the table's status
    // or category filter never moves these numbers around.
    const now = new Date()
    const yearWhere = {
      createdAt: { gte: new Date(Date.UTC(now.getFullYear(), 0, 1)), lt: new Date(Date.UTC(now.getFullYear() + 1, 0, 1)) },
    }
    const [yearCount, yachtSalesAgg, commissionAgg] = await Promise.all([
      prisma.invoice.count({ where: yearWhere }),
      // "Yachts sold" — the underlying charter/sale value behind every
      // yacht invoice, service or commission alike, EUR-denominated only
      // (no exchange rate source for AED etc.).
      prisma.invoice.aggregate({ where: { ...yearWhere, type: 'yacht', currency: 'EUR' }, _sum: { priceTotal: true } }),
      prisma.invoice.aggregate({ where: { ...yearWhere, category: 'commission', currency: 'EUR' }, _sum: { commissionAmount: true } }),
    ])

    return Response.json({
      invoices: invoicesWithParties,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      stats: {
        totalCount: yearCount,
        totalYachtSalesEur: yachtSalesAgg._sum.priceTotal || 0,
        totalCommissionEur: commissionAgg._sum.commissionAmount || 0,
      },
    })
  } catch (error) {
    console.error('List invoices error:', error)
    return Response.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST — create an invoice for a reservation. Two flows, chosen by
// `category`:
//   - "service" (default): a client-facing invoice, for a reservation
//     SYRAMA contracted with the client directly (usually one that
//     already has a signed contract).
//   - "commission": a referral-fee invoice billed to the Provider instead,
//     for a booking where SYRAMA acted as broker/apporteur d'affaires
//     rather than the direct contracting party.
export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const {
      reservationId, category, customerId, providerId, serviceTitle, serviceCity,
      startDate, endDate, priceTotal, commissionRate, commissionAmount,
      currency, status, notes, applyVat, vatRate,
    } = data

    if (!reservationId || !currency) {
      return Response.json({ error: 'Reservation and currency are required' }, { status: 400 })
    }

    const isCommission = category === 'commission'
    if (isCommission && !providerId) {
      return Response.json({ error: 'Provider is required for a commission invoice' }, { status: 400 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(reservationId) },
      select: { id: true, clientId: true, yachtId: true },
    })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    const invoice = await createInvoice({
      reservationId: reservation.id,
      providerId: isCommission ? parseInt(providerId) : null,
      customerId: isCommission ? null : (customerId ? parseInt(customerId) : reservation.clientId),
      type: reservation.yachtId ? 'yacht' : 'other',
      category: isCommission ? 'commission' : 'service',
      serviceTitle: !isCommission ? serviceTitle || null : null,
      serviceCity: !isCommission ? serviceCity || null : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      priceTotal: priceTotal !== undefined && priceTotal !== '' ? parseFloat(priceTotal) : null,
      commissionRate: isCommission && commissionRate !== undefined && commissionRate !== '' ? parseFloat(commissionRate) : null,
      commissionAmount: isCommission && commissionAmount !== undefined && commissionAmount !== '' ? parseFloat(commissionAmount) : null,
      currency,
      status: status || 'draft',
      notes: notes || null,
      applyVat: !!applyVat,
      vatRate: applyVat ? parseFloat(vatRate) || 0 : 0,
    })

    return Response.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    return Response.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

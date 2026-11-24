import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createQuote } from '@/lib/quote'
import { parseLineItems, itemsSubtotal } from '@/lib/line-items'

async function checkAuth() {
  const cookieStore = await cookies()
  if (!cookieStore.get('userId')?.value) throw new Error('Unauthorized')
}

// GET ?reservationId=… — the quotes of one reservation (newest first), so
// the admin can offer "Download Quote" and prefill an invoice from it.
export async function GET(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('reservationId')
    if (reservationId) {
      const quotes = await prisma.quote.findMany({
        where: { reservationId: parseInt(reservationId) },
        orderBy: { createdAt: 'desc' },
      })
      return Response.json({ quotes })
    }

    // Paginated admin list, with the client + yacht of each quote's
    // reservation (loose reference → batch-fetched, same pattern as the
    // invoices list).
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.quote.count(),
    ])
    const ids = [...new Set(quotes.map((q) => q.reservationId))]
    const reservations = ids.length
      ? await prisma.reservation.findMany({
          where: { id: { in: ids } },
          select: { id: true, firstName: true, lastName: true, date: true, client: { select: { fullName: true } }, yacht: { select: { model: true, builder: true } } },
        })
      : []
    const byId = new Map(reservations.map((r) => [r.id, r]))
    const rows = quotes.map((q) => {
      const r = byId.get(q.reservationId)
      const items = parseLineItems(q.items)
      const subtotal = itemsSubtotal(items)
      return {
        ...q,
        total: subtotal + (q.applyVat ? subtotal * (q.vatRate / 100) : 0),
        clientName: r?.client?.fullName || [r?.firstName, r?.lastName].filter(Boolean).join(' ') || null,
        yachtLabel: r?.yacht ? [r.yacht.builder, r.yacht.model].filter(Boolean).join(' ') : null,
        reservationDate: r?.date || null,
      }
    })
    return Response.json({ quotes: rows, currentPage: page, totalPages: Math.ceil(total / limit), total })
  } catch (error) {
    console.error('List quotes error:', error)
    return Response.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await checkAuth()
    const { reservationId, currency, items: rawItems, applyVat, vatRate, validUntil, status, notes } = await request.json()
    const items = parseLineItems(rawItems)
    if (!reservationId || !currency) return Response.json({ error: 'Reservation and currency are required' }, { status: 400 })
    if (items.length === 0) return Response.json({ error: 'Add at least one line item' }, { status: 400 })

    const reservation = await prisma.reservation.findUnique({ where: { id: parseInt(reservationId) }, select: { id: true } })
    if (!reservation) return Response.json({ error: 'Reservation not found' }, { status: 404 })

    const quote = await createQuote({
      reservationId: reservation.id,
      currency,
      items,
      applyVat: !!applyVat,
      vatRate: applyVat ? parseFloat(vatRate) || 0 : 0,
      validUntil: validUntil ? new Date(validUntil) : null,
      status: status || 'draft',
      notes: notes || null,
    })
    return Response.json(quote, { status: 201 })
  } catch (error) {
    console.error('Create quote error:', error)
    return Response.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}

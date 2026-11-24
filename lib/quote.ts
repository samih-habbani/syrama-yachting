import { prisma } from '@/lib/prisma'
import type { Quote } from '@prisma/client'
import type { QuotePdfData } from '@/lib/quote-pdf'
import { parseLineItems, itemsSubtotal, lineTotal, formatMoney, formatDMY } from '@/lib/line-items'

export async function createQuote(params: {
  reservationId: number
  currency: string
  items: object
  applyVat: boolean
  vatRate: number
  validUntil: Date | null
  status: string
  notes: string | null
}): Promise<Quote> {
  // "QUO-26<id>" — same scheme as invoices; needs the row id, so insert
  // with a throwaway unique number then fix it up.
  const created = await prisma.quote.create({
    data: { ...params, quoteNumber: `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
  })
  return prisma.quote.update({ where: { id: created.id }, data: { quoteNumber: `QUO-26${created.id}` } })
}

const isPlaceholder = (v: string) => /^-+$/.test(v.trim())
const realStr = (v?: string | null) => (v && !isPlaceholder(v) ? v : null)

export async function quoteToPdfData(quote: Quote): Promise<QuotePdfData> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: quote.reservationId },
    select: {
      firstName: true, lastName: true, email: true, phone: true, date: true, endDate: true, startTime: true, endTime: true, departurePort: true, location: true, objectTitle: true,
      client: { select: { fullName: true, email: true, phone: true, address: true, city: true, country: true } },
      yacht: { select: { model: true, builder: true } },
    },
  })
  const client = reservation?.client
  const items = parseLineItems(quote.items)
  const subtotal = itemsSubtotal(items)
  const vat = quote.applyVat ? subtotal * (quote.vatRate / 100) : 0

  const lines: string[] = []
  if (realStr(client?.address)) lines.push(client!.address!)
  const cityCountry = [realStr(client?.city), realStr(client?.country)].filter(Boolean).join(', ')
  if (cityCountry) lines.push(cityCountry)
  const phone = client?.phone || reservation?.phone
  if (phone) lines.push(phone)
  const email = client?.email || reservation?.email
  if (email) lines.push(email)

  return {
    quoteNumber: quote.quoteNumber,
    date: formatDMY(quote.createdAt) || '',
    validUntil: formatDMY(quote.validUntil),
    startDate: formatDMY(reservation?.date),
    endDate: formatDMY(reservation?.endDate || reservation?.date),
    serviceName: reservation?.yacht ? [reservation.yacht.builder, reservation.yacht.model].filter(Boolean).join(' ') : reservation?.objectTitle || 'Service',
    billToName: client?.fullName || [reservation?.firstName, reservation?.lastName].filter(Boolean).join(' ') || null,
    billToLines: lines,
    items: items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: formatMoney(i.unitPrice) || '', total: formatMoney(lineTotal(i)) || '' })),
    applyVat: quote.applyVat,
    vatRate: quote.vatRate,
    subtotal: formatMoney(subtotal) || '0,00',
    vatAmount: quote.applyVat ? formatMoney(vat) : null,
    totalDue: formatMoney(subtotal + vat) || '0,00',
    currency: quote.currency,
    notes: quote.notes,
    trip: { startTime: reservation?.startTime ?? null, endTime: reservation?.endTime ?? null, departurePort: reservation?.departurePort ?? null, city: reservation?.location ?? null },
  }
}

import { prisma } from '@/lib/prisma'
import type { Invoice } from '@prisma/client'
import type { InvoicePdfData } from '@/lib/invoice-pdf'

// The imported provider dataset used dash-only strings ('-', '--', ...) as
// a "no value" placeholder — same convention used across the admin.
const isPlaceholder = (v: string) => /^-+$/.test(v.trim())
const realStr = (v?: string | null) => (v && !isPlaceholder(v) ? v : null)

export async function createInvoice(params: {
  reservationId: number | null
  providerId: number | null
  customerId: number | null
  type: string
  category: string
  serviceTitle: string | null
  serviceCity: string | null
  startDate: Date | null
  endDate: Date | null
  priceTotal: number | null
  commissionRate: number | null
  commissionAmount: number | null
  currency: string
  status: string
  notes: string | null
  applyVat: boolean
  vatRate: number
}): Promise<Invoice> {
  // The invoice number continues the legacy "INV-26<id>" scheme (year
  // prefix + the row's own id), so it can only be known once the row
  // exists — create with a throwaway unique placeholder, then fix it up.
  const created = await prisma.invoice.create({
    data: { ...params, invoiceNumber: `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
  })
  return prisma.invoice.update({
    where: { id: created.id },
    data: { invoiceNumber: `INV-26${created.id}` },
  })
}

const DATE_OPTIONS_LONG: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }

function formatDMY(d: Date | null | undefined) {
  if (!d) return null
  return d.toLocaleDateString('en-GB', DATE_OPTIONS_LONG) // dd/mm/yyyy
}

// `toLocaleString('fr-FR', ...)` groups thousands with a narrow no-break
// space (U+202F) that the standard Helvetica PDF font can't render (same
// class of bug as the contract's "●" placeholder) — group manually with a
// plain ASCII space instead, comma as the decimal separator.
function formatMoney(n: number | null | undefined) {
  if (n == null) return null
  const [intPart, decPart] = n.toFixed(2).split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${grouped},${decPart}`
}

// Rebuilds everything a generated invoice PDF needs — reservation, client
// and provider are all loose references (`invoice.reservationId` etc.),
// so they're re-fetched here rather than joined via a formal relation.
export async function invoiceToPdfData(invoice: Invoice): Promise<InvoicePdfData> {
  const isService = invoice.category === 'service'

  const reservation = invoice.reservationId
    ? await prisma.reservation.findUnique({
        where: { id: invoice.reservationId },
        select: {
          firstName: true, lastName: true, email: true, phone: true,
          date: true, endDate: true, price: true, priceTotal: true,
          location: true, objectTitle: true,
          client: { select: { fullName: true, email: true, phone: true, address: true, city: true, country: true } },
          yacht: { select: { model: true, builder: true, city: true, region: true } },
          property: { select: { title: true, city: true } },
          // Loose reference (no formal relation) — a fallback for
          // commission invoices that never had a providerId set directly
          // on the invoice itself (all the imported legacy ones).
          providerId: true,
        },
      })
    : null

  const client = invoice.customerId
    ? await prisma.client.findUnique({
        where: { id: invoice.customerId },
        select: { fullName: true, email: true, phone: true, address: true, city: true, country: true },
      })
    : reservation?.client || null

  const providerId = invoice.providerId || reservation?.providerId || null
  const provider = providerId
    ? await prisma.provider.findUnique({
        where: { id: providerId },
        select: { company: true, name: true, address: true, city: true, country: true, phone: true, email: true },
      })
    : null

  let serviceName: string | null = null
  let serviceLocation: string | null = null
  if (reservation?.yacht) {
    serviceName = [reservation.yacht.builder, reservation.yacht.model].filter(Boolean).join(' ')
    serviceLocation = reservation.yacht.city || reservation.yacht.region || null
  } else if (reservation?.property) {
    serviceName = reservation.property.title
    serviceLocation = reservation.property.city || null
  } else if (reservation) {
    serviceName = reservation.objectTitle || null
    serviceLocation = reservation.location || null
  }

  // Who the reservation's client actually is — shown as the "Bill To" box
  // for a client-facing service invoice, or as the separate "Client
  // Concerned" note (plus a subline on the service line) for a commission
  // invoice billed to the provider instead. Name only — no phone number,
  // which isn't the provider's business on a commission invoice.
  const clientName = client?.fullName || (reservation ? [reservation.firstName, reservation.lastName].filter(Boolean).join(' ') : null) || null
  const clientLine = clientName

  const billToName = isService ? clientName : realStr(provider?.company) || realStr(provider?.name) || null

  const billToLines: string[] = []
  if (isService) {
    if (client?.address) billToLines.push(client.address)
    const cityCountry = [client?.city, client?.country].filter(Boolean).join(', ')
    if (cityCountry) billToLines.push(cityCountry)
    const phone = client?.phone || reservation?.phone
    if (phone) billToLines.push(phone)
    const email = client?.email || reservation?.email
    if (email) billToLines.push(email)
  } else if (provider) {
    if (realStr(provider.address)) billToLines.push(provider.address!)
    const cityCountry = [realStr(provider.city), realStr(provider.country)].filter(Boolean).join(', ')
    if (cityCountry) billToLines.push(cityCountry)
    if (realStr(provider.phone)) billToLines.push(provider.phone!)
    if (realStr(provider.email)) billToLines.push(provider.email!)
  }

  const startDate = invoice.startDate || reservation?.date || null
  const endDate = invoice.endDate || reservation?.endDate || reservation?.date || null
  const lineAmount = isService
    ? invoice.priceTotal ?? reservation?.priceTotal ?? reservation?.price ?? null
    : invoice.commissionAmount

  const baseAmount = isService ? (invoice.priceTotal ?? reservation?.priceTotal ?? reservation?.price ?? null) : invoice.commissionAmount
  const vatAmount = invoice.applyVat && baseAmount != null ? baseAmount * (invoice.vatRate / 100) : null
  const totalWithVat = invoice.applyVat && baseAmount != null ? baseAmount + (vatAmount || 0) : baseAmount

  return {
    invoiceNumber: invoice.invoiceNumber,
    date: formatDMY(invoice.createdAt) || '',
    type: invoice.type,
    status: (invoice.status as InvoicePdfData['status']) || 'draft',
    isService,
    issuerLabel: 'From / De — Issuer / Émetteur',
    billToLabel: isService ? 'Bill To / Facturé à — Client' : 'To / À — Partner / Partenaire',
    billToName,
    billToLines,
    serviceName: isService
      ? invoice.serviceTitle || serviceName || 'Service'
      : "Referral fee — Commission d'apporteur d'affaires",
    serviceDetail: serviceName && (!isService || invoice.serviceTitle !== serviceName)
      ? [serviceName, invoice.serviceCity || serviceLocation].filter(Boolean).join(' · ')
      : null,
    // Only shown on the service line for a commission invoice — a service
    // invoice's client is already the "Bill To" party, so repeating it
    // there would be redundant.
    clientLine: !isService ? clientLine : null,
    startDate: formatDMY(startDate),
    endDate: formatDMY(endDate),
    lineAmount: formatMoney(lineAmount),
    commissionRate: invoice.commissionRate,
    applyVat: invoice.applyVat,
    vatRate: invoice.vatRate,
    subtotal: formatMoney(baseAmount),
    vatAmount: formatMoney(vatAmount),
    totalDue: formatMoney(totalWithVat),
    currency: invoice.currency,
    notes: invoice.notes,
  }
}

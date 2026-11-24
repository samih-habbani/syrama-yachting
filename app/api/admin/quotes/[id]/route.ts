import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { parseLineItems } from '@/lib/line-items'

async function checkAuth() {
  const cookieStore = await cookies()
  if (!cookieStore.get('userId')?.value) throw new Error('Unauthorized')
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    const quote = await prisma.quote.findUnique({ where: { id: parseInt(id) } })
    if (!quote) return Response.json({ error: 'Quote not found' }, { status: 404 })
    return Response.json(quote)
  } catch (error) {
    console.error('Get quote error:', error)
    return Response.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

// PUT — full update of an existing quote (lines, currency, VAT, validity,
// status, notes). The quote number and reservation never change.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    const { currency, items: rawItems, applyVat, vatRate, validUntil, status, notes } = await request.json()
    const items = parseLineItems(rawItems)
    if (!currency) return Response.json({ error: 'Currency is required' }, { status: 400 })
    if (items.length === 0) return Response.json({ error: 'Add at least one line item' }, { status: 400 })

    const existing = await prisma.quote.findUnique({ where: { id: parseInt(id) }, select: { id: true } })
    if (!existing) return Response.json({ error: 'Quote not found' }, { status: 404 })

    const quote = await prisma.quote.update({
      where: { id: existing.id },
      data: {
        currency,
        items: items as unknown as object,
        applyVat: !!applyVat,
        vatRate: applyVat ? parseFloat(vatRate) || 0 : 0,
        validUntil: validUntil ? new Date(validUntil) : null,
        status: status || 'draft',
        notes: notes || null,
      },
    })
    return Response.json(quote)
  } catch (error) {
    console.error('Update quote error:', error)
    return Response.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    await prisma.quote.delete({ where: { id: parseInt(id) } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete quote error:', error)
    return Response.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}

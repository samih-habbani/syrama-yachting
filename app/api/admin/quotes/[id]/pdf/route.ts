import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { quoteToPdfData } from '@/lib/quote'
import { generateQuotePdf } from '@/lib/quote-pdf'

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
    const pdf = await generateQuotePdf(await quoteToPdfData(quote))
    return new Response(new Uint8Array(pdf), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${quote.quoteNumber}.pdf"` },
    })
  } catch (error) {
    console.error('Quote PDF error:', error)
    return Response.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}

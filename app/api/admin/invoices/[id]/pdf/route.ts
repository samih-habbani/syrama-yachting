import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { invoiceToPdfData } from '@/lib/invoice'
import { generateInvoicePdf } from '@/lib/invoice-pdf'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(id) } })
    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const pdfBuffer = await generateInvoicePdf(await invoiceToPdfData(invoice))

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Invoice PDF error:', error)
    return Response.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}

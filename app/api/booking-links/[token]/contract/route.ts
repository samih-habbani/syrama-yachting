import { prisma } from '@/lib/prisma'
import { generateContractPdf } from '@/lib/contract-pdf'
import { contractToPdfData } from '@/lib/contract'

// GET — the client's signed-ready agreement, reachable with just the
// booking link token (same access model as the link itself: whoever has
// the link can view it, no separate login). Works whether the link was
// just completed or is being reopened later — the contract was already
// generated at booking time and is simply re-rendered here.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    const link = await prisma.bookingLink.findUnique({ where: { token } })
    if (!link || !link.reservationId) {
      return Response.json({ error: 'No contract available for this link yet' }, { status: 404 })
    }

    const contract = await prisma.contract.findUnique({ where: { reservationId: link.reservationId } })
    if (!contract) {
      return Response.json({ error: 'Contract not found' }, { status: 404 })
    }

    const pdfBuffer = await generateContractPdf(contractToPdfData(contract))

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${contract.bookingReference}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Booking link contract download error:', error)
    return Response.json({ error: 'Failed to generate contract' }, { status: 500 })
  }
}

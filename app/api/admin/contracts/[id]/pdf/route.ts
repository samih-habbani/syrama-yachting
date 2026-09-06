import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { generateContractPdf } from '@/lib/contract-pdf'
import { contractToPdfData } from '@/lib/contract'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// GET — admin download of a generated contract.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params

    const contract = await prisma.contract.findUnique({ where: { id: parseInt(id) } })
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
    console.error('Admin contract download error:', error)
    return Response.json({ error: 'Failed to generate contract' }, { status: 500 })
  }
}

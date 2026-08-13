import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const yachtId = parseInt(id)

    const yacht = await prisma.yacht.findUnique({
      where: { id: yachtId },
      select: {
        id: true,
        model: true,
        builder: true,
        length: true,
        maxGuests: true,
        cabins: true,
        year: true,
        priceDay: true,
        region: true,
        city: true,
        media: {
          orderBy: { id: 'asc' },
          select: { id: true, url: true, alt: true }
        }
      }
    })

    if (!yacht) {
      return Response.json({ error: 'Yacht not found' }, { status: 404 })
    }

    return Response.json(yacht)
  } catch (error) {
    console.error('Error fetching yacht:', error)
    return Response.json({ error: 'Failed to fetch yacht' }, { status: 500 })
  }
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const yachtId = parseInt(id)

    const yacht = await prisma.yacht.findUnique({
      where: { id: yachtId },
      include: {
        media: {
          orderBy: { id: 'asc' }
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

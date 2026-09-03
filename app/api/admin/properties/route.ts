import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// GET properties — minimal listing used to power the "Add Product" villa
// picker on the Clients page (no dedicated Property admin UI yet).
export async function GET(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const where = search
      ? { title: { contains: search, mode: 'insensitive' as const } }
      : {}

    const properties = await prisma.property.findMany({
      where,
      select: { id: true, title: true, city: true, region: true },
      orderBy: { title: 'asc' },
      take: limit,
    })

    return Response.json({ properties })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return Response.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

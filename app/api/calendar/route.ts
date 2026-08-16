import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!region || !startDate || !endDate) {
      return Response.json(
        { error: 'region, startDate, and endDate are required' },
        { status: 400 }
      )
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        region,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      select: {
        id: true,
        date: true,
        numberOfPeople: true,
        location: true,
        status: true,
        client: { select: { fullName: true } },
        yacht: { select: { model: true } }
      },
      orderBy: { date: 'asc' }
    })

    return Response.json(reservations)
  } catch (error) {
    console.error('Calendar error:', error)
    return Response.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// Distinct tag/service values — powers the filter dropdowns dynamically,
// same idea as /api/admin/providers/meta — plus a few headline numbers for
// the stat cards at the top of the Clients page.
export async function GET() {
  try {
    await checkAuth()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [all, total, withReservations, newThisMonth, totalReservations] = await Promise.all([
      prisma.client.findMany({ select: { tags: true, services: true } }),
      prisma.client.count(),
      prisma.client.count({ where: { reservations: { some: {} } } }),
      prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.reservation.count(),
    ])

    const tags = Array.from(new Set(all.flatMap((c) => c.tags))).sort((a, b) => a.localeCompare(b))
    const services = Array.from(new Set(all.flatMap((c) => c.services))).sort((a, b) => a.localeCompare(b))

    return Response.json({
      tags,
      services,
      stats: { total, withReservations, newThisMonth, totalReservations },
    })
  } catch (error) {
    console.error('Error fetching client meta:', error)
    return Response.json({ error: 'Failed to fetch client metadata' }, { status: 500 })
  }
}

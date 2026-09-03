import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// Distinct region/city values across the fleet — powers the multi-select
// filter dropdowns on the admin Yachts page, same idea as
// /api/admin/providers/meta.
export async function GET() {
  try {
    await checkAuth()

    const [regions, cities] = await Promise.all([
      prisma.yacht.findMany({ where: { region: { not: null } }, select: { region: true }, distinct: ['region'] }),
      prisma.yacht.findMany({ where: { city: { not: null } }, select: { city: true }, distinct: ['city'] }),
    ])

    const clean = (arr: { [k: string]: string | null }[], key: string) =>
      Array.from(new Set(arr.map((r) => r[key]).filter((v): v is string => !!v && v.trim() !== ''))).sort((a, b) => a.localeCompare(b))

    return Response.json({
      regions: clean(regions, 'region'),
      cities: clean(cities, 'city'),
    })
  } catch (error) {
    console.error('Error fetching yacht meta:', error)
    return Response.json({ error: 'Failed to fetch yacht metadata' }, { status: 500 })
  }
}

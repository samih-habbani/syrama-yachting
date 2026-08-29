import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// Distinct values for every filterable field, plus quick stats — powers the
// filter dropdowns dynamically instead of a hardcoded list, since this is an
// open, evolving contact book (types/regions keep growing).
export async function GET() {
  try {
    await checkAuth()

    const [types, regions, cities, countries, all, activeCount] = await Promise.all([
      prisma.provider.findMany({ where: { type: { not: null } }, select: { type: true }, distinct: ['type'] }),
      prisma.provider.findMany({ where: { region: { not: null } }, select: { region: true }, distinct: ['region'] }),
      prisma.provider.findMany({ where: { city: { not: null } }, select: { city: true }, distinct: ['city'] }),
      prisma.provider.findMany({ where: { country: { not: null } }, select: { country: true }, distinct: ['country'] }),
      prisma.provider.findMany({ select: { services: true } }),
      prisma.provider.count({ where: { isActive: true } }),
    ])

    // The imported dataset used dash-only strings ('-', '--', ...) as a
    // "no value" placeholder, inconsistently — treat any of them as empty
    // rather than hardcoding one exact form.
    const isPlaceholder = (v: string) => /^-+$/.test(v.trim())

    const services = Array.from(new Set(all.flatMap((p) => p.services))).sort((a, b) => a.localeCompare(b))
    const total = all.length

    const clean = (arr: { [k: string]: string | null }[], key: string) =>
      Array.from(new Set(arr.map((r) => r[key]).filter((v): v is string => !!v && !isPlaceholder(v)))).sort((a, b) => a.localeCompare(b))

    return Response.json({
      types: clean(types, 'type'),
      regions: clean(regions, 'region'),
      cities: clean(cities, 'city'),
      countries: clean(countries, 'country'),
      services: services.filter((s) => !isPlaceholder(s)),
      stats: { total, active: activeCount, inactive: total - activeCount },
    })
  } catch (error) {
    console.error('Error fetching provider meta:', error)
    return Response.json({ error: 'Failed to fetch provider metadata' }, { status: 500 })
  }
}

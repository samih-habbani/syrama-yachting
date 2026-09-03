import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// Distinct region/city values across the fleet, plus the providers actually
// linked to at least one yacht — powers the multi-select filter dropdowns
// on the admin Yachts page, same idea as /api/admin/providers/meta.
export async function GET() {
  try {
    await checkAuth()

    const [regions, cities, providerYachts] = await Promise.all([
      prisma.yacht.findMany({ where: { region: { not: null } }, select: { region: true }, distinct: ['region'] }),
      prisma.yacht.findMany({ where: { city: { not: null } }, select: { city: true }, distinct: ['city'] }),
      prisma.yacht.findMany({
        where: { providerId: { not: null } },
        select: { provider: { select: { id: true, firstName: true, name: true, company: true } } },
        distinct: ['providerId'],
      }),
    ])

    // The imported provider dataset used dash-only strings ('-', '--', ...)
    // as a "no value" placeholder — same convention as
    // /api/admin/providers/meta, needed here too since the label is built
    // from those same fields.
    const isPlaceholder = (v: string) => /^-+$/.test(v.trim())
    const realStr = (v?: string | null) => (v && !isPlaceholder(v) ? v : null)

    const clean = (arr: { [k: string]: string | null }[], key: string) =>
      Array.from(new Set(arr.map((r) => r[key]).filter((v): v is string => !!v && v.trim() !== ''))).sort((a, b) => a.localeCompare(b))

    const providers = providerYachts
      .map((y) => y.provider)
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({
        value: String(p.id),
        label: [realStr(p.firstName), realStr(p.name)].filter(Boolean).join(' ') || realStr(p.company) || `Provider #${p.id}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return Response.json({
      regions: clean(regions, 'region'),
      cities: clean(cities, 'city'),
      providers,
    })
  } catch (error) {
    console.error('Error fetching yacht meta:', error)
    return Response.json({ error: 'Failed to fetch yacht metadata' }, { status: 500 })
  }
}

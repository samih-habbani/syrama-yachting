import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import type { Prisma } from '@prisma/client'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return parseInt(userId)
}

// GET providers — paginated, with search + per-field + services filters
export async function GET(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Prisma.ProviderWhereInput = {}

    const search = searchParams.get('search')
    if (search) {
      // Prisma's `contains` can't do a case-insensitive substring match
      // inside a String[] column (its array filters are exact-value only),
      // so services are matched separately with a raw ILIKE over the
      // unnested array, then folded into the same OR as an id list.
      const serviceMatches = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM provider
        WHERE EXISTS (SELECT 1 FROM unnest(services) AS s WHERE s ILIKE ${'%' + search + '%'})
      `
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        ...(serviceMatches.length > 0 ? [{ id: { in: serviceMatches.map((r) => r.id) } }] : []),
      ]
    }

    const types = searchParams.getAll('type')
    if (types.length > 0) where.type = { in: types }

    const regions = searchParams.getAll('region')
    if (regions.length > 0) where.region = { in: regions }

    const cities = searchParams.getAll('city')
    if (cities.length > 0) where.city = { in: cities }

    const countries = searchParams.getAll('country')
    if (countries.length > 0) where.country = { in: countries }

    const services = searchParams.getAll('services')
    if (services.length > 0) where.services = { hasSome: services }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      prisma.provider.count({ where }),
    ])

    return Response.json({
      providers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return Response.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

// Fields shared by POST/PUT — every one is optional, matching "no required field".
function buildData(data: Record<string, unknown>) {
  const str = (v: unknown) => (typeof v === 'string' && v.trim() !== '' ? v : null)
  return {
    name: str(data.name),
    company: str(data.company),
    email: str(data.email),
    phone: str(data.phone),
    city: str(data.city),
    country: str(data.country),
    type: str(data.type),
    services: Array.isArray(data.services) ? data.services.filter((s) => typeof s === 'string' && s.trim() !== '') : [],
    description: str(data.description),
    isActive: typeof data.isActive === 'boolean' ? data.isActive : null,
    website: str(data.website),
    instagram: str(data.instagram),
    catalogUrl: str(data.catalogUrl),
    notes: str(data.notes),
    position: str(data.position),
    firstContact: str(data.firstContact),
    firstName: str(data.firstName),
    region: str(data.region),
    manager: str(data.manager),
    address: str(data.address),
    postalCode: str(data.postalCode),
    updatedAt: new Date(),
  }
}

// POST create provider
export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const provider = await prisma.provider.create({ data: buildData(data) })
    return Response.json(provider, { status: 201 })
  } catch (error) {
    console.error('Create provider error:', error)
    return Response.json({ error: 'Failed to create provider' }, { status: 500 })
  }
}

// PUT update provider
export async function PUT(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { id } = data
    if (!id) return Response.json({ error: 'Provider ID is required' }, { status: 400 })

    const provider = await prisma.provider.update({
      where: { id: parseInt(id) },
      data: buildData(data),
    })
    return Response.json(provider)
  } catch (error) {
    console.error('Update provider error:', error)
    return Response.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}

// DELETE provider
export async function DELETE(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'Provider ID is required' }, { status: 400 })

    await prisma.provider.delete({ where: { id: parseInt(id) } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete provider error:', error)
    return Response.json({ error: 'Failed to delete provider' }, { status: 500 })
  }
}

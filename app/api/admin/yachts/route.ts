import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return parseInt(userId)
}

// GET all yachts for admin with pagination and filtering
export async function GET(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause with filters
    const where: any = {}

    if (searchParams.has('model')) {
      where.model = { contains: searchParams.get('model'), mode: 'insensitive' }
    }

    if (searchParams.has('minLength') || searchParams.has('maxLength')) {
      where.length = {}
      if (searchParams.has('minLength')) {
        where.length.gte = parseFloat(searchParams.get('minLength')!)
      }
      if (searchParams.has('maxLength')) {
        where.length.lte = parseFloat(searchParams.get('maxLength')!)
      }
    }

    if (searchParams.has('minGuests') || searchParams.has('maxGuests')) {
      where.maxGuests = {}
      if (searchParams.has('minGuests')) {
        where.maxGuests.gte = parseInt(searchParams.get('minGuests')!)
      }
      if (searchParams.has('maxGuests')) {
        where.maxGuests.lte = parseInt(searchParams.get('maxGuests')!)
      }
    }

    const regions = searchParams.getAll('region')
    if (regions.length > 0) where.region = { in: regions }

    const cities = searchParams.getAll('city')
    if (cities.length > 0) where.city = { in: cities }

    const providerIds = searchParams.getAll('providerId')
    if (providerIds.length > 0) where.providerId = { in: providerIds.map((id) => parseInt(id)) }

    if (searchParams.has('status')) {
      const status = searchParams.get('status')
      if (status === 'charter') {
        where.status = { in: ['Location', 'location'] }
      } else if (status === 'sale') {
        where.status = { in: ['Vente', 'vente'] }
      } else {
        where.status = status
      }
    }

    // `fields=full` powers the admin "data table" — every scalar column
    // instead of the trimmed-down set the card list needs, so it stays fast.
    const full = searchParams.get('fields') === 'full'

    const [yachts, total] = await Promise.all([
      full
        ? prisma.yacht.findMany({
            where,
            include: {
              provider: { select: { id: true, name: true, firstName: true, company: true } },
              media: { select: { id: true, url: true, alt: true }, take: 1 }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
          })
        : prisma.yacht.findMany({
            where,
            select: {
              id: true,
              model: true,
              builder: true,
              length: true,
              maxGuests: true,
              cabins: true,
              year: true,
              priceDay: true,
              priceHour: true,
              priceWeek: true,
              priceSale: true,
              b2bPrice: true,
              minRentalHours: true,
              region: true,
              city: true,
              currency: true,
              status: true,
              available: true,
              providerId: true,
              provider: {
                select: { id: true, name: true, firstName: true, company: true }
              },
              media: {
                select: { id: true, url: true, alt: true },
                take: 1
              }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
          }),
      prisma.yacht.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return Response.json({
      yachts,
      currentPage: page,
      totalPages,
      total
    })
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return Response.json(
      { error: 'Failed to fetch yachts' },
      { status: 500 }
    )
  }
}

// POST create yacht
export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()

    const yacht = await prisma.yacht.create({
      data: {
        model: data.model,
        builder: data.builder || null,
        length: parseFloat(data.length),
        cabins: parseInt(data.cabins),
        available: data.available !== false,
        status: data.status || 'charter',
        maxGuests: data.maxGuests ? parseInt(data.maxGuests) : null,
        year: data.year ? parseInt(data.year) : null,
        priceDay: data.priceDay ? parseFloat(data.priceDay) : null,
        priceHour: data.priceHour ? parseFloat(data.priceHour) : null,
        priceWeek: data.priceWeek ? parseFloat(data.priceWeek) : null,
        priceSale: data.priceSale ? parseFloat(data.priceSale) : null,
        b2bPrice: data.b2bPrice ? parseFloat(data.b2bPrice) : null,
        minRentalHours: data.minRentalHours ? parseInt(data.minRentalHours) : null,
        region: data.region || null,
        city: data.city || null,
        currency: data.currency || 'EUR',
        lengthUnit: data.lengthUnit || 'm',
        providerId: data.providerId ? parseInt(data.providerId) : null
      }
    })

    return Response.json(yacht, { status: 201 })
  } catch (error) {
    console.error('Create yacht error:', error)
    return Response.json(
      { error: 'Failed to create yacht' },
      { status: 500 }
    )
  }
}

// PUT update yacht
export async function PUT(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { id } = data

    if (!id) {
      return Response.json(
        { error: 'Yacht ID is required' },
        { status: 400 }
      )
    }

    const yacht = await prisma.yacht.update({
      where: { id: parseInt(id) },
      data: {
        model: data.model,
        builder: data.builder || null,
        length: data.length ? parseFloat(data.length) : undefined,
        cabins: data.cabins ? parseInt(data.cabins) : undefined,
        available: data.available !== undefined ? data.available : undefined,
        status: data.status,
        maxGuests: data.maxGuests ? parseInt(data.maxGuests) : null,
        year: data.year ? parseInt(data.year) : null,
        priceDay: data.priceDay ? parseFloat(data.priceDay) : null,
        priceHour: data.priceHour ? parseFloat(data.priceHour) : null,
        priceWeek: data.priceWeek ? parseFloat(data.priceWeek) : null,
        priceSale: data.priceSale ? parseFloat(data.priceSale) : null,
        b2bPrice: data.b2bPrice ? parseFloat(data.b2bPrice) : null,
        minRentalHours: data.minRentalHours ? parseInt(data.minRentalHours) : null,
        region: data.region || null,
        city: data.city || null,
        providerId: data.providerId !== undefined ? (data.providerId ? parseInt(data.providerId) : null) : undefined
      },
      include: { media: true, provider: { select: { id: true, name: true, firstName: true, company: true } } }
    })

    return Response.json(yacht)
  } catch (error) {
    console.error('Update yacht error:', error)
    return Response.json(
      { error: 'Failed to update yacht' },
      { status: 500 }
    )
  }
}

// Column config for the admin data-table's inline click-to-edit cells —
// `PATCH` only ever writes the one field named in the request, never a
// full-record replace, so an in-progress edit on one cell can't clobber
// any other column (unlike PUT above, which needs the whole form).
type FieldType = 'string' | 'float' | 'int' | 'boolean'
const EDITABLE_FIELDS: Record<string, { type: FieldType; required?: boolean }> = {
  model: { type: 'string', required: true },
  builder: { type: 'string' },
  status: { type: 'string', required: true },
  available: { type: 'boolean' },
  length: { type: 'float', required: true },
  lengthUnit: { type: 'string', required: true },
  beam: { type: 'float' },
  beamOpenPlatform: { type: 'float' },
  draft: { type: 'float' },
  cruiseSpeed: { type: 'float' },
  maxSpeed: { type: 'float' },
  cabins: { type: 'int', required: true },
  bathrooms: { type: 'int' },
  maxGuests: { type: 'int' },
  maxSleeping: { type: 'int' },
  engines: { type: 'string' },
  engineHours: { type: 'int' },
  consumption: { type: 'string' },
  autonomy: { type: 'string' },
  fuelCapacity: { type: 'int' },
  waterCapacity: { type: 'int' },
  navigationClass: { type: 'string' },
  dryWeight: { type: 'float' },
  hull: { type: 'string' },
  rating: { type: 'float' },
  reviewsCount: { type: 'int' },
  year: { type: 'int' },
  region: { type: 'string' },
  city: { type: 'string' },
  currency: { type: 'string', required: true },
  priceDay: { type: 'float' },
  priceWeek: { type: 'float' },
  priceHour: { type: 'float' },
  minRentalHours: { type: 'int' },
  priceSale: { type: 'float' },
  b2bPrice: { type: 'float' },
  mapIframeSrc: { type: 'string' },
}

// PATCH — single-field update for the data table's click-to-edit cells
export async function PATCH(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { id, field, value } = data

    if (!id || !field) {
      return Response.json({ error: 'id and field are required' }, { status: 400 })
    }

    const config = EDITABLE_FIELDS[field]
    if (!config) {
      return Response.json({ error: `Field "${field}" is not editable` }, { status: 400 })
    }

    let coerced: string | number | boolean | null

    if (config.type === 'boolean') {
      coerced = !!value
    } else if (value === '' || value === null || value === undefined) {
      if (config.required) {
        return Response.json({ error: `${field} is required` }, { status: 400 })
      }
      coerced = null
    } else if (config.type === 'float') {
      const n = parseFloat(value)
      if (isNaN(n)) return Response.json({ error: `${field} must be a number` }, { status: 400 })
      coerced = n
    } else if (config.type === 'int') {
      const n = parseInt(value)
      if (isNaN(n)) return Response.json({ error: `${field} must be a number` }, { status: 400 })
      coerced = n
    } else {
      coerced = String(value)
    }

    const yacht = await prisma.yacht.update({
      where: { id: parseInt(id) },
      data: { [field]: coerced },
    })

    return Response.json(yacht)
  } catch (error) {
    console.error('Patch yacht error:', error)
    return Response.json({ error: 'Failed to update yacht' }, { status: 500 })
  }
}

// DELETE yacht
export async function DELETE(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json(
        { error: 'Yacht ID is required' },
        { status: 400 }
      )
    }

    await prisma.media.deleteMany({
      where: { yachtId: parseInt(id) }
    })

    await prisma.yacht.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete yacht error:', error)
    return Response.json(
      { error: 'Failed to delete yacht' },
      { status: 500 }
    )
  }
}

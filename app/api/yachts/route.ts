import { getYachts, YachtSortBy } from '@/lib/yacht-service'

const VALID_SORTS: YachtSortBy[] = ['default', 'price-asc', 'price-desc', 'length-asc', 'length-desc']

// Only forwards a numeric filter when the query param is actually present —
// an absent param must mean "no filter", not "filter at a default bound"
// (see the comment in getYachts for why that distinction matters).
function optionalInt(url: URL, key: string): number | undefined {
  const value = url.searchParams.get(key)
  return value !== null ? parseInt(value) : undefined
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sortParam = url.searchParams.get('sortBy') || 'default'
    const yachts = await getYachts({
      type: (url.searchParams.get('type') || 'all') as 'charter' | 'sale' | 'all',
      limit: parseInt(url.searchParams.get('limit') || '500'),
      region: url.searchParams.get('region'),
      builder: url.searchParams.get('builder'),
      minLength: optionalInt(url, 'minLength'),
      maxLength: optionalInt(url, 'maxLength'),
      minGuests: optionalInt(url, 'minGuests'),
      maxGuests: optionalInt(url, 'maxGuests'),
      minPrice: optionalInt(url, 'minPrice'),
      maxPrice: optionalInt(url, 'maxPrice'),
      sortBy: (VALID_SORTS.includes(sortParam as YachtSortBy) ? sortParam : 'default') as YachtSortBy,
    })
    return Response.json(yachts)
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return Response.json({ error: 'Failed to fetch yachts' }, { status: 500 })
  }
}

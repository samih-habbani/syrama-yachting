import { getYachts, YachtSortBy } from '@/lib/yacht-service'

const VALID_SORTS: YachtSortBy[] = ['default', 'price-asc', 'price-desc', 'length-asc', 'length-desc']

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sortParam = url.searchParams.get('sortBy') || 'default'
    const yachts = await getYachts({
      type: (url.searchParams.get('type') || 'all') as 'charter' | 'sale' | 'all',
      limit: parseInt(url.searchParams.get('limit') || '500'),
      region: url.searchParams.get('region'),
      builder: url.searchParams.get('builder'),
      minLength: parseInt(url.searchParams.get('minLength') || '0'),
      maxLength: parseInt(url.searchParams.get('maxLength') || '200'),
      minGuests: parseInt(url.searchParams.get('minGuests') || '0'),
      maxGuests: parseInt(url.searchParams.get('maxGuests') || '100'),
      minPrice: parseInt(url.searchParams.get('minPrice') || '0'),
      maxPrice: parseInt(url.searchParams.get('maxPrice') || '0'),
      sortBy: (VALID_SORTS.includes(sortParam as YachtSortBy) ? sortParam : 'default') as YachtSortBy,
    })
    return Response.json(yachts)
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return Response.json({ error: 'Failed to fetch yachts' }, { status: 500 })
  }
}

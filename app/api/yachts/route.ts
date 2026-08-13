import { getYachts } from '@/lib/yacht-service'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const yachts = await getYachts({
      type: (url.searchParams.get('type') || 'charter') as 'charter' | 'sale',
      limit: parseInt(url.searchParams.get('limit') || '100'),
      region: url.searchParams.get('region'),
      builder: url.searchParams.get('builder'),
      minLength: parseInt(url.searchParams.get('minLength') || '0'),
      maxLength: parseInt(url.searchParams.get('maxLength') || '200'),
      minGuests: parseInt(url.searchParams.get('minGuests') || '0'),
      maxGuests: parseInt(url.searchParams.get('maxGuests') || '100'),
    })
    return Response.json(yachts)
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return Response.json({ error: 'Failed to fetch yachts' }, { status: 500 })
  }
}

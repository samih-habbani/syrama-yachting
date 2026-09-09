import type { Metadata } from 'next'
import { generateYachtDetailMetadata, YachtDetailPageContent } from '../../yacht-detail-shared'

export const revalidate = 86400
export const dynamicParams = true

// Without this, Next.js has no static shell to extend for this dynamic
// segment and renders every single request fully dynamically — `revalidate`
// above is silently ignored and no response is ever cached (confirmed via
// `Cache-Control: no-store` and multi-second response times even on repeat
// hits). An empty list is enough: the first visit to any slug still
// generates on-demand (dynamicParams: true), but that render is then
// cached per `revalidate` like any other ISR page instead of re-querying
// the database on every single yacht-page view.
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return generateYachtDetailMetadata(slug)
}

export default async function SaleYachtDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return YachtDetailPageContent({ slug, expectedSegment: 'sales' })
}

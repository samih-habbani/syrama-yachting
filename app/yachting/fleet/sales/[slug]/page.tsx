import type { Metadata } from 'next'
import { generateYachtDetailMetadata, YachtDetailPageContent } from '../../yacht-detail-shared'

export const revalidate = 86400
export const dynamicParams = true

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return generateYachtDetailMetadata(slug)
}

export default async function SaleYachtDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return YachtDetailPageContent({ slug, expectedSegment: 'sales' })
}

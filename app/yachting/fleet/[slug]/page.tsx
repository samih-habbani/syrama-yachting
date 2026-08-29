// Legacy single-segment yacht URL (/yachting/fleet/49 or
// /yachting/fleet/520-fly-prestige-yacht-49, from before charter/sale pages
// got their own URL segment). Kept around purely to 301/308-redirect
// already-indexed links to the current /charters/[slug] or /sales/[slug]
// canonical URL, so nothing that points here loses its SEO value.
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getYachtById } from '@/lib/yacht-service'
import { idFromSlug, yachtHref } from '@/lib/slug'

export const revalidate = 86400
export const dynamicParams = true

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const id = idFromSlug(slug)
  const yacht = id !== null ? await getYachtById(id) : null
  if (!yacht) return { title: 'Yacht Not Found' }

  return { alternates: { canonical: yachtHref(yacht) } }
}

export default async function LegacyYachtDetailRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const id = idFromSlug(slug)
  if (id === null) notFound()

  const yacht = await getYachtById(id)
  if (!yacht) notFound()

  permanentRedirect(yachtHref(yacht))
}

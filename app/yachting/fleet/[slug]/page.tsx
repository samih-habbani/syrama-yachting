// Legacy single-segment yacht URL (/yachting/fleet/49 or
// /yachting/fleet/520-fly-prestige-yacht-49, from before charter/sale pages
// got their own URL segment). Kept around purely to 301/308-redirect
// already-indexed links to the current /charters/[slug] or /sales/[slug]
// canonical URL, so nothing that points here loses its SEO value.
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getYachtById } from '@/lib/yacht-service'
import { idFromSlug } from '@/lib/slug'

export const revalidate = 86400
export const dynamicParams = true

// Without this, Next.js has no static shell to extend for this dynamic
// segment and renders every single request fully dynamically — `revalidate`
// above is silently ignored and no response is ever cached (confirmed via
// `Cache-Control: no-store` and 2-9s response times even on repeat hits).
// An empty list is enough: the first visit to any slug still generates
// on-demand (dynamicParams: true), but that render is then cached per
// `revalidate` like any other ISR page instead of re-querying the database
// on every single legacy-link click.
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const id = idFromSlug(slug)
  const yacht = id !== null ? await getYachtById(id) : null
  if (!yacht) return { title: 'Yacht Not Found' }

  return { alternates: { canonical: yacht.href } }
}

export default async function LegacyYachtDetailRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const id = idFromSlug(slug)
  if (id === null) notFound()

  const yacht = await getYachtById(id)
  if (!yacht) notFound()

  permanentRedirect(yacht.href)
}

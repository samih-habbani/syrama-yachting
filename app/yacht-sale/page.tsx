// The /yacht-sale root — destination picker (was /sales, which now
// permanently redirects here, see next.config.ts). Lives at the same
// prefix as every sale destination page (/yacht-sale/[region](/[city])),
// so both share one consistent namespace.
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import DestinationCards from '@/components/DestinationCards'
import Footer from '@/components/Footer'
import { getAllDestinations, destinationFullPath } from '@/lib/destinations'

const SITE_URL = 'https://www.syrama-yachting.com'
const TITLE = 'Yachts for Sale'
const DESCRIPTION = 'Browse luxury yachts for sale worldwide. Exclusive vessels available in Mediterranean, Caribbean, UAE, and premium destinations.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/yacht-sale' },
  // Without its own openGraph/twitter block, this page silently inherited
  // the root layout's (i.e. the homepage's) og:title/og:url/twitter:title —
  // wrong title and a link back to "/" on every share. Once a route defines
  // its own openGraph/twitter object, Next.js stops falling back to an
  // ancestor's for any field (images included) — the root's file-based
  // app/opengraph-image.tsx doesn't get pulled in automatically here the
  // way it does for a route with no openGraph of its own, so it's
  // re-declared explicitly below instead. There's no single destination
  // photo that would represent this picker page better than the generic
  // brand image.
  openGraph: {
    title: `${TITLE} | Syrama Yachting`,
    description: DESCRIPTION,
    url: `${SITE_URL}/yacht-sale`,
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Syrama Yachting — Luxury Yacht Charter & Sales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Syrama Yachting`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 3600

export default async function YachtSaleLandingPage() {
  // The tiles shown here are real inventory only — driven by whatever
  // sale-kind destinations actually exist (see lib/destinations.ts), not a
  // hardcoded region list like the charter page's. Today that's a single
  // French Riviera tile (all sale inventory is there); a second tile
  // appears automatically the moment another sale destination is added via
  // /admin/dashboard/destinations.
  const destinations = await getAllDestinations()
  const saleDestinations = destinations
    .filter((d) => d.kind === 'sale')
    .map((d) => ({
      name: d.name,
      sub: d.citySlug ? d.region : '',
      heroImage: d.heroImage,
      href: destinationFullPath(d),
    }))

  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 80 }}>
        <DestinationCards isSale saleDestinations={saleDestinations} />
      </div>

      <Footer />
    </main>
  )
}

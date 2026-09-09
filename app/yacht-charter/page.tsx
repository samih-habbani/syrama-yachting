// The /yacht-charter root — destination picker (was /charters, which now
// permanently redirects here, see next.config.ts). Lives at the same
// prefix as every charter destination page (/yacht-charter/[region](/[city])),
// so both share one consistent namespace.
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import DestinationCards from '@/components/DestinationCards'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.syrama-yachting.com'
const TITLE = 'Yacht Charter Destinations'
const DESCRIPTION = 'Explore luxury yacht charter destinations worldwide. French Riviera, Caribbean, Greece, Emirates, Maldives, and more.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Self-referencing canonical regardless of any ?region= etc. query string,
  // so a query-string variant of this URL is never treated by Google as a
  // separate page from the plain /yacht-charter URL.
  alternates: { canonical: '/yacht-charter' },
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
    url: `${SITE_URL}/yacht-charter`,
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

export default function YachtCharterLandingPage() {
  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 80 }}>
        <DestinationCards />
      </div>

      <Footer />
    </main>
  )
}

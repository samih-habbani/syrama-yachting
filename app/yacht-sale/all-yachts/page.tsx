// The full, unfiltered sale fleet — was the sale side of /yachting/fleet
// (?tab=sale), which now permanently redirects here (see next.config.ts).
// Lives under /yacht-sale so every sale URL on the site shares one prefix,
// alongside the destination picker (/yacht-sale) and each destination's
// own page.
//
// "all-yachts" is a literal route segment, not a dynamic one — Next.js
// always matches a literal folder before falling through to a sibling
// [region] dynamic segment at the same depth, so this can never collide
// with a real destination page.
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import FleetWrapper from '@/components/FleetWrapper'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { getYachts } from '@/lib/yacht-service'
import { getDestinationLinks } from '@/lib/destinations'

const SITE_URL = 'https://www.syrama-yachting.com'
const TITLE = 'All Yachts for Sale'
const DESCRIPTION = 'Browse our complete fleet of luxury yachts for sale worldwide. Filter by budget, guests and length, or contact our brokers for a tailored selection.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/yacht-sale/all-yachts' },
  // Without its own openGraph/twitter block, this page silently inherited
  // the root layout's (i.e. the homepage's) og:title/og:url/twitter:title —
  // wrong title and a link back to "/" on every share. Once a route defines
  // its own openGraph/twitter object, Next.js stops falling back to an
  // ancestor's for any field (images included) — the root's file-based
  // app/opengraph-image.tsx doesn't get pulled in automatically here the
  // way it does for a route with no openGraph of its own, so it's
  // re-declared explicitly below instead.
  openGraph: {
    title: `${TITLE} | Syrama Yachting`,
    description: DESCRIPTION,
    url: `${SITE_URL}/yacht-sale/all-yachts`,
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Syrama Yachting — Luxury Yacht Charter & Sales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Syrama Yachting`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
}

// Revalidated periodically rather than on every request — the fleet list
// doesn't need to be second-fresh, and this lets the page (and its first
// paint of yacht cards) be served from cache instead of hitting the DB.
export const revalidate = 300

export default async function AllSaleYachtsPage() {
  // Fetched here (server-side) and handed to Fleet as a starting point, so
  // the page opens with cards already on screen instead of the same
  // 500-yacht fetch happening again client-side after the JS bundle loads —
  // the biggest single reason this page felt slow to open on mobile.
  const initialYachts = await getYachts({ type: 'sale', limit: 500 })
  const destinationLinks = await getDestinationLinks()

  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <Navbar />
      <main id="main-content" className="flex-1 pt-20">
        <FleetWrapper
          initialYachts={initialYachts}
          destinationLinks={destinationLinks}
          defaultTab="sale"
          seo={{
            eyebrow: 'Full Fleet',
            h1: 'All Yachts for Sale',
            intro: ['Browse our complete brokerage fleet — filter by budget, length or guest capacity, or contact our brokers directly for a tailored selection matched to your requirements.'],
            name: 'All Yachts',
          }}
        />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

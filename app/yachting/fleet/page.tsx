import type { Metadata } from 'next'
import FleetWrapper from '@/components/FleetWrapper'
import Navbar from '@/components/Navbar'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { getYachts } from '@/lib/yacht-service'

export const metadata: Metadata = {
  title: 'Our Fleet — Yachts for Charter & Sale',
  description: 'Browse our curated fleet of luxury yachts. Filter by region, budget, guests and length to find the right vessel for charter or sale.',
  alternates: { canonical: '/yachting/fleet' },
}

// Revalidated periodically rather than on every request — the fleet list
// doesn't need to be second-fresh, and this lets the page (and its first
// paint of yacht cards) be served from cache instead of hitting the DB.
export const revalidate = 300

export default async function FleetPage() {
  // Fetched here (server-side) and handed to Fleet as a starting point, so
  // the page opens with cards already on screen instead of the same
  // 500-yacht fetch happening again client-side after the JS bundle loads —
  // the biggest single reason this page felt slow to open on mobile.
  const initialYachts = await getYachts({ type: 'all', limit: 500 })

  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <Navbar />
      <main id="main-content" className="flex-1 pt-20">
        <FleetWrapper initialYachts={initialYachts} />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

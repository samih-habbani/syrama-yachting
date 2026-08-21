import type { Metadata } from 'next'
import FleetWrapper from '@/components/FleetWrapper'
import Navbar from '@/components/Navbar'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Our Fleet — Yachts for Charter & Sale',
  description: 'Browse our curated fleet of luxury yachts. Filter by region, budget, guests and length to find the right vessel for charter or sale.',
  alternates: { canonical: '/yachting/fleet' },
}

export default function FleetPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <Navbar />
      <main id="main-content" className="flex-1 pt-20">
        <FleetWrapper />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

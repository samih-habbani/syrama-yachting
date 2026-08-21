import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Services from '@/components/Services'
import Experiences from '@/components/Experiences'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Bespoke Yacht Charter Experiences',
  description: 'Private dining, water sports, wellness on board and tailored itineraries. Discover the bespoke experiences Syrama Yachting arranges around every charter.',
  alternates: { canonical: '/experiences' },
}

export default function ExperiencesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <Navbar />
      <main id="main-content" className="flex-1 pt-20">
        <Services />
        <Experiences />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

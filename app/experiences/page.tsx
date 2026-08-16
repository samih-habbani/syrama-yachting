'use client'
import Navbar from '@/components/Navbar'
import Services from '@/components/Services'
import Experiences from '@/components/Experiences'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function ExperiencesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <Navbar />
      <main className="flex-1 pt-20">
        <Services />
        <Experiences />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

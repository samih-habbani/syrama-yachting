import Fleet from '@/components/Fleet'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function FleetPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <Navbar />
      <main className="flex-1 pt-20">
        <Fleet />
      </main>
      <Footer />
    </div>
  )
}

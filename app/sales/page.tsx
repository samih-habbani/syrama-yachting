import Navbar from '@/components/Navbar'
import DestinationCards from '@/components/DestinationCards'

export const metadata = {
  title: 'Yachts for Sale | Syrama Yachting',
  description: 'Browse luxury yachts for sale worldwide. Exclusive vessels available in Mediterranean, Caribbean, UAE, and premium destinations.',
}

export const revalidate = 3600

export default function SalesPage() {
  return (
    <main style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 80 }}>
        <DestinationCards isSale />
      </div>
    </main>
  )
}

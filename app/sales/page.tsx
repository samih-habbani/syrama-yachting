'use client'
import Navbar from '@/components/Navbar'
import DestinationCards from '@/components/DestinationCards'

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

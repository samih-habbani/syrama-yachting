import Navbar from '@/components/Navbar'
import DestinationCards from '@/components/DestinationCards'

export const metadata = {
  title: 'Yacht Charter Destinations | Syrama Yachting',
  description: 'Explore luxury yacht charter destinations worldwide. French Riviera, Caribbean, Greece, Emirates, Maldives, and more.',
}

export const revalidate = 3600

export default function ChartersPage() {
  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 80 }}>
        <DestinationCards />
      </div>
    </main>
  )
}

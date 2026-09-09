import Navbar from '@/components/Navbar'
import DestinationCards from '@/components/DestinationCards'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Yacht Charter Destinations',
  description: 'Explore luxury yacht charter destinations worldwide. French Riviera, Caribbean, Greece, Emirates, Maldives, and more.',
  // Self-referencing canonical regardless of any ?region= etc. query string,
  // so a query-string variant of this URL is never treated by Google as a
  // separate page from the plain /charters URL.
  alternates: { canonical: '/charters' },
}

export const revalidate = 3600

export default function ChartersPage() {
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

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const MapComponent = dynamic(() => import('@/components/DestinationsMap'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
})

const destinations = [
  { id: 'med', label: 'Mediterranean', sub: 'French Riviera · Italy · Greece', coords: [38.5, 14.0] as [number, number] },
  { id: 'caribbean', label: 'Caribbean', sub: 'St. Barts · Antigua · BVI', coords: [17.5, -63.0] as [number, number] },
  { id: 'red-sea', label: 'Red Sea', sub: 'Dubai · Oman · Saudi Arabia', coords: [22.0, 38.5] as [number, number] },
  { id: 'indian-ocean', label: 'Indian Ocean', sub: 'Maldives · Seychelles', coords: [4.0, 73.5] as [number, number] },
]

export default function SalesPage() {
  const [active, setActive] = useState<string | null>(null)
  const router = useRouter()

  return (
    <main style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', paddingTop: 80 }}>
        {/* Sidebar */}
        <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid rgba(184,151,74,0.18)', padding: '48px 32px', display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 24 }}>Available for Sale</div>
          {destinations.map(dest => (
            <motion.div
              key={dest.id}
              onMouseEnter={() => setActive(dest.id)}
              onMouseLeave={() => setActive(null)}
              onClick={() => router.push(`/yachting/fleet?tab=sale&region=${dest.id}`)}
              whileHover={{ x: 6 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '14px 16px', borderLeft: `2px solid ${active === dest.id ? '#b8974a' : 'rgba(184,151,74,0.15)'}`, transition: 'all 0.25s ease', background: active === dest.id ? 'rgba(184,151,74,0.07)' : 'transparent', cursor: 'pointer' }}
            >
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: active === dest.id ? '#f5eedd' : 'rgba(245,238,221,0.8)', transition: 'color 0.25s ease' }}>{dest.label}</div>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9a8e', marginTop: 4 }}>{dest.sub}</div>
            </motion.div>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 32 }}>
            <Link href="/yachting/fleet?tab=sale" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: 'linear-gradient(135deg, #b8974a, #d4b472)', padding: '14px 24px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(184,151,74,0.35)' }}>
              Browse Yachts
              <svg width="16" height="5" viewBox="0 0 16 5" fill="none"><line x1="0" y1="2.5" x2="12" y2="2.5" stroke="currentColor"/><polyline points="9,1 14,2.5 9,4" stroke="currentColor" strokeWidth="0.8" fill="none"/></svg>
            </Link>
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'default' }}>
          <MapComponent isSale={true} />
        </div>
      </div>
    </main>
  )
}

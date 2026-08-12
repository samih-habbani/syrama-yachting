'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import Link from 'next/link'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const destinations = [
  { id: 'med', label: 'Mediterranean', sub: 'French Riviera · Italy · Greece', coords: [14.0, 38.5] as [number, number] },
  { id: 'caribbean', label: 'Caribbean', sub: 'St. Barts · Antigua · BVI', coords: [-63.0, 17.5] as [number, number] },
  { id: 'red-sea', label: 'Red Sea', sub: 'Dubai · Oman · Saudi Arabia', coords: [38.5, 22.0] as [number, number] },
  { id: 'indian-ocean', label: 'Indian Ocean', sub: 'Maldives · Seychelles', coords: [73.5, 4.0] as [number, number] },
]

export default function ChartersPage() {
  const [active, setActive] = useState<string | null>(null)
  const router = useRouter()

  return (
    <main style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 48px', background: 'rgba(6,9,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(184,151,74,0.2)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontWeight: 300, letterSpacing: '0.3em', color: '#f5eedd' }}>SYRAMA</div>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9a9a8e', marginTop: 2 }}>Yachting</div>
        </Link>
        <Link href="/#contact" style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: 'linear-gradient(135deg, #b8974a, #d4b472)', padding: '12px 24px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(184,151,74,0.35)' }}>Contact Us</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', paddingTop: 80 }}>
        {/* Sidebar */}
        <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid rgba(184,151,74,0.18)', padding: '48px 32px', display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 24 }}>Charter Destinations</div>
          {destinations.map(dest => (
            <motion.div
              key={dest.id}
              onMouseEnter={() => setActive(dest.id)}
              onMouseLeave={() => setActive(null)}
              onClick={() => router.push(`/yachting/fleet?region=${dest.id}`)}
              whileHover={{ x: 6 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '14px 16px', borderLeft: `2px solid ${active === dest.id ? '#b8974a' : 'rgba(184,151,74,0.15)'}`, transition: 'all 0.25s ease', background: active === dest.id ? 'rgba(184,151,74,0.07)' : 'transparent', cursor: 'pointer' }}
            >
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: active === dest.id ? '#f5eedd' : 'rgba(245,238,221,0.8)', transition: 'color 0.25s ease' }}>{dest.label}</div>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9a8e', marginTop: 4 }}>{dest.sub}</div>
            </motion.div>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 32 }}>
            <Link href="/yachting/fleet" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: 'linear-gradient(135deg, #b8974a, #d4b472)', padding: '14px 24px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(184,151,74,0.35)' }}>
              View our fleet
              <svg width="16" height="5" viewBox="0 0 16 5" fill="none"><line x1="0" y1="2.5" x2="12" y2="2.5" stroke="currentColor"/><polyline points="9,1 14,2.5 9,4" stroke="currentColor" strokeWidth="0.8" fill="none"/></svg>
            </Link>
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'default' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 118, center: [20, 18] }}
            style={{ width: '100%', height: '100%' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="rgba(184,151,74,0.12)"
                    stroke="rgba(212,180,114,0.35)"
                    strokeWidth={0.5}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: 'rgba(184,151,74,0.22)' }, pressed: { outline: 'none' } }}
                  />
                ))
              }
            </Geographies>
            {destinations.map(dest => (
              <Marker key={dest.id} coordinates={dest.coords}>
                {/* Invisible large hit area */}
                <circle
                  r={20}
                  fill="transparent"
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onMouseEnter={() => setActive(dest.id)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => router.push(`/yachting/fleet?region=${dest.id}`)}
                />
                {/* Glow ring */}
                {active === dest.id && (
                  <circle r={14} fill="rgba(184,151,74,0.12)" stroke="rgba(184,151,74,0.4)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
                )}
                {/* Visible dot */}
                <circle
                  r={active === dest.id ? 7 : 5}
                  fill={active === dest.id ? '#d4b472' : 'rgba(184,151,74,0.7)'}
                  stroke="#d4b472"
                  strokeWidth={1}
                  style={{ transition: 'all 0.3s ease', pointerEvents: 'none' }}
                />
                {active === dest.id && (
                  <text y={-20} textAnchor="middle" style={{ fontFamily: 'var(--font-tenor)', fontSize: '10px', fill: '#f5eedd', letterSpacing: '0.12em', pointerEvents: 'none' }}>
                    {dest.label}
                  </text>
                )}
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </div>
    </main>
  )
}

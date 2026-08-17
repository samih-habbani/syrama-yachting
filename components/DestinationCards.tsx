'use client'
import Link from 'next/link'
import { motion, cubicBezier } from 'framer-motion'

const destinations = [
  { id: 'med', label: 'Mediterranean', sub: 'French Riviera · Italy · Greece', image: '/images/regions/French_Riviera.webp' },
  { id: 'caribbean', label: 'Caribbean', sub: 'St. Barts · Antigua · BVI', image: '/images/regions/Caribbean.webp' },
  { id: 'red-sea', label: 'Red Sea', sub: 'Dubai · Oman · Saudi Arabia', image: '/images/regions/Dubai.webp' },
  { id: 'indian-ocean', label: 'Indian Ocean', sub: 'Maldives · Seychelles', image: '/images/regions/Maldives.webp' },
]

interface DestinationCardsProps {
  isSale?: boolean
}

export default function DestinationCards({ isSale = false }: DestinationCardsProps) {
  const buildHref = (id: string) => isSale ? `/yachting/fleet?tab=sale&region=${id}` : `/yachting/fleet?region=${id}`

  return (
    <div style={{ flex: 1, padding: '64px clamp(24px, 6vw, 96px) 100px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: cubicBezier(0.25, 0.1, 0, 1) }}
        style={{ marginBottom: 56 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 32, height: 1, background: '#b8974a' }} />
          <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>
            {isSale ? 'Yachts For Sale' : 'Charter Destinations'}
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(20px, 4.4vw, 62px)', lineHeight: 1.05, color: '#f5eedd', margin: '0 0 20px', whiteSpace: 'nowrap' }}>
          {isSale ? 'Find Your Yacht, Worldwide.' : 'Explore by Destination.'}
        </h1>
        <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#6a6a5e', margin: 0, maxWidth: 640 }}>
          {isSale
            ? 'Browse yachts for sale across our worldwide network of premium destinations.'
            : 'Select a region to browse yachts available for charter.'}
        </p>
      </motion.div>

      {/* Destination cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {destinations.map((dest, i) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: cubicBezier(0.25, 0.1, 0, 1) }}
          >
            <Link href={buildHref(dest.id)} style={{ textDecoration: 'none', display: 'block' }}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'relative', height: 'clamp(240px, 32vw, 320px)', overflow: 'hidden', cursor: 'pointer' }}
              >
                <img
                  src={dest.image}
                  alt={dest.label}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.92) 0%, rgba(6,9,15,0.35) 55%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2, marginBottom: 6 }}>
                    {dest.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9a8e', marginBottom: 16 }}>
                    {dest.sub}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a' }}>
                    View Yachts
                    <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
                      <line x1="0" y1="2" x2="10" y2="2" stroke="currentColor" strokeWidth="0.8" />
                      <polyline points="7.5,0.5 12,2 7.5,3.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', marginTop: 64 }}>
        <Link
          href={isSale ? '/yachting/fleet?tab=sale' : '/yachting/fleet'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'var(--font-tenor)',
            fontSize: 10,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#06090f',
            background: 'linear-gradient(135deg, #b8974a, #d4b472)',
            padding: '16px 32px',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(184,151,74,0.35)',
          }}
        >
          View Our Full Fleet
          <svg width="16" height="5" viewBox="0 0 16 5" fill="none"><line x1="0" y1="2.5" x2="12" y2="2.5" stroke="currentColor" /><polyline points="9,1 14,2.5 9,4" stroke="currentColor" strokeWidth="0.8" fill="none" /></svg>
        </Link>
      </div>
    </div>
  )
}

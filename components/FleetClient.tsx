'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import FleetFilters from './FleetFilters'

interface Media {
  id: number
  url: string | null
  alt: string | null
}

interface Yacht {
  id: number
  builder: string | null
  model: string
  length: number
  maxGuests: number | null
  cabins: number
  priceDay: number | null
  status: string | null
  media?: Media[]
}

interface FilterState {
  region: string | null
  minLength: number
  maxLength: number
  minGuests: number
  maxGuests: number
  builder: string | null
}

interface FleetClientProps {
  yachts: Yacht[]
  showFilters?: boolean
}

export default function FleetClient({ yachts, showFilters = true }: FleetClientProps) {
  const handleFiltersChange = (filters: FilterState) => {
    // Handle filter changes if needed
  }

  return (
    <section style={{ background: '#06090f', minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)' }}>
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>CURATED YACHT SELECTION</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.0, color: '#f5eedd', margin: 0 }}>Yachts for Charter.</h2>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#6a6a5e', margin: '0 0 20px' }}>Explore a selection of yachts available for charter through our trusted network. From elegant day yachts to crewed motor yachts and superyachts, we source the right vessel for every journey.</p>
            </div>
          </div>
        </div>

        {showFilters && <FleetFilters onFiltersChange={handleFiltersChange} resultCount={yachts.length} />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginBottom: 80 }}>
          {yachts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#6a6a5e' }}>No yachts found matching your criteria.</div>
            </div>
          ) : (
            yachts.map((yacht, i) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
                viewport={{ once: true, margin: '-40px' }}
              >
                <Link href={`/yachting/fleet/${yacht.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', background: '#1a1a1a' }}>
                    {yacht.media?.[0]?.url && (
                      <img
                        src={`/uploads/yachts/${yacht.media[0].url}`}
                        alt={yacht.media?.[0]?.alt || yacht.model}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'brightness(0.75)',
                          transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.85) 0%, transparent 60%)' }} />

                    <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2 }}>
                        {yacht.model}
                      </div>
                      <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 4 }}>
                        {yacht.length}m · {yacht.builder}
                      </div>
                    </div>

                    <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.6)', background: 'rgba(6,9,15,0.5)', padding: '6px 10px' }}>
                      View →
                    </div>
                  </div>

                  <div style={{ padding: '18px 0', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
                    <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 11, letterSpacing: '0.1em', color: '#6a6a5e', marginBottom: 12 }}>
                      {yacht.maxGuests && `${yacht.maxGuests} guests`} {yacht.cabins && `· ${yacht.cabins} cabins`}
                    </div>
                    <div style={{ display: 'flex', gap: 28 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Length</div>
                        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>{yacht.length}m</div>
                      </div>
                      {yacht.maxGuests && (
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Guests</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>{yacht.maxGuests}</div>
                        </div>
                      )}
                      {yacht.priceDay && (
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Rate</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>€{yacht.priceDay.toLocaleString('fr-FR')}/day</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 300, color: '#f5eedd', marginBottom: 16 }}>
            Looking for something specific?
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, lineHeight: 1.8, color: '#6a6a5e', maxWidth: 480, margin: '0 auto 32px' }}>
            Tell us your destination, dates and preferences. Our brokers will source a tailored selection of available yachts.
          </p>
          <a
            href="#contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: 'var(--font-tenor)',
              fontSize: 10,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#06090f',
              background: '#b8974a',
              padding: '16px 36px',
              textDecoration: 'none',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#d4b472')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#b8974a')}
          >
            REQUEST A YACHT SELECTION
          </a>
        </div>
      </div>
    </section>
  )
}

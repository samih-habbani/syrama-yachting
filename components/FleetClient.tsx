'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AvailabilityModal from './AvailabilityModal'
import { yachtSlug } from '@/lib/slug'

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
  region: string | null
  media?: Media[]
}

interface FleetClientProps {
  yachts: Yacht[]
  showFilters?: boolean
}

export default function FleetClient({ yachts }: FleetClientProps) {
  const [availabilityYacht, setAvailabilityYacht] = useState<Yacht | null>(null)

  return (
    <section className="py-16 md:py-20" style={{ background: '#06090f', minHeight: '100vh' }}>
      <div style={{ paddingLeft: 'clamp(24px, 6vw, 96px)', paddingRight: 'clamp(24px, 6vw, 96px)' }}>
        <div className="mb-10 md:mb-[60px]">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>CURATED YACHT SELECTION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-end mb-8 md:mb-10">
            <div>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.0, color: '#f5eedd', margin: 0 }}>Yachts for Charter.</h2>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#8f8f7f', margin: '0 0 20px' }}>Explore a selection of yachts available for charter through our trusted network. From elegant day yachts to crewed motor yachts and superyachts, we source the right vessel for every journey.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16 md:mb-20">
          {yachts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#8f8f7f' }}>No yachts found matching your criteria.</div>
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
                <Link href={`/yachting/fleet/${yachtSlug(yacht)}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', background: '#1a1a1a' }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector('img')
                      if (img) img.style.transform = 'scale(1.05)'
                      const badge = e.currentTarget.querySelector<HTMLDivElement>('.view-badge')
                      if (badge) { badge.style.transform = 'translateX(0)'; badge.style.opacity = '1' }
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector('img')
                      if (img) img.style.transform = 'scale(1)'
                      const badge = e.currentTarget.querySelector<HTMLDivElement>('.view-badge')
                      if (badge) { badge.style.transform = 'translateX(130%)'; badge.style.opacity = '0' }
                    }}
                  >
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
                      />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.85) 0%, transparent 60%)', pointerEvents: 'none' }} />

                    <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2 }}>
                        {yacht.model}
                      </div>
                      <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 4 }}>
                        {yacht.length}m · {yacht.builder}
                      </div>
                    </div>

                    <div
                      className="view-badge"
                      style={{
                        position: 'absolute', top: 20, right: 20,
                        fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: 'rgba(245,238,221,0.6)', background: 'rgba(6,9,15,0.5)', padding: '6px 10px',
                        transform: 'translateX(130%)', opacity: 0,
                        transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0, 1), opacity 0.4s ease',
                        pointerEvents: 'none',
                      }}
                    >
                      View →
                    </div>

                    {yacht.region && (
                      <div style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '8px 12px' }}>
                        {yacht.region}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '18px 0', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
                    <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, letterSpacing: '0.1em', color: '#a0a090', marginBottom: 16 }}>
                      {yacht.maxGuests && `${yacht.maxGuests} guests`} {yacht.cabins && `· ${yacht.cabins} cabins`}
                    </div>
                    <div style={{ display: 'flex', gap: 32 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.7)', marginBottom: 6, fontWeight: 600 }}>Length</div>
                        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>{yacht.length}m</div>
                      </div>
                      {yacht.maxGuests && (
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.7)', marginBottom: 6, fontWeight: 600 }}>Guests</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>{yacht.maxGuests}</div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.7)', marginBottom: 6, fontWeight: 600 }}>Rate</div>
                        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>
                          {yacht.priceDay ? `€${yacht.priceDay.toLocaleString('fr-FR')}/day` : 'Price on request'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setAvailabilityYacht(yacht)}
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-tenor)',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#06090f',
                      background: '#b8974a',
                      border: 'none',
                      padding: '13px 16px',
                      cursor: 'pointer',
                      transition: 'background 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#d4b472')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#b8974a')}
                  >
                    Check Availability
                  </button>
                  <Link
                    href={`/yachting/fleet/${yachtSlug(yacht)}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontFamily: 'var(--font-tenor)',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#b8974a',
                      background: 'transparent',
                      border: '1px solid rgba(184,151,74,0.4)',
                      padding: '13px 16px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,151,74,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <AvailabilityModal
          isOpen={availabilityYacht !== null}
          onClose={() => setAvailabilityYacht(null)}
          yacht={availabilityYacht ? {
            model: availabilityYacht.model,
            builder: availabilityYacht.builder,
            length: availabilityYacht.length,
            imageUrl: availabilityYacht.media?.[0]?.url ? `/uploads/yachts/${availabilityYacht.media[0].url}` : null,
          } : { model: '' }}
        />

        {/* View All Yachts Button */}
        <div style={{ textAlign: 'center', marginBottom: 60, marginTop: 40 }}>
          <Link
            href="/charters"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: 'var(--font-tenor)',
              fontSize: 10,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#f5eedd',
              border: '1px solid #b8974a',
              padding: '16px 36px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(184,151,74,0.1)'
              e.currentTarget.style.borderColor = '#d4b472'
              e.currentTarget.style.color = '#d4b472'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = '#b8974a'
              e.currentTarget.style.color = '#f5eedd'
            }}
          >
            VIEW ALL YACHTS
          </Link>
        </div>

        {/* CTA Banderolle */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(184,151,74,0.08) 0%, rgba(212,180,114,0.04) 100%)',
          border: '1px solid rgba(184,151,74,0.2)',
          borderRadius: '8px',
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 300, color: '#f5eedd', marginBottom: 16 }}>
            Looking for something specific?
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, lineHeight: 1.8, color: '#8f8f7f', maxWidth: 480, margin: '0 auto 32px' }}>
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

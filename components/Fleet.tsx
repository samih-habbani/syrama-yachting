'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import FleetFilters from './FleetFilters'

interface Media {
  id: number
  url: string | null
  alt: string | null
}

interface Yacht {
  id: number
  name?: string
  builder: string
  model: string
  length: number
  maxGuests: number | null
  cabins: number
  year: number | null
  region: string | null
  city: string | null
  priceDay: number | null
  status: string | null
  available: boolean
  rating: number | null
  reviewsCount: number | null
  mapIframeSrc: string | null
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

interface FleetProps {
  showFilters?: boolean
  limit?: number
}

export default function Fleet({ showFilters = true, limit }: FleetProps) {
  const searchParams = useSearchParams()
  const regionParam = searchParams.get('region')
  const tabParam = searchParams.get('tab')

  const [activeTab, setActiveTab] = useState<'charter' | 'sale'>(tabParam === 'sale' ? 'sale' : 'charter')
  const [yachts, setYachts] = useState<Yacht[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    region: regionParam,
    minLength: 0,
    maxLength: 200,
    minGuests: 0,
    maxGuests: 100,
    builder: null,
  })

  useEffect(() => {
    fetchYachts()
  }, [activeTab, filters])

  const fetchYachts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: activeTab,
        ...(filters.region && { region: filters.region }),
        ...(filters.builder && { builder: filters.builder }),
        minLength: filters.minLength.toString(),
        maxLength: filters.maxLength.toString(),
        minGuests: filters.minGuests.toString(),
        maxGuests: filters.maxGuests.toString(),
      })

      const response = await fetch(`/api/yachts?${params}`)
      const data = await response.json()
      setYachts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching yachts:', error)
      setYachts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tabParam === 'sale') {
      setActiveTab('sale')
    }
  }, [tabParam])

  useEffect(() => {
    if (regionParam) {
      setFilters(prev => ({ ...prev, region: regionParam }))
    }
  }, [regionParam])

  const filtered = limit ? yachts.slice(0, limit) : yachts

  return (
    <section style={{ background: '#06090f', minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{ marginBottom: 60 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>Exclusive Fleet</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.0, color: '#f5eedd', margin: 0 }}>Our vessels.</h2>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#6a6a5e', margin: '0 0 20px' }}>Handpicked superyachts for charter and acquisition. Each vessel represents the pinnacle of maritime luxury, impeccably maintained and staffed by elite crews.</p>
            </div>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', gap: 24 }}>
            {(['charter', 'sale'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  color: activeTab === tab ? '#b8974a' : '#6a6a5e',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #b8974a' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                {tab === 'charter' ? 'Charter' : 'For Sale'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        {showFilters && <FleetFilters onFiltersChange={setFilters} resultCount={filtered.length} />}

        {/* Yacht Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 40, marginBottom: 80 }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#b8974a' }}>Loading yachts...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#6a6a5e' }}>No yachts found matching your criteria.</div>
            </div>
          ) : (
            filtered.map((yacht, i) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: [0.25, 0.1, 0, 1] }}
                viewport={{ once: true, margin: '-40px' }}
              >
                <Link href={`/yachting/fleet/${yacht.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', background: '#1a1a1a' }}>
                    <img
                      src={yacht.media?.[0]?.url ? `/uploads/properties/${yacht.media[0].url}` : `/uploads/properties/${yacht.id}.jpg`}
                      alt={yacht.media?.[0]?.alt || yacht.model}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(yacht.model)
                      }}
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
                      {activeTab === 'charter' && yacht.priceDay && (
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Rate</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>€{yacht.priceDay.toLocaleString()}/day</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 300, color: '#f5eedd', marginBottom: 16 }}>
            {activeTab === 'charter' ? 'Ready to set sail?' : 'Interested in acquisition?'}
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, lineHeight: 1.8, color: '#6a6a5e', maxWidth: 480, margin: '0 auto 32px' }}>
            {activeTab === 'charter'
              ? 'Contact our concierge team to arrange your bespoke voyage.'
              : 'Speak with our brokers about purchasing opportunities and investment potential.'}
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
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}

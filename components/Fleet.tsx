'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import FleetFilters, { FilterState } from './FleetFilters'
import AvailabilityModal from './AvailabilityModal'
import BrokerContactModal from './BrokerContactModal'
import { yachtHref } from '@/lib/slug'

interface Media {
  id: number
  url: string | null
  alt: string | null
}

export interface Yacht {
  id: number
  name?: string
  builder: string | null
  model: string
  length: number
  maxGuests: number | null
  cabins: number
  year?: number | null
  region: string | null
  city?: string | null
  priceDay: number | null
  priceSale: number | null
  status: string | null
  available?: boolean
  rating?: number | null
  reviewsCount?: number | null
  mapIframeSrc?: string | null
  media?: Media[]
}

interface FleetProps {
  showFilters?: boolean
  limit?: number
  // Server-fetched starting data (see app/yachting/fleet/page.tsx) — lets the
  // fleet render on first paint instead of showing an empty grid while the
  // client re-fetches the same 500 yachts over the network, which is what
  // made this page feel slow to open on mobile/cellular.
  initialYachts?: Yacht[]
}

const PAGE_SIZE = 12

export default function Fleet({ showFilters = true, limit, initialYachts }: FleetProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const regionParam = searchParams.get('region')
  const tabParam = searchParams.get('tab')

  const [activeTab, setActiveTab] = useState<'charter' | 'sale'>(tabParam === 'sale' ? 'sale' : 'charter')
  const [allYachts, setAllYachts] = useState<Yacht[]>(initialYachts ?? [])
  const [loading, setLoading] = useState(!initialYachts)
  const [availabilityYacht, setAvailabilityYacht] = useState<Yacht | null>(null)
  const [brokerYacht, setBrokerYacht] = useState<Yacht | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Un seul appel réseau pour toute la flotte — tout le filtrage / tri qui suit
  // se fait ensuite en mémoire, côté client, sans jamais retoucher la BDD.
  // Skipped entirely when the server already handed us the fleet as
  // `initialYachts` (see app/yachting/fleet/page.tsx) — no point re-fetching
  // over the network what we already have.
  useEffect(() => {
    if (initialYachts) return
    const fetchAllYachts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/yachts?type=all&limit=500')
        const data = await response.json()
        setAllYachts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching yachts:', error)
        setAllYachts([])
      } finally {
        setLoading(false)
      }
    }
    fetchAllYachts()
    // Intentionally mount-only — initialYachts is a one-time seed from the
    // server, not something that should re-trigger this effect if it were
    // ever to change identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bounds = useMemo(() => {
    const lengths = allYachts.map(y => y.length).filter((v): v is number => typeof v === 'number')
    const guests = allYachts.map(y => y.maxGuests).filter((v): v is number => typeof v === 'number')
    const prices = allYachts.map(y => y.priceDay).filter((v): v is number => typeof v === 'number')
    return {
      minLength: lengths.length ? Math.floor(Math.min(...lengths)) : 0,
      maxLength: lengths.length ? Math.ceil(Math.max(...lengths)) : 200,
      minGuests: guests.length ? Math.floor(Math.min(...guests)) : 0,
      maxGuests: guests.length ? Math.ceil(Math.max(...guests)) : 100,
      minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
      maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 50000,
    }
  }, [allYachts])

  const regions = useMemo(
    () => Array.from(new Set(allYachts.map(y => y.region).filter(Boolean))).sort() as string[],
    [allYachts]
  )
  const builders = useMemo(
    () => Array.from(new Set(allYachts.map(y => y.builder).filter(Boolean))).sort() as string[],
    [allYachts]
  )

  const [filters, setFilters] = useState<FilterState>({
    region: regionParam,
    builder: null,
    minLength: 0,
    maxLength: 200,
    minGuests: 0,
    maxGuests: 100,
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'default',
  })

  // Une fois les bornes réelles connues, on initialise les curseurs dessus (une seule fois)
  const boundsInitialized = useRef(false)
  useEffect(() => {
    if (!boundsInitialized.current && allYachts.length > 0) {
      boundsInitialized.current = true
      setFilters(prev => ({
        ...prev,
        minLength: bounds.minLength,
        maxLength: bounds.maxLength,
        minGuests: bounds.minGuests,
        maxGuests: bounds.maxGuests,
        minPrice: bounds.minPrice,
        maxPrice: bounds.maxPrice,
      }))
    }
  }, [allYachts, bounds])

  useEffect(() => {
    setActiveTab(tabParam === 'sale' ? 'sale' : 'charter')
  }, [tabParam])

  useEffect(() => {
    setFilters(prev => ({ ...prev, region: regionParam }))
  }, [regionParam])

  const yachts = useMemo(() => {
    const statusMatches = (status: string | null) => {
      const s = (status || '').toLowerCase()
      return activeTab === 'charter' ? s === 'location' : s === 'vente'
    }

    const filtered = allYachts.filter(y => {
      if (!statusMatches(y.status)) return false
      if (filters.region && (y.region || '').toLowerCase() !== filters.region.toLowerCase()) return false
      if (filters.builder && (y.builder || '').toLowerCase() !== filters.builder.toLowerCase()) return false
      if (filters.minLength && y.length < filters.minLength) return false
      if (filters.maxLength && y.length > filters.maxLength) return false
      // Guests/price sliders only make sense for yachts that actually have
      // that data (sale listings in particular rarely have a day rate, and
      // often no guest count either). Coercing a missing value to 0 would
      // make it fail the minimum bound and hide the yacht entirely — a
      // yacht with no data on a field must never be excluded by that field.
      if (filters.minGuests && y.maxGuests !== null && y.maxGuests < filters.minGuests) return false
      if (filters.maxGuests && y.maxGuests !== null && y.maxGuests > filters.maxGuests) return false
      if (filters.minPrice && y.priceDay !== null && y.priceDay < filters.minPrice) return false
      if (filters.maxPrice && y.priceDay !== null && y.priceDay > filters.maxPrice) return false
      return true
    })

    const sorted = [...filtered]
    if (filters.sortBy === 'price-asc') sorted.sort((a, b) => (a.priceDay ?? Infinity) - (b.priceDay ?? Infinity))
    else if (filters.sortBy === 'price-desc') sorted.sort((a, b) => (b.priceDay ?? -Infinity) - (a.priceDay ?? -Infinity))
    else if (filters.sortBy === 'length-asc') sorted.sort((a, b) => a.length - b.length)
    else if (filters.sortBy === 'length-desc') sorted.sort((a, b) => b.length - a.length)

    return limit ? sorted.slice(0, limit) : sorted
  }, [allYachts, activeTab, filters, limit])

  const visibleYachts = useMemo(() => yachts.slice(0, visibleCount), [yachts, visibleCount])
  const hasMore = visibleCount < yachts.length

  // Réinitialise la pagination à chaque changement de résultats (tab, filtres...)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [yachts])

  // Charge 12 yachts de plus quand la sentinelle en bas de grille devient visible
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + PAGE_SIZE, yachts.length))
        }
      },
      { rootMargin: '600px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, yachts.length])

  const resetFilters = () => {
    setFilters({
      region: null,
      builder: null,
      minLength: bounds.minLength,
      maxLength: bounds.maxLength,
      minGuests: bounds.minGuests,
      maxGuests: bounds.maxGuests,
      minPrice: bounds.minPrice,
      maxPrice: bounds.maxPrice,
      sortBy: 'default',
    })
  }

  // Répercute le choix charter/vente dans l'URL (?tab=) pour que la nav
  // du haut (CHARTERS / SALES) reste synchronisée avec ce toggle.
  const handleTabChange = (tab: 'charter' | 'sale') => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'sale') params.set('tab', 'sale')
    else params.delete('tab')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <section style={{ background: '#06090f', minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ marginBottom: 60 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>Exclusive Fleet</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.0, color: '#f5eedd', margin: 0 }}>Our vessels.</h1>
              {filters.region && (
                <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b8974a', margin: '12px 0 0 0' }}>
                  {filters.region}
                </p>
              )}
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#8f8f7f', margin: '0 0 20px' }}>Handpicked superyachts for charter and acquisition. Each vessel represents the pinnacle of maritime luxury, impeccably maintained and staffed by elite crews.</p>
            </div>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', gap: 24 }}>
            {(['charter', 'sale'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  color: activeTab === tab ? '#b8974a' : '#8f8f7f',
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
        {showFilters && (
          <FleetFilters
            filters={filters}
            bounds={bounds}
            regions={regions}
            builders={builders}
            resultCount={yachts.length}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />
        )}

        {/* Yacht Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 40, marginBottom: 80 }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#b8974a' }}>Loading yachts...</div>
            </div>
          ) : yachts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#8f8f7f' }}>No yachts found matching your criteria.</div>
            </div>
          ) : (
            visibleYachts.map((yacht, i) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (i % PAGE_SIZE) * 0.04, ease: 'easeOut' }}
              >
                <Link href={yachtHref(yacht)} style={{ textDecoration: 'none', display: 'block' }}>
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
                      <Image
                        src={`/uploads/yachts/${yacht.media[0].url}`}
                        alt={yacht.media?.[0]?.alt || yacht.model}
                        fill
                        loading="lazy"
                        sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={75}
                        style={{
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
                        {yacht.length}m{yacht.builder ? ` · ${yacht.builder}` : ''}
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
                        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.7)', marginBottom: 6, fontWeight: 600 }}>
                          {activeTab === 'charter' ? 'Rate' : 'Price'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>
                          {activeTab === 'charter'
                            ? (yacht.priceDay ? `€${yacht.priceDay.toLocaleString('en-US')}/day` : 'Price on request')
                            : (yacht.priceSale ? `€${yacht.priceSale.toLocaleString('en-US')}` : 'Price on request')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {activeTab === 'charter' ? (
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
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBrokerYacht(yacht)}
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
                      Contact Broker
                    </button>
                  )}
                  <Link
                    href={yachtHref(yacht)}
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

        {hasMore && (
          <div ref={sentinelRef} style={{ textAlign: 'center', padding: '20px 0 60px' }}>
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(184,151,74,0.5)' }}>
              Loading more vessels...
            </div>
          </div>
        )}

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

        <BrokerContactModal
          isOpen={brokerYacht !== null}
          onClose={() => setBrokerYacht(null)}
          yacht={brokerYacht ? {
            model: brokerYacht.model,
            builder: brokerYacht.builder,
            length: brokerYacht.length,
            imageUrl: brokerYacht.media?.[0]?.url ? `/uploads/yachts/${brokerYacht.media[0].url}` : null,
          } : { model: '' }}
        />

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 300, color: '#f5eedd', marginBottom: 16 }}>
            {activeTab === 'charter' ? 'Ready to set sail?' : 'Interested in acquisition?'}
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, lineHeight: 1.8, color: '#8f8f7f', maxWidth: 480, margin: '0 auto 32px' }}>
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

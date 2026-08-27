'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ReservationModal from './ReservationModal'
import AvailabilityModal from './AvailabilityModal'
import { useWhatsappContext } from './WhatsappContext'
import { yachtSlug } from '@/lib/slug'

interface Media {
  id: number
  url: string | null
  alt: string | null
}

interface Yacht {
  id: number
  model: string
  builder: string | null
  length: number
  maxGuests: number | null
  cabins: number
  year: number | null
  priceDay: number | null
  region: string | null
  city: string | null
  status: string | null
  media?: Media[]
}

interface SimilarYacht {
  id: number
  model: string
  builder: string | null
  length: number
  maxGuests: number | null
  cabins: number
  priceDay: number | null
  region: string | null
  status: string | null
  media?: Media[]
}

interface YachtDetailClientProps {
  yacht: Yacht
  similarYachts?: SimilarYacht[]
}

export default function YachtDetailClient({ yacht, similarYachts = [] }: YachtDetailClientProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [isReservationOpen, setIsReservationOpen] = useState(false)
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false)
  const images = yacht.media || []
  const prev = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setImgIndex(i => (i + 1) % images.length)

  const isCharter = (yacht.status || '').toLowerCase() === 'location'
  const availabilityYacht = {
    model: yacht.model,
    builder: yacht.builder,
    length: yacht.length,
    imageUrl: images[0]?.url ? `/uploads/yachts/${images[0].url}` : null,
  }
  const { setAvailabilityYacht } = useWhatsappContext()

  // On a charter yacht's page, the floating WhatsApp button opens the same
  // "Check Availability" popup as the fleet cards instead of a plain link.
  useEffect(() => {
    if (!isCharter) return
    setAvailabilityYacht(availabilityYacht)
    return () => setAvailabilityYacht(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yacht.id, isCharter])

  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh' }}>
      <nav className="px-5 md:px-12" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20, background: 'rgba(6,9,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
        <Link href={yacht.region ? `/yachting/fleet?region=${encodeURIComponent(yacht.region)}` : '/yachting/fleet'} style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8f8f7f', textDecoration: 'none' }}>← Our fleet</Link>
        <Link href="/#contact" className="hidden lg:inline-block" style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '12px 24px', textDecoration: 'none' }}>Contact Us</Link>
        <button
          type="button"
          onClick={() => setIsReservationOpen(true)}
          className="lg:hidden"
          style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '12px 24px', border: 'none', cursor: 'pointer' }}
        >
          Request Charter
        </button>
      </nav>

      <div className="h-[56vh] md:h-[70vh]" style={{ position: 'relative', overflow: 'hidden', marginTop: 64, background: '#1a1a1a' }}>
        {images.length > 0 && (
          <img
            src={`/uploads/yachts/${images[imgIndex].url}`}
            alt={images[imgIndex].alt || yacht.model}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }}
            loading="eager"
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(6,9,15,0.9) 100%)' }} />
        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous photo" style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.3)', color: '#b8974a', width: 44, height: 44, cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(8px)' }}>‹</button>
            <button onClick={next} aria-label="Next photo" style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.3)', color: '#b8974a', width: 44, height: 44, cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(8px)' }}>›</button>
            <div style={{ position: 'absolute', bottom: 20, right: 24, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(245,238,221,0.5)' }}>{imgIndex + 1} / {images.length}</div>
          </>
        )}
        <div style={{ position: 'absolute', bottom: 32, left: 'clamp(24px, 6vw, 96px)', right: 'clamp(24px, 6vw, 96px)' }}>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: '#f5eedd', lineHeight: 1.1, margin: 0 }}>{yacht.model}</h1>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 8 }}>{yacht.length}m · {yacht.builder} · {yacht.year}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px clamp(24px, 6vw, 96px)', background: '#06090f', overflowX: 'auto' }}>
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setImgIndex(i)}
            aria-label={`View photo ${i + 1} of ${images.length}`}
            aria-current={imgIndex === i}
            style={{ width: 80, height: 56, overflow: 'hidden', cursor: 'pointer', padding: 0, border: 'none', background: 'none', outline: imgIndex === i ? '2px solid #b8974a' : '2px solid transparent', outlineOffset: 2, transition: 'outline-color 0.2s ease', flexShrink: 0 }}
          >
            <img src={`/uploads/yachts/${img.url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: imgIndex === i ? 'brightness(1)' : 'brightness(0.5)', transition: 'filter 0.3s ease' }} loading="lazy" />
          </button>
        ))}
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-20 pt-12 pb-16 md:pt-16 md:pb-[120px]"
        style={{ paddingLeft: 'clamp(24px, 6vw, 96px)', paddingRight: 'clamp(24px, 6vw, 96px)', alignItems: 'start' }}
      >
        <div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
            {[
              ['Length', `${yacht.length}m`],
              ['Cabins', yacht.cabins],
              ['Guests', yacht.maxGuests],
              ['Builder', yacht.builder],
              ['Year', yacht.year],
              ['Region', yacht.region]
            ].filter(([_, value]) => value !== null && value !== undefined).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>{value}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 2, color: '#8f8f7f', marginBottom: 48 }}>Premium yacht available for charter. Experience luxury maritime travel with professional crew and world-class amenities.</p>
        </div>

        <div className="lg:sticky lg:top-[100px]" style={{ border: '1px solid rgba(184,151,74,0.2)', padding: 36, background: 'rgba(184,151,74,0.02)' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 300, color: '#f5eedd', marginBottom: 8 }}>{yacht.model}</div>
          {yacht.priceDay && (
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 32 }}>From €{yacht.priceDay.toLocaleString('en-US')}/day</div>
          )}
          <button onClick={() => setIsReservationOpen(true)} style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '16px', border: 'none', cursor: 'pointer', marginBottom: 16 }}>Request charter</button>
          {isCharter ? (
            <button
              type="button"
              onClick={() => setIsAvailabilityOpen(true)}
              style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', background: 'none', border: '1px solid rgba(184,151,74,0.3)', padding: '14px', cursor: 'pointer' }}
            >
              WhatsApp us
            </button>
          ) : (
            <a href={`https://wa.me/971505548034?text=${encodeURIComponent(`Hello Syrama Yachting! I'd like to know more about the *${yacht.model}*.`)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', border: '1px solid rgba(184,151,74,0.3)', padding: '14px', textDecoration: 'none' }}>WhatsApp us</a>
          )}
        </div>
      </div>

      {similarYachts.length > 0 && (
        <div style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(64px, 8vw, 120px)', borderTop: '1px solid rgba(184,151,74,0.12)' }}>
          <div style={{ paddingTop: 64, marginBottom: 40 }}>
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>Explore</div>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 300, color: '#f5eedd', margin: 0, marginBottom: 12 }}>Similar Yachts</h2>
            <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#8f8f7f', maxWidth: 560, margin: 0 }}>
              Comparable in size to {yacht.model}, these yachts may also suit your plans.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {similarYachts.map((sim) => (
              <Link key={sim.id} href={`/yachting/fleet/${yachtSlug(sim)}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', background: '#1a1a1a' }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('img')
                    if (img) img.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('img')
                    if (img) img.style.transform = 'scale(1)'
                  }}
                >
                  {sim.media?.[0]?.url && (
                    <img
                      src={`/uploads/yachts/${sim.media[0].url}`}
                      alt={sim.media[0].alt || sim.model}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)', transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)' }}
                    />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.85) 0%, transparent 60%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2 }}>{sim.model}</div>
                    <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 4 }}>
                      {sim.length}m{sim.builder ? ` · ${sim.builder}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 11, letterSpacing: '0.05em', color: '#8f8f7f' }}>
                    {sim.maxGuests && `${sim.maxGuests} guests`}{sim.cabins ? ` · ${sim.cabins} cabins` : ''}
                  </div>
                  <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#d4b472' }}>
                    {sim.priceDay ? `From €${sim.priceDay.toLocaleString('en-US')}${(sim.status || '').toLowerCase() === 'location' ? '/day' : ''}` : 'Price on request'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ReservationModal
        yachtId={yacht.id}
        yachtModel={yacht.model}
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />

      {isCharter && (
        <AvailabilityModal
          isOpen={isAvailabilityOpen}
          onClose={() => setIsAvailabilityOpen(false)}
          yacht={availabilityYacht}
        />
      )}
    </main>
  )
}

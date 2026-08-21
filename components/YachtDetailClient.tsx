'use client'
import { useState } from 'react'
import Link from 'next/link'
import ReservationModal from './ReservationModal'

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
  media?: Media[]
}

interface YachtDetailClientProps {
  yacht: Yacht
}

export default function YachtDetailClient({ yacht }: YachtDetailClientProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [isReservationOpen, setIsReservationOpen] = useState(false)
  const images = yacht.media || []
  const prev = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setImgIndex(i => (i + 1) % images.length)

  return (
    <main style={{ background: '#06090f', minHeight: '100vh' }}>
      <nav className="px-5 md:px-12" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20, background: 'rgba(6,9,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
        <Link href={yacht.region ? `/yachting/fleet?region=${encodeURIComponent(yacht.region)}` : '/yachting/fleet'} style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6a6a5e', textDecoration: 'none' }}>← Our fleet</Link>
        <Link href="/#contact" style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '12px 24px', textDecoration: 'none' }}>Contact Us</Link>
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
            <button onClick={prev} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.3)', color: '#b8974a', width: 44, height: 44, cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(8px)' }}>‹</button>
            <button onClick={next} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.3)', color: '#b8974a', width: 44, height: 44, cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(8px)' }}>›</button>
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
          <div key={i} onClick={() => setImgIndex(i)} style={{ width: 80, height: 56, overflow: 'hidden', cursor: 'pointer', outline: imgIndex === i ? '2px solid #b8974a' : '2px solid transparent', outlineOffset: 2, transition: 'outline-color 0.2s ease', flexShrink: 0 }}>
            <img src={`/uploads/yachts/${img.url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: imgIndex === i ? 'brightness(1)' : 'brightness(0.5)', transition: 'filter 0.3s ease' }} loading="lazy" />
          </div>
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
                <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6a6a5e', marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>{value}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 2, color: '#6a6a5e', marginBottom: 48 }}>Premium yacht available for charter. Experience luxury maritime travel with professional crew and world-class amenities.</p>
        </div>

        <div className="lg:sticky lg:top-[100px]" style={{ border: '1px solid rgba(184,151,74,0.2)', padding: 36, background: 'rgba(184,151,74,0.02)' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 300, color: '#f5eedd', marginBottom: 8 }}>{yacht.model}</div>
          {yacht.priceDay && (
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 32 }}>From €{yacht.priceDay.toLocaleString()}/day</div>
          )}
          <button onClick={() => setIsReservationOpen(true)} style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '16px', border: 'none', cursor: 'pointer', marginBottom: 16 }}>Request charter</button>
          <a href={`https://wa.me/971505548034?text=${encodeURIComponent(`Hello Syrama Yachting! I'd like to know more about the *${yacht.model}*.`)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', border: '1px solid rgba(184,151,74,0.3)', padding: '14px', textDecoration: 'none' }}>WhatsApp us</a>
        </div>
      </div>

      <ReservationModal
        yachtId={yacht.id}
        yachtModel={yacht.model}
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />
    </main>
  )
}

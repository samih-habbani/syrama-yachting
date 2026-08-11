'use client'
import { use, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getYacht } from '@/lib/yachts-data'
import { notFound } from 'next/navigation'

export default function YachtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const decodedId = decodeURIComponent(id)
  const yacht = getYacht(decodedId)
  if (!yacht) notFound()

  const [imgIndex, setImgIndex] = useState(0)
  const prev = () => setImgIndex(i => (i - 1 + yacht.images.length) % yacht.images.length)
  const next = () => setImgIndex(i => (i + 1) % yacht.images.length)

  return (
    <main style={{ background: '#06090f', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', background: 'rgba(6,9,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
        <Link href="/yachting/fleet" style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6a6a5e', textDecoration: 'none' }}>← Our fleet</Link>
        <Link href="/#contact" style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '12px 24px', textDecoration: 'none' }}>Contact Us</Link>
      </nav>

      <div style={{ position: 'relative', height: '70vh', overflow: 'hidden', marginTop: 64 }}>
        <AnimatePresence mode="wait">
          <motion.img key={imgIndex} src={yacht.images[imgIndex]} alt={yacht.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} />
        </AnimatePresence>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(6,9,15,0.9) 100%)' }} />
        <button onClick={prev} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.3)', color: '#b8974a', width: 44, height: 44, cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(8px)' }}>‹</button>
        <button onClick={next} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.3)', color: '#b8974a', width: 44, height: 44, cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(8px)' }}>›</button>
        <div style={{ position: 'absolute', bottom: 20, right: 24, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(245,238,221,0.5)' }}>{imgIndex + 1} / {yacht.images.length}</div>
        <div style={{ position: 'absolute', bottom: 32, left: 'clamp(32px, 6vw, 96px)' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: '#f5eedd', lineHeight: 1.1 }}>{yacht.name}</div>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 8 }}>{yacht.length} · {yacht.builder} · {yacht.year}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px clamp(32px, 6vw, 96px)', background: '#06090f' }}>
        {yacht.images.slice(0, 4).map((img, i) => (
          <div key={i} onClick={() => setImgIndex(i)} style={{ width: 80, height: 56, overflow: 'hidden', cursor: 'pointer', outline: imgIndex === i ? '2px solid #b8974a' : '2px solid transparent', outlineOffset: 2, transition: 'outline-color 0.2s ease', flexShrink: 0 }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: imgIndex === i ? 'brightness(1)' : 'brightness(0.5)', transition: 'filter 0.3s ease' }} />
          </div>
        ))}
      </div>

      <div style={{ padding: '64px clamp(32px, 6vw, 96px) 120px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 80, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
            {[['Length', yacht.length], ['Guests', yacht.guests], ['Crew', yacht.crew], ['Speed', yacht.speed], ['Builder', yacht.builder], ['Year', yacht.year]].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6a6a5e', marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>{value}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 2, color: '#6a6a5e', marginBottom: 48 }}>{yacht.longDesc}</p>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 24 }}>Amenities</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 40px' }}>
            {yacht.amenities.map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-tenor)', fontSize: 12, color: '#6a6a5e' }}>
                <div style={{ width: 4, height: 4, background: '#b8974a', borderRadius: '50%', flexShrink: 0 }} />
                {a}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: 100, border: '1px solid rgba(184,151,74,0.2)', padding: 36, background: 'rgba(184,151,74,0.02)' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 300, color: '#f5eedd', marginBottom: 8 }}>{yacht.name}</div>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6a6a5e', marginBottom: 32 }}>{yacht.range}</div>
          <Link href="/#contact" style={{ display: 'block', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '16px', textDecoration: 'none', marginBottom: 16 }}>Request charter</Link>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', border: '1px solid rgba(184,151,74,0.3)', padding: '14px', textDecoration: 'none' }}>WhatsApp us</a>
        </div>
      </div>
    </main>
  )
}

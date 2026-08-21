'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, cubicBezier, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const destinations = [
  {
    id: 'french-riviera',
    name: 'French Riviera',
    subtitle: 'Saint-Tropez · Cannes · Monaco',
    image: '/images/regions/French_Riviera.webp',
  },
  {
    id: 'balearic-islands',
    name: 'Balearic Islands',
    subtitle: 'Ibiza · Formentera · Spain',
    image: '/images/regions/Balearic_Islands.webp',
  },
  {
    id: 'greece',
    name: 'Greece',
    subtitle: 'Cyclades · Santorini · Mykonos',
    image: '/images/regions/Greece.webp',
  },
  {
    id: 'emirates',
    name: 'Emirates',
    subtitle: 'Dubai · Abu Dhabi · Persian Gulf',
    image: '/images/regions/Dubai.webp',
  },
  {
    id: 'italy',
    name: 'Italy',
    subtitle: 'Amalfi · Sicily · Mediterranean',
    image: '/images/regions/Italy.webp',
  },
  {
    id: 'corsica',
    name: 'Corsica',
    subtitle: 'France · Mediterranean',
    image: '/images/regions/Corsica.webp',
  },
  {
    id: 'maldives',
    name: 'Maldives',
    subtitle: 'Indian Ocean · Tropical Paradise',
    image: '/images/regions/Maldives.webp',
  },
  {
    id: 'caribbean',
    name: 'Caribbean',
    subtitle: 'Virgin Islands · Bahamas',
    image: '/images/regions/Caribbean.webp',
  },
  {
    id: 'sardinia',
    name: 'Sardinia',
    subtitle: 'Mediterranean · Italy',
    image: '/images/regions/Sardinia.webp',
  },
  {
    id: 'miami',
    name: 'Miami',
    subtitle: 'Florida · USA',
    image: '/images/regions/Miami.webp',
  },
]

export default function Destinations() {
  const [activeDestination, setActiveDestination] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(1)
      else if (window.innerWidth < 1024) setItemsPerView(2)
      else setItemsPerView(3)
    }
    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const totalSlides = Math.ceil(destinations.length / itemsPerView)

  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, totalSlides - 1))
  }, [totalSlides])

  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    setDragStart(clientX)
  }

  const handleDragEnd = (clientX: number) => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = dragStart - clientX

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < totalSlides - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, totalSlides - 1)))
  }

  const offset = -currentIndex * 100

  return (
    <section className="py-16 md:py-[100px]" style={{ background: '#06090f' }}>
      <div style={{ paddingLeft: 'clamp(24px, 6vw, 96px)', paddingRight: 'clamp(24px, 6vw, 96px)' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-20"
          style={{ textAlign: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>WORLDWIDE DESTINATIONS</span>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.0, color: '#f5eedd', margin: '0 0 40px' }}>
            Luxury Yacht Charter Destinations.
          </h2>

          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#6a6a5e', maxWidth: 600, margin: '0 auto' }}>
            From Cannes, Saint-Tropez and Monaco to Ibiza, Greece and Dubai, discover exceptional yachting destinations across the Mediterranean and beyond.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          onMouseDown={e => handleDragStart(e.clientX)}
          onMouseUp={e => handleDragEnd(e.clientX)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={e => handleDragStart(e.touches[0].clientX)}
          onTouchEnd={e => handleDragEnd(e.changedTouches[0].clientX)}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', marginBottom: 60, overflow: 'hidden', touchAction: 'pan-y' }}
        >
          <div style={{ display: 'flex', transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.1, 0, 1)', transform: `translateX(${offset}%)` }}>
            {Array.from({ length: totalSlides }).map((_, slideIdx) => (
              <div
                key={slideIdx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
                  gap: 'clamp(16px, 3vw, 32px)',
                  width: '100%',
                  flexShrink: 0,
                }}
              >
                {destinations.slice(slideIdx * itemsPerView, (slideIdx + 1) * itemsPerView).map((dest, i) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: i * 0.1, ease: cubicBezier(0.25, 0.1, 0, 1) }}
                    viewport={{ once: true, margin: '-40px' }}
                    onMouseEnter={() => setActiveDestination(dest.id)}
                    onMouseLeave={() => setActiveDestination(null)}
                    onClick={() => setActiveDestination(dest.id)}
                    style={{ cursor: 'pointer', position: 'relative', height: 'clamp(280px, 45vw, 400px)', userSelect: 'none' }}
                  >
                    {/* Image container */}
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                      <img
                        src={dest.image}
                        alt={dest.name}
                        draggable={false}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'brightness(0.6)',
                          transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)',
                          transform: activeDestination === dest.id ? 'scale(1.08)' : 'scale(1)',
                          userSelect: 'none',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Overlay gradient */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(6,9,15,0.9) 0%, rgba(6,9,15,0.5) 50%, transparent 100%)',
                      }}
                      />

                      {/* Content */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 24px' }}>
                        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2, marginBottom: 8 }}>
                          {dest.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 20 }}>
                          {dest.subtitle}
                        </div>

                        <Link href={`/yachting/fleet?region=${encodeURIComponent(dest.name)}`} style={{ textDecoration: 'none' }}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: activeDestination === dest.id ? 1 : 0, y: activeDestination === dest.id ? 0 : 10 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 12,
                              fontFamily: 'var(--font-tenor)',
                              fontSize: 10,
                              letterSpacing: '0.25em',
                              textTransform: 'uppercase',
                              color: '#06090f',
                              background: '#b8974a',
                              padding: '12px 20px',
                              cursor: 'pointer',
                              transition: 'background 0.3s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#d4b472')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#b8974a')}
                          >
                            Explore
                            <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
                              <line x1="0" y1="2" x2="10" y2="2" stroke="currentColor" strokeWidth="0.8" />
                              <polyline points="7.5,0.5 12,2 7.5,3.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
                            </svg>
                          </motion.div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 60 }}>
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => goToSlide(idx)}
              style={{
                width: currentIndex === idx ? 32 : 10,
                height: 10,
                borderRadius: 5,
                border: 'none',
                background: currentIndex === idx ? '#b8974a' : 'rgba(184,151,74,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>

        {/* Info CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, lineHeight: 1.8, color: '#6a6a5e', maxWidth: 500, margin: '0 auto 32px' }}>
            Not sure where to charter? Tell us the experience you're looking for and our team will recommend the right destination, yacht and itinerary.
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
            PLAN YOUR CHARTER
          </a>
        </motion.div>
      </div>

    </section>
  )
}

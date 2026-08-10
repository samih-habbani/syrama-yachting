'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const destinations = [
  {
    id: 'french-riviera',
    name: 'French Riviera',
    subtitle: 'Saint-Tropez · Cannes · Monaco',
    x: 150,
    y: 120,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  },
  {
    id: 'ibiza',
    name: 'Ibiza',
    subtitle: 'Spain · Mediterranean',
    x: 90,
    y: 155,
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=800&q=80',
  },
  {
    id: 'greece',
    name: 'Greece',
    subtitle: 'Cyclades · Santorini · Mykonos',
    x: 220,
    y: 150,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    subtitle: 'UAE · Persian Gulf',
    x: 290,
    y: 120,
    image: 'https://images.unsplash.com/photo-1512453475888-a21ddbdb02f6?w=800&q=80',
  },
  {
    id: 'italy',
    name: 'Italy',
    subtitle: 'Amalfi · Sardinia · Sicily',
    x: 130,
    y: 145,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
]

export default function Destinations() {
  const [activeDestination, setActiveDestination] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

  return (
    <section style={{ background: '#06090f', paddingTop: 100, paddingBottom: 100 }}>
      <div style={{ paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{ marginBottom: 80, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>Sailing Destinations</span>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.0, color: '#f5eedd', margin: '0 0 40px' }}>
            Where will you<br />go next?
          </h2>

          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#6a6a5e', maxWidth: 600, margin: '0 auto' }}>
            From the glittering shores of the Côte d'Azur to the pristine islands of Greece, our network spans the world's most coveted yachting destinations.
          </p>
        </motion.div>

        {/* Destinations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginBottom: 80 }}>
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.25, 0.1, 0, 1] }}
              viewport={{ once: true, margin: '-40px' }}
              onMouseEnter={() => setActiveDestination(dest.id)}
              onMouseLeave={() => setActiveDestination(null)}
              style={{ cursor: 'pointer', position: 'relative', height: 400 }}
            >
              {/* Image container */}
              <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                <img
                  src={dest.image}
                  alt={dest.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.6)',
                    transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)',
                    transform: activeDestination === dest.id ? 'scale(1.08)' : 'scale(1)',
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

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: activeDestination === dest.id ? 1 : 0, y: activeDestination === dest.id ? 0 : 10 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setShowMap(true)}
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
                      border: 'none',
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
                  </motion.button>
                </div>
              </div>
            </motion.div>
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
            Not sure which destination is perfect for you? Our concierge team curates the ideal itinerary based on your preferences.
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
            Plan Your Voyage
          </a>
        </motion.div>
      </div>

      {/* Interactive SVG Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMap(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(6,9,15,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              cursor: 'pointer',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '90%',
                height: '80vh',
                maxWidth: 1200,
                borderRadius: '2px',
                overflow: 'hidden',
                boxShadow: '0 0 80px rgba(184,151,74,0.2)',
              }}
            >
              <svg
                viewBox="0 0 400 250"
                style={{ width: '100%', height: '100%', background: '#080c16' }}
              >
                {/* World map outline */}
                <text x="200" y="125" textAnchor="middle" style={{ fontSize: '14px', fill: '#6a6a5e', opacity: 0.5 }}>
                  WORLD MAP
                </text>

                {/* Destination markers */}
                {destinations.map(dest => (
                  <g key={dest.id}>
                    {/* Marker circle */}
                    <circle
                      cx={dest.x}
                      cy={dest.y}
                      r={8}
                      fill="#b8974a"
                      stroke="rgba(184,151,74,0.5)"
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.setAttribute('r', '10')
                        e.currentTarget.setAttribute('fill', '#d4b472')
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.setAttribute('r', '8')
                        e.currentTarget.setAttribute('fill', '#b8974a')
                      }}
                    />
                    {/* Destination label */}
                    <text
                      x={dest.x}
                      y={dest.y - 16}
                      textAnchor="middle"
                      style={{ fontSize: '11px', fill: '#b8974a', letterSpacing: '0.1em', fontWeight: 500, pointerEvents: 'none' }}
                    >
                      {dest.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Close button */}
              <button
                onClick={() => setShowMap(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: '#b8974a',
                  border: 'none',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <line x1="5" y1="5" x2="15" y2="15" stroke="#06090f" strokeWidth="2" />
                  <line x1="15" y1="5" x2="5" y2="15" stroke="#06090f" strokeWidth="2" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

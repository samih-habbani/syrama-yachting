'use client'
import { motion, cubicBezier } from 'framer-motion'

const activities = [
  {
    id: 'jet-ski',
    name: 'Jet Ski',
    label: 'Water Sports',
    description: 'Explore the coastline at your own pace.',
    image: '/assets/experiences_at_sea/jetski.webp',
  },
  {
    id: 'seabob',
    name: 'SeaBob',
    label: 'Underwater',
    description: 'Discover the water above and below the surface.',
    image: '/assets/experiences_at_sea/seabob.webp',
  },
  {
    id: 'efoil',
    name: 'E-Foil',
    label: 'Innovation',
    description: 'Experience silent electric flight over the water.',
    image: '/assets/experiences_at_sea/efoil.webp',
  },
  {
    id: 'cruises',
    name: 'Coastal Cruising',
    label: 'Voyages',
    description: 'Connect iconic destinations by sea.',
    image: '/assets/experiences_at_sea/cruising.webp',
  },
  {
    id: 'diving',
    name: 'Diving',
    label: 'Exploration',
    description: 'Private diving experiences with qualified professionals.',
    image: '/assets/experiences_at_sea/diving.webp',
  },
  {
    id: 'snorkeling',
    name: 'Snorkeling',
    label: 'Discovery',
    description: 'Discover secluded coves and clear Mediterranean waters.',
    image: '/assets/experiences_at_sea/snorkling.webp',
  },
]

function ActivityCard({ activity, delay }: { activity: typeof activities[0], delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: cubicBezier(0.25, 0.1, 0, 1) }}
      viewport={{ once: true, margin: '-40px' }}
      style={{ position: 'relative', overflow: 'hidden', height: 420 }}
    >
      {/* Background Image */}
      <img
        src={activity.image}
        alt={activity.name}
        loading="lazy"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.6) contrast(1.1)',
          transition: 'transform 1.2s cubic-bezier(0.25, 0.1, 0, 1)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      />

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(6,9,15,0.92) 0%, rgba(6,9,15,0.5) 40%, transparent 70%)',
        }}
      />

      {/* Top Right Icon */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 32,
          height: 32,
          border: '1px solid rgba(212,180,114,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="5" y1="0" x2="5" y2="10" stroke="#d4b472" strokeWidth="0.8" />
          <line x1="0" y1="5" x2="10" y2="5" stroke="#d4b472" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Content - Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '28px 28px 24px',
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-tenor)',
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#b8974a',
            marginBottom: 8,
          }}
        >
          {activity.label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 28,
            fontWeight: 300,
            color: '#f5eedd',
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          {activity.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-tenor)',
            fontSize: 11,
            lineHeight: 1.6,
            color: 'rgba(245,238,221,0.6)',
            maxWidth: 300,
          }}
        >
          {activity.description}
        </div>
      </div>
    </motion.div>
  )
}

export default function Experiences() {
  return (
    <section id="experiences" style={{ background: '#06090f', paddingTop: 100, paddingBottom: 100, position: 'relative', overflow: 'hidden' }}>
      {/* Section number bg */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -20,
          top: '15%',
          fontFamily: 'var(--font-cormorant)',
          fontSize: '20vw',
          fontWeight: 300,
          color: 'rgba(184,151,74,0.12)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        04
      </div>

      <div style={{ paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{ marginBottom: 80 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                <div style={{ width: 32, height: 1, background: '#b8974a' }} />
                <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>ON THE WATER</span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.0, color: '#f5eedd', margin: 0 }}>
                Experiences<br />
                <em style={{ fontStyle: 'italic', color: '#d4b472' }}>Beyond the Yacht.</em>
              </h2>
            </div>

            <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#6a6a5e', margin: 0 }}>
              Add another dimension to your charter with water sports, underwater exploration and experiences tailored to your destination.
            </p>
          </div>
        </motion.div>

        {/* Activities Grid - 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 80 }}>
          {activities.map((activity, i) => (
            <ActivityCard key={activity.id} activity={activity} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}

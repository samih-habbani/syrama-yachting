'use client'
import { useRef } from 'react'
import { motion, cubicBezier } from 'framer-motion'

const services = [
  {
    img: '/assets/private-dining.webp',
    title: 'Private Dining',
    label: 'Culinary',
    desc: 'Private chefs, restaurant reservations, bespoke menus and carefully selected wines.',
    position: 'center',
  },
  {
    img: '/assets/crew-onboard.webp',
    title: 'Crew & Onboard Services',
    label: 'Onboard',
    desc: 'Additional crew, provisioning and onboard arrangements tailored to your charter.',
    position: 'center',
  },
  {
    img: '/assets/water-sports.webp',
    title: 'Water Sports',
    label: 'Aquatic Adventures',
    desc: 'Jet skis, SeaBobs, e-foils, snorkeling, diving and water toys on request.',
    position: 'center right',
  },
  {
    img: '/assets/wellness-onboard.webp',
    title: 'Wellness On Board',
    label: 'Rejuvenation',
    desc: 'Massage therapists, yoga sessions and personalised wellness experiences.',
    position: 'center',
  },
  {
    img: '/assets/shore-experiences.webp',
    title: 'Shore Experiences',
    label: 'Ashore',
    desc: 'Beach clubs, restaurants, private guides and carefully selected experiences ashore.',
    position: 'center',
  },
  {
    img: '/assets/bespoke-itineraries.webp',
    title: 'Bespoke Itineraries',
    label: 'Route Planning',
    desc: 'Routes designed around your destination, preferences and time on board.',
    position: 'center 40%',
  },
]

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      id="services"
      ref={sectionRef}
      style={{ position: 'relative', background: 'var(--noir)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="pt-24 pb-12 md:pt-40 md:pb-20" style={{ paddingLeft: 'clamp(24px, 6vw, 96px)', paddingRight: 'clamp(24px, 6vw, 96px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <div style={{ width: 32, height: 1, background: 'var(--or)' }} />
              <span className="section-label">BEYOND THE YACHT</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)', fontWeight: 300,
              fontSize: 'clamp(42px, 5vw, 72px)', lineHeight: 1.05,
              color: 'var(--champagne)', margin: 0,
            }}>
              Bespoke Yacht Charter<br />
              <em style={{ fontStyle: 'italic', color: 'var(--or-clair)' }}>Experiences.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            viewport={{ once: true }}
            style={{ fontFamily: 'var(--font-lora)', fontSize: 14, lineHeight: 1.9, color: 'var(--gris)' }}
          >
            Every charter can be shaped around the way you want to spend your time at sea. From dining and water sports to personalised itineraries and experiences ashore, our team coordinates every detail around you.
          </motion.p>
        </div>
      </div>

      {/* Experience Grid - NO MARQUEE */}
      <div style={{ width: '100%', padding: '0 clamp(24px, 6vw, 96px)' }} className="pb-24 md:pb-40">
        {/* Row 1: large left + one tall right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3 mb-3">
          <ServiceCard exp={services[0]} size="lg" delay={0} />
          <ServiceCard exp={services[1]} size="lg" delay={0.1} />
        </div>

        {/* Row 2: 4 equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-16 md:mb-20">
          {[services[2], services[3], services[4], services[5], services[6]].slice(0, 4).map((exp, i) => (
            <ServiceCard key={exp.title} exp={exp} delay={i * 0.08} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, lineHeight: 1.8, color: '#6a6a5e', maxWidth: 500, margin: '0 auto 32px' }}>
            Customise every aspect of your charter experience. From dining and water sports to wellness and shore excursions, our team will craft the perfect itinerary for you.
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
            CUSTOMIZE YOUR EXPERIENCE
          </a>
        </motion.div>
      </div>

      {/* Section number bg */}
      <div aria-hidden style={{
        position: 'absolute', right: -20, top: '25%',
        fontFamily: 'var(--font-cormorant)', fontSize: '20vw', fontWeight: 300,
        color: 'rgba(184,151,74,0.12)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
      }}>03</div>
    </section>
  )
}

function ServiceCard({ exp, size = 'sm', delay }: { exp: typeof services[0], size?: 'lg' | 'sm', delay: number }) {
  const height = size === 'lg' ? 'clamp(260px, 46vw, 580px)' : 'clamp(220px, 34vw, 420px)'
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: cubicBezier(0.25, 0.1, 0, 1) }}
      viewport={{ once: true, margin: '-40px' }}
      style={{ position: 'relative', overflow: 'hidden', height, cursor: 'pointer' }}
    >
      <img
        src={exp.img}
        alt={exp.title}
        loading="lazy"
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: exp.position,
          transition: 'transform 1.2s cubic-bezier(0.25, 0.1, 0, 1)',
          filter: 'brightness(0.55) contrast(1.1)',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      />
      {/* gradient bottom */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(6,9,15,0.92) 0%, rgba(6,9,15,0.3) 45%, transparent 75%)',
      }} />
      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 28px 24px' }}>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--or)', marginBottom: 8 }}>
          {exp.label}
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 300, color: 'var(--champagne)', lineHeight: 1.2, marginBottom: 8 }}>
          {exp.title}
        </div>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, lineHeight: 1.6, color: 'rgba(245,238,221,0.5)', maxWidth: 280 }}>
          {exp.desc}
        </div>
      </div>
      {/* Top right label */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        width: 32, height: 32, border: '1px solid rgba(212,180,114,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="5" y1="0" x2="5" y2="10" stroke="var(--or)" strokeWidth="0.8"/>
          <line x1="0" y1="5" x2="10" y2="5" stroke="var(--or)" strokeWidth="0.8"/>
        </svg>
      </div>
    </motion.div>
  )
}

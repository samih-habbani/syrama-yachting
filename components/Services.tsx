'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'

const services = [
  {
    img: '/assets/gastronomy.webp',
    title: 'Starred Chefs',
    label: 'Gastronomy',
    desc: 'Michelin-starred chefs, private dining experiences, rare wines and bespoke menus.',
    position: 'center',
  },
  {
    img: '/assets/high-end-mobility.webp',
    title: 'Fleet Management',
    label: 'Crew & Operations',
    desc: 'Expert captains, professional crew, maintenance, provisioning, and logistics.',
    position: 'center',
  },
  {
    img: '/assets/desert-signature.webp',
    title: 'Water Sports',
    label: 'Aquatic Adventures',
    desc: 'Jet skis, tenders, diving equipment, snorkeling, and watersports instructors.',
    position: 'center',
  },
  {
    img: '/assets/luxury-maison.webp',
    title: 'Wellness & Spa',
    label: 'Rejuvenation',
    desc: 'Onboard spa facilities, massage therapists, yoga instructors, wellness programs.',
    position: 'center',
  },
  {
    img: '/assets/signature-experiences.webp',
    title: 'Destination Concierge',
    label: 'Shore Experiences',
    desc: 'Curated excursions, private guides, exclusive venues, cultural immersion.',
    position: 'center',
  },
  {
    img: '/assets/icon-private-access.webp',
    title: 'Navigation & Logistics',
    label: 'Route Planning',
    desc: 'Expert navigation, itinerary design, port arrangements, and destination expertise.',
    position: 'center 40%',
  },
  {
    img: '/assets/unique-experience.webp',
    title: 'Entertainment',
    label: 'Bespoke Events',
    desc: 'Live performances, DJ services, celebration planning, themed parties on deck.',
    position: 'center',
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
      <div style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <div style={{ width: 32, height: 1, background: 'var(--or)' }} />
              <span className="section-label">Bespoke Services</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)', fontWeight: 300,
              fontSize: 'clamp(42px, 5vw, 72px)', lineHeight: 1.05,
              color: 'var(--champagne)', margin: 0,
            }}>
              If you can imagine it,<br />
              <em style={{ fontStyle: 'italic', color: 'var(--or-clair)' }}>we make it happen.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            viewport={{ once: true }}
            style={{ fontFamily: 'var(--font-lora)', fontSize: 14, lineHeight: 1.9, color: 'var(--gris)' }}
          >
            Our global network gives us access to what others consider impossible. No request too ambitious — only bespoke solutions delivered with discretion and excellence.
          </motion.p>
        </div>
      </div>

      {/* Experience Grid - NO MARQUEE */}
      <div style={{ padding: '0 48px 160px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Row 1: large left + one tall right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, marginBottom: 12 }}>
          <ServiceCard exp={services[0]} height={580} delay={0} />
          <ServiceCard exp={services[1]} height={580} delay={0.1} />
        </div>

        {/* Row 2: 4 equal cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          {[services[2], services[3], services[4], services[5], services[6]].slice(0, 4).map((exp, i) => (
            <ServiceCard key={exp.title} exp={exp} height={420} delay={i * 0.08} />
          ))}
        </div>
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

function ServiceCard({ exp, height, delay }: { exp: typeof services[0], height: number, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: cubicBezier(0.25, 0.1, 0, 1) }}
      viewport={{ once: true, margin: '-40px' }}
      data-cursor
      style={{ position: 'relative', overflow: 'hidden', height, cursor: 'none' }}
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

'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null)

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
  const line = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
  }

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        background: 'var(--noir)',
        padding: '160px 48px',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <img
          src="/images/Personalized Yacht Experiences - Syrama Yachting.webp"
          alt=""
          aria-hidden
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.35) contrast(1.15) saturate(0.9)',
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(6,9,15,0.85) 0%, rgba(6,9,15,0.65) 50%, rgba(6,9,15,0.80) 100%)',
          }}
        />
      </div>

      {/* Gold top line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1.8, ease: [0.25, 0.1, 0, 1] }}
        viewport={{ once: true }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(to right, transparent, var(--or) 30%, var(--or-clair) 50%, var(--or) 70%, transparent)',
          transformOrigin: 'left', zIndex: 2,
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}
        >
          <div style={{ width: 32, height: 1, background: 'var(--or)' }} />
          <span className="section-label">Personalized Yacht Experiences</span>
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 300,
            fontSize: 'clamp(48px, 6vw, 80px)',
            lineHeight: 1.1,
            color: 'var(--champagne)',
            margin: '0 0 56px',
            maxWidth: 900,
          }}
        >
          {['More than a', 'yacht. A journey', 'designed around you.'].map((text, i) => (
            <motion.div key={i} variants={line} style={{ overflow: 'hidden' }}>
              <span style={{ display: 'block' }}>{text}</span>
            </motion.div>
          ))}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 14,
            lineHeight: 1.9,
            color: 'var(--gris)',
            maxWidth: 680,
            marginBottom: 120,
          }}
        >
          We accompany you personally through every stage of your voyage. From selecting the perfect yacht to designing your itinerary and orchestrating every detail, our experts ensure your experience transcends expectations. Your journey, our commitment.
        </motion.p>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 60 }}>
          {[
            {
              label: 'CHARTER',
              title: 'Charter a Yacht',
              desc: 'Explore yachts available for charter',
              link: 'Explore',
            },
            {
              label: 'SALES',
              title: 'Buy a Yacht',
              desc: 'Discover yachts available for sale',
              link: 'Explore',
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
              viewport={{ once: true }}
              style={{
                position: 'relative',
                padding: '40px 0',
                borderTop: '1px solid rgba(184,151,74,0.2)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-lora)',
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--or)',
                marginBottom: 24,
              }}>
                {item.label}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 32,
                fontWeight: 300,
                color: 'var(--champagne)',
                lineHeight: 1.2,
                margin: '0 0 16px',
              }}>
                {item.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-lora)',
                fontSize: 13,
                color: 'rgba(245,238,221,0.6)',
                lineHeight: 1.8,
                margin: '0 0 36px',
                maxWidth: 340,
              }}>
                {item.desc}
              </p>
              <a
                href="#fleet"
                style={{
                  fontFamily: 'var(--font-lora)',
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--or)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--or-clair)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--or)')}
              >
                {item.link}
                <svg width="16" height="1" viewBox="0 0 16 1" fill="none">
                  <line x1="0" y1="0.5" x2="16" y2="0.5" stroke="currentColor" strokeWidth="1" />
                </svg>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

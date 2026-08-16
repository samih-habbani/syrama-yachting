'use client'
import { motion, cubicBezier } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Tell us what you\'re looking for',
    description: 'Destination, dates, guests and preferences.',
  },
  {
    number: '02',
    title: 'Receive a curated selection',
    description: 'Your dedicated broker sources the most suitable available yachts.',
  },
  {
    number: '03',
    title: 'We arrange every detail',
    description: 'Itinerary, crew requests, restaurants, water toys, transfers and more.',
  },
  {
    number: '04',
    title: 'Step aboard',
    description: 'Your yacht and experience are ready.',
  },
]

export default function HowItWorks() {
  return (
    <section style={{ background: '#06090f', paddingTop: 100, paddingBottom: 100, position: 'relative', overflow: 'hidden' }}>
      {/* Section number bg */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -20,
          top: '20%',
          fontFamily: 'var(--font-cormorant)',
          fontSize: '20vw',
          fontWeight: 300,
          color: 'rgba(184,151,74,0.12)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        05
      </div>

      <div style={{ paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{ marginBottom: 80, textAlign: 'center' }}
        >
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 300,
            fontSize: 'clamp(48px, 6vw, 88px)',
            lineHeight: 1.0,
            color: '#f5eedd',
            margin: '0 0 24px',
          }}>
            Your Yacht Charter,<br />
            <em style={{ fontStyle: 'italic', color: '#d4b472' }}>Made Effortless.</em>
          </h2>

          <p style={{
            fontFamily: 'var(--font-tenor)',
            fontSize: 13,
            lineHeight: 1.9,
            color: '#6a6a5e',
            maxWidth: 600,
            margin: '0 auto',
          }}>
            From your first enquiry to embarkation, your dedicated broker coordinates every stage of your charter.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div style={{ position: 'relative', marginBottom: 80 }}>
          {/* Connecting line */}
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: 'clamp(32px, 6vw, 96px)',
              right: 'clamp(32px, 6vw, 96px)',
              height: 1,
              background: 'linear-gradient(90deg, rgba(184,151,74,0) 0%, rgba(184,151,74,0.3) 50%, rgba(184,151,74,0) 100%)',
              zIndex: 0,
            }}
          />

          {/* Steps Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 32,
            position: 'relative',
            zIndex: 1,
          }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: cubicBezier(0.25, 0.1, 0, 1) }}
                viewport={{ once: true }}
                style={{ textAlign: 'center' }}
              >
                {/* Step Number Circle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    margin: '0 auto 32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(184,151,74,0.15) 0%, rgba(212,180,114,0.05) 100%)',
                    border: '2px solid rgba(184,151,74,0.3)',
                    position: 'relative',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: i * 0.12 + 0.2 }}
                    viewport={{ once: true }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 48,
                      fontWeight: 300,
                      color: '#d4b472',
                    }}>
                      {step.number}
                    </span>
                  </motion.div>
                </div>

                {/* Step Title */}
                <h3 style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 22,
                  fontWeight: 300,
                  color: '#f5eedd',
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}>
                  {step.title}
                </h3>

                {/* Step Description */}
                <p style={{
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: '#6a6a5e',
                  margin: 0,
                }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(184,151,74,0.2), transparent)',
          marginBottom: 60,
        }} />

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center' }}
        >
          <p style={{
            fontFamily: 'var(--font-tenor)',
            fontSize: 12,
            lineHeight: 1.8,
            color: '#6a6a5e',
            maxWidth: 500,
            margin: '0 auto 32px',
          }}>
            Tell us where and when you want to charter. We'll take care of the rest.
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
              padding: '16px 40px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d4b472'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#b8974a'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Start Your Charter
          </a>
        </motion.div>
      </div>
    </section>
  )
}

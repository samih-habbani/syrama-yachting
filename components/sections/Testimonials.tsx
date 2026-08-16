'use client'
import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: 'Everything was perfectly arranged from our first message until we stepped off the yacht.',
    author: 'Michael',
    location: 'United Kingdom',
  },
  {
    quote: 'The level of attention to detail and personalized service exceeded all our expectations. An unforgettable experience.',
    author: 'Sophie & Pierre',
    location: 'France',
  },
  {
    quote: 'From selecting the perfect yacht to every moment on board, the team made our dream voyage a reality. Absolutely exceptional.',
    author: 'James',
    location: 'United States',
  },
]

function Stars() {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 20 }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ fontSize: 16 }}>⭐</span>
      ))}
    </div>
  )
}

export default function Testimonials() {
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
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 300,
            fontSize: 'clamp(48px, 6vw, 88px)',
            lineHeight: 1.0,
            color: '#f5eedd',
            margin: 0,
          }}>
            Trusted by our clients
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 40,
          marginBottom: 60,
        }}>
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: cubicBezier(0.25, 0.1, 0, 1) }}
              viewport={{ once: true, margin: '-40px' }}
              style={{
                padding: 40,
                background: 'linear-gradient(135deg, rgba(184,151,74,0.05) 0%, rgba(212,180,114,0.02) 100%)',
                border: '1px solid rgba(184,151,74,0.15)',
                position: 'relative',
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(184,151,74,0.3), transparent)',
              }} />

              {/* Stars */}
              <Stars />

              {/* Quote */}
              <blockquote style={{
                fontFamily: 'var(--font-tenor)',
                fontSize: 13,
                lineHeight: 1.8,
                color: '#f5eedd',
                fontStyle: 'italic',
                margin: '0 0 28px',
                padding: 0,
                textAlign: 'center',
              }}>
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 16,
                  fontWeight: 300,
                  color: '#d4b472',
                  marginBottom: 4,
                }}>
                  — {testimonial.author}
                </div>
                <div style={{
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#6a6a5e',
                }}>
                  {testimonial.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(184,151,74,0.2), transparent)',
        }} />
      </div>
    </section>
  )
}

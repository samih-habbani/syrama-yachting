'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const reasons = [
  {
    icon: '◆',
    title: 'Dedicated Broker',
    description: 'Your exclusive yacht specialist, available around the clock to handle every request with expertise and utmost discretion.'
  },
  {
    icon: '◈',
    title: 'Worldwide Network',
    description: 'Access to the finest handpicked yachts and premium destinations worldwide, from Mediterranean to Caribbean and beyond.'
  },
  {
    icon: '◇',
    title: 'Personal Assistance',
    description: 'Concierge services handling all details from crew selection to gourmet dining and bespoke entertainment arrangements.'
  },
  {
    icon: '◆',
    title: '24/7 Support',
    description: 'Round-the-clock availability ensuring your voyage runs seamlessly, delivering support wherever you sail globally.'
  }
]

export default function WhySyrama() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -40])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0, 1] }
    }
  }

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--noir)',
        padding: '160px 48px 120px'
      }}
    >
      {/* Background image */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          right: -200,
          width: '50%',
          height: '100%',
          backgroundImage: 'url(/assets/Syrama%20Yachting%20-%20Why%20Choose%20Us.png)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: 0,
          y: bgY
        }}
      />

      {/* Shadow overlay - deep noir left, extended all the way to right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(6,9,15,0.99) 0%, rgba(6,9,15,0.99) 30%, rgba(6,9,15,0.95) 45%, rgba(6,9,15,0.9) 60%, rgba(6,9,15,0.82) 72%, rgba(6,9,15,0.68) 85%, rgba(6,9,15,0.45) 93%, rgba(6,9,15,0.2) 99.5%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Background gradient elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: -200,
          right: -100,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(184,151,74,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          y: bgY
        }}
      />

      {/* Content */}
      <div style={{ maxWidth: 1300, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0, 1] }}
          viewport={{ once: true }}
          style={{ marginBottom: 80, textAlign: 'center' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 32
          }}>
            <div style={{ width: 32, height: 1, background: 'var(--or)' }} />
            <span style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#b8974a'
            }}>
              Why Choose Us
            </span>
            <div style={{ width: 32, height: 1, background: 'var(--or)' }} />
          </div>

          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(42px, 5vw, 72px)',
            fontWeight: 300,
            lineHeight: 1.05,
            color: 'var(--champagne)',
            margin: '0 0 32px',
            maxWidth: 800,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Why <em style={{ fontStyle: 'italic', color: 'var(--or-clair)' }}>Syrama</em> Stands Apart
          </h2>

          <p style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 14,
            lineHeight: 1.9,
            color: 'var(--gris)',
            maxWidth: 600,
            margin: '0 auto',
            letterSpacing: '0.02em'
          }}>
            Five pillars of excellence that transform your yacht charter from a vacation into an unforgettable voyage.
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 48,
            marginTop: 80
          }}
        >
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              style={{
                position: 'relative',
                paddingBottom: 32
              }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background gradient card */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(184,151,74,0.06) 0%, rgba(184,151,74,0.02) 100%)',
                  borderRadius: 8,
                  border: '1px solid rgba(184,151,74,0.15)',
                  opacity: 0
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2, padding: '32px 24px' }}>
                {/* Icon */}
                <div style={{
                  fontSize: 32,
                  color: 'var(--or-clair)',
                  marginBottom: 24,
                  lineHeight: 1
                }}>
                  {reason.icon}
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 24,
                  fontWeight: 300,
                  color: 'var(--champagne)',
                  marginBottom: 16,
                  lineHeight: 1.2,
                  minHeight: 30,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {reason.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontFamily: 'var(--font-lora)',
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: 'var(--gris)',
                  margin: 0,
                  letterSpacing: '0.01em',
                  minHeight: 'calc(1.8em * 3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start'
                }}>
                  {reason.description}
                </p>

                {/* Bottom accent line */}
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: 0,
                    height: 1,
                    background: 'linear-gradient(to right, var(--or), transparent)',
                    pointerEvents: 'none'
                  }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.1, 0, 1] }}
          viewport={{ once: true }}
          style={{
            marginTop: 100,
            textAlign: 'center',
            paddingTop: 60,
            borderTop: '1px solid rgba(184,151,74,0.1)'
          }}
        >
          <p style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 13,
            letterSpacing: '0.1em',
            color: 'var(--gris)',
            marginBottom: 24
          }}>
            Experience the difference of true luxury yacht charter
          </p>
          <a
            href="#contact"
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 11,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--noir)',
              background: 'var(--or)',
              padding: '16px 40px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--or-clair)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--or)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Begin Your Journey
          </a>
        </motion.div>
      </div>
    </section>
  )
}

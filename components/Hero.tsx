'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { motion, cubicBezier, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ParticleField = dynamic(
  () => import('@/components/three/ParticleField').then(m => ({ default: m.ParticleField })),
  { ssr: false }
)

const words = ['Tailored', 'Refined', 'Personalized']

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const videoOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60])

  // Rotating words
  useEffect(() => {
    const el = wordRef.current
    if (!el) return
    let i = 0
    const cycle = () => {
      gsap.to(el, {
        opacity: 0, y: -10, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
          i = (i + 1) % words.length
          el.textContent = words[i]
          gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' })
        },
      })
    }
    const interval = setInterval(cycle, 2800)
    return () => clearInterval(interval)
  }, [])

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } }
  const line = {
    hidden: { opacity: 0, y: 44 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: 'easeOut' as const } },
  }

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: 700,
        overflow: 'hidden',
        background: 'var(--noir)',
        display: 'flex',
      }}
    >
      {/* ── Particle field — full section background ── */}
      <ParticleField />

      {/* ── Gold line top ── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.8, delay: 0.5, ease: cubicBezier(0.25, 0.1, 0, 1) }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(to right, transparent, var(--or) 30%, var(--or-clair) 50%, var(--or) 70%, transparent)',
          transformOrigin: 'left', zIndex: 6,
        }}
      />

      {/* ── VIDEO panel — right 38% ── */}
      <motion.div
        style={{
          position: 'absolute',
          top: 60, right: 0,
          width: '38%',
          height: 'calc(100% - 60px)',
          zIndex: 2,
          overflow: 'hidden',
          scale: videoScale,
          opacity: videoOpacity,
        }}
      >
        <video
          ref={videoRef}
          src="/videos/hero-yacht-optimized.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.85) contrast(1.05)',
          }}
        />

        {/* Shadow trail — left edge of video → blends into noir */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, var(--noir) 0%, rgba(6,9,15,0.85) 18%, rgba(6,9,15,0.4) 38%, transparent 62%)',
            zIndex: 2,
          }}
        />

        {/* Bottom fade — video into section */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(to bottom, transparent, var(--noir))',
            zIndex: 3,
          }}
        />

        {/* Top fade */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '20%',
            background: 'linear-gradient(to bottom, var(--noir), transparent)',
            zIndex: 3,
          }}
        />
      </motion.div>

      {/* Right-edge vignette on the whole section */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, right: 0, width: '12%', height: '100%',
          background: 'linear-gradient(to left, rgba(6,9,15,0.5), transparent)',
          zIndex: 3,
        }}
      />

      {/* Bottom fade — full width */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%',
          background: 'linear-gradient(to bottom, transparent, var(--noir))',
          zIndex: 4,
        }}
      />

      {/* ── LEFT content ── */}
      <motion.div
        ref={containerRef}
        style={{
          position: 'relative', zIndex: 5,
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          y: contentY,
        }}
      >
        <div style={{ maxWidth: 580 }}>

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 44 }}
          >
            <div style={{ width: 32, height: 1, background: 'var(--or)' }} />
            <span className="section-label">SYRAMA · YACHT CHARTER & SALES</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, lineHeight: 1.0, margin: 0 }}
          >
            {['Luxury Yacht', 'Charter,'].map((text, i) => (
              <motion.div key={i} variants={line} style={{ overflow: 'hidden' }}>
                <span style={{
                  display: 'block',
                  fontSize: 'clamp(56px, 8.5vw, 112px)',
                  color: 'var(--champagne)',
                  letterSpacing: '-0.01em',
                }}>
                  {text}
                </span>
              </motion.div>
            ))}
            <motion.div variants={line} style={{ overflow: 'hidden' }}>
              <span style={{ display: 'block', fontSize: 'clamp(56px, 8.5vw, 112px)', letterSpacing: '-0.01em' }}>
                <span className="gold-text">
                  <span ref={wordRef}>Tailored</span>
                </span>
                {' Around You.'}
              </span>
            </motion.div>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.55, ease: cubicBezier(0.25, 0.1, 0, 1) }}
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 14,
              letterSpacing: '0.1em',
              color: 'var(--gris)',
              maxWidth: 360,
              lineHeight: 1.9,
              marginTop: 32,
            }}
          >
            Discover exceptional yachts for charter across the French Riviera, Mediterranean, Dubai and the world's most sought-after destinations.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.85, ease: cubicBezier(0.25, 0.1, 0, 1) }}
            style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 52 }}
          >
            <a
              href="#contact"
              data-cursor
              style={{
                fontFamily: 'var(--font-lora)',
                fontSize: 11,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--noir)',
                background: 'var(--or)',
                padding: '16px 40px',
                textDecoration: 'none',
                transition: 'background 0.3s ease, transform 0.3s ease',
                display: 'inline-block',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--or-clair)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--or)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              FIND A YACHT
            </a>
            <a
              href="#contact"
              style={{
                fontFamily: 'var(--font-lora)',
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gris)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--or-clair)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gris)')}
            >
              SPEAK WITH A BROKER
              <svg width="20" height="1" viewBox="0 0 20 1" fill="none">
                <line x1="0" y1="0.5" x2="20" y2="0.5" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          zIndex: 6,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-lora)', fontSize: 9,
          letterSpacing: '0.3em', color: 'var(--gris)', textTransform: 'uppercase',
        }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--or), transparent)' }}
        />
      </motion.div>
    </section>
  )
}

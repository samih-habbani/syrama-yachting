'use client'

import { motion, cubicBezier } from 'framer-motion'

// Same easing/number-treatment language already established on the site
// (see components/Experiences.tsx and components/sections/HowItWorks.tsx) —
// reused here so this section reads as part of the same design system.
const EASE = cubicBezier(0.25, 0.1, 0, 1)

interface YachtExperienceJourneyProps {
  // Reuses the exact same modal triggers as the "Request charter" / "WhatsApp us"
  // buttons already on the page — this section never owns its own booking logic.
  onRequestExperience: () => void
  onWhatsApp: () => void
}

const waterActivities = [
  { name: 'Jet Ski', image: '/assets/experiences_at_sea/jetski.webp' },
  { name: 'Seabob', image: '/assets/experiences_at_sea/seabob.webp' },
  { name: 'E-Foil', image: '/assets/experiences_at_sea/efoil.webp' },
  { name: 'Snorkeling', image: '/assets/experiences_at_sea/snorkling.webp' },
  { name: 'Diving', image: '/assets/experiences_at_sea/diving.webp' },
]

// A panel's image is optional — until dedicated photography is dropped in,
// it falls back to a soft on-brand gradient rather than a broken <img>. Once
// a real photo exists, just add its src here and the placeholder disappears.
function PanelVisual({ src, tone, imagePosition = 'center' }: { src?: string; tone: 'coast' | 'onboard' | 'toys' | 'sunset'; imagePosition?: string }) {
  const placeholderGradient = {
    coast: 'radial-gradient(120% 100% at 30% 15%, rgba(184,151,74,0.16), transparent 60%), linear-gradient(150deg, #10151d 0%, #0a0d12 65%)',
    onboard: 'radial-gradient(110% 90% at 70% 20%, rgba(212,180,114,0.14), transparent 55%), linear-gradient(160deg, #12100d 0%, #0a0d12 65%)',
    toys: 'radial-gradient(120% 100% at 20% 80%, rgba(184,151,74,0.14), transparent 55%), linear-gradient(140deg, #0d1218 0%, #0a0d12 65%)',
    sunset: 'radial-gradient(130% 90% at 50% 100%, rgba(212,150,90,0.18), transparent 60%), linear-gradient(170deg, #14100b 0%, #0a0d12 65%)',
  }[tone]

  return (
    <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', background: '#0a0d12' }}>
      {src ? (
        <motion.img
          src={src}
          alt=""
          initial={{ opacity: 0, scale: 1.12 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease: EASE }}
          viewport={{ once: true, margin: '-10%' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imagePosition, filter: 'brightness(0.7)' }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease: EASE }}
          viewport={{ once: true, margin: '-10%' }}
          style={{ width: '100%', height: '100%', background: placeholderGradient }}
        />
      )}
    </div>
  )
}

interface JourneyPanelProps {
  number: string
  title: string
  text: string
  image?: string
  imagePosition?: string
  tone: 'coast' | 'onboard' | 'toys' | 'sunset'
  reverse: boolean
}

function JourneyPanel({ number, title, text, image, imagePosition, tone, reverse }: JourneyPanelProps) {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}>
      <div
        className="w-full lg:w-[58%]"
        style={{ position: 'relative', height: 'clamp(320px, 44vw, 540px)' }}
      >
        <PanelVisual src={image} tone={tone} imagePosition={imagePosition} />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: reverse
              ? 'linear-gradient(to left, rgba(6,9,15,0.5) 0%, transparent 45%)'
              : 'linear-gradient(to right, rgba(6,9,15,0.5) 0%, transparent 45%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        viewport={{ once: true, margin: '-80px' }}
        className={`w-full lg:w-[44%] ${reverse ? 'lg:-mr-[64px]' : 'lg:-ml-[64px]'}`}
        style={{
          position: 'relative',
          zIndex: 2,
          background: 'rgba(6,9,15,0.62)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(184,151,74,0.15)',
          padding: 'clamp(28px, 4vw, 56px)',
          marginTop: '-40px',
        }}
      >
        <div
          aria-hidden
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(42px, 5vw, 68px)',
            fontWeight: 300,
            color: 'rgba(184,151,74,0.25)',
            lineHeight: 1,
            marginBottom: 12,
            userSelect: 'none',
          }}
        >
          {number}
        </div>
        <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 300, color: '#f5eedd', lineHeight: 1.25, marginBottom: 16 }}>
          {title}
        </h3>
        <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#8f8f7f', margin: 0, maxWidth: 420 }}>
          {text}
        </p>
      </motion.div>
    </div>
  )
}

function WaterActivityCard({ name, image, delay }: { name: string; image: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      viewport={{ once: true, margin: '-40px' }}
      style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4' }}
      onMouseEnter={(e) => {
        const img = e.currentTarget.querySelector('img')
        if (img) img.style.transform = 'scale(1.08)'
      }}
      onMouseLeave={(e) => {
        const img = e.currentTarget.querySelector('img')
        if (img) img.style.transform = 'scale(1)'
      }}
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.62)', transition: 'transform 1s cubic-bezier(0.25, 0.1, 0, 1)' }}
      />
      <div
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.88) 0%, rgba(6,9,15,0.15) 55%, transparent 80%)', pointerEvents: 'none' }}
      />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 14px' }}>
        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f5eedd' }}>
          {name}
        </div>
      </div>
    </motion.div>
  )
}

export default function YachtExperienceJourney({ onRequestExperience, onWhatsApp }: YachtExperienceJourneyProps) {
  return (
    <section style={{ borderTop: '1px solid rgba(184,151,74,0.12)', padding: 'clamp(64px, 9vw, 130px) clamp(24px, 6vw, 96px)', background: '#06090f' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        viewport={{ once: true }}
        className="mb-16 md:mb-24"
        style={{ textAlign: 'center', maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 32, height: 1, background: '#b8974a' }} />
          <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>The Syrama Experience</span>
          <div style={{ width: 32, height: 1, background: '#b8974a' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(36px, 4.5vw, 62px)', lineHeight: 1.1, color: '#f5eedd', margin: '0 0 20px' }}>
          Your journey, designed around you
        </h2>
        <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#8f8f7f', margin: 0 }}>
          From the destination to life on board, we design every detail of your day at sea.
        </p>
      </motion.div>

      {/* Journey */}
      <div className="space-y-24 lg:space-y-32">
        <JourneyPanel
          number="01"
          title="Design your destination"
          text="We build the itinerary around what you love — hidden coves, island-hopping, waterside restaurants only reachable by boat, a swim stop, a sunset anchorage, or several destinations in a single day."
          image="/assets/destination.webp"
          tone="coast"
          reverse={false}
        />

        <JourneyPanel
          number="02"
          title="Life on board"
          text="A private chef when the yacht allows it, curated catering, champagne on ice, music, decoration and every small request — we shape the atmosphere on board around your day, not the other way around."
          image="/assets/private-dining.webp"
          imagePosition="center 78%"
          tone="onboard"
          reverse={true}
        />

        <div>
          <JourneyPanel
            number="03"
            title="Play on the water"
            text="Jet ski at sunrise, glide above the water on an e-foil, or explore a hidden reef. Depending on your yacht and destination, we bring the right toys on board."
            image="/assets/water-sports.webp"
            tone="toys"
            reverse={false}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4" style={{ marginTop: 32 }}>
            {waterActivities.map((activity, i) => (
              <WaterActivityCard key={activity.name} name={activity.name} image={activity.image} delay={i * 0.07} />
            ))}
          </div>
        </div>

        <JourneyPanel
          number="04"
          title="Your day, your way"
          text="A family day at sea, a milestone birthday, a proposal, lunch with friends, a beach club, a sunset cruise or a full day of exploration — our team designs the day around the moment you want to create."
          image="/assets/experiences_at_sea/cruising.webp"
          tone="sunset"
          reverse={true}
        />
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        viewport={{ once: true }}
        style={{ textAlign: 'center', marginTop: 'clamp(72px, 9vw, 130px)', paddingTop: 56, borderTop: '1px solid rgba(184,151,74,0.12)' }}
      >
        <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(28px, 3.5vw, 44px)', color: '#f5eedd', margin: '0 0 16px' }}>
          Let us design your day at sea
        </h3>
        <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#8f8f7f', maxWidth: 460, margin: '0 auto 36px' }}>
          Tell us what you have in mind. We&rsquo;ll take care of the yacht, the itinerary and everything in between.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onRequestExperience}
            style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '16px 40px', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#d4b472'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#b8974a'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Design my experience
          </button>
          <button
            type="button"
            onClick={onWhatsApp}
            style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#b8974a', background: 'transparent', padding: '16px 40px', border: '1px solid rgba(184,151,74,0.3)', cursor: 'pointer', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,151,74,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            WhatsApp us
          </button>
        </div>
      </motion.div>
    </section>
  )
}

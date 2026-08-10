'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -40])

  const [focused, setFocused] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const inputStyle = (name: string) => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${focused === name ? 'var(--or-clair)' : 'rgba(184,151,74,0.2)'}`,
    padding: '14px 0',
    fontFamily: 'var(--font-lora)',
    fontSize: 14,
    color: 'var(--champagne)',
    outline: 'none',
    letterSpacing: '0.05em',
    transition: 'border-color 0.3s ease',
  })

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ position: 'relative', overflow: 'hidden', background: 'var(--noir)' }}
    >
      {/* Background image */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <motion.img
          src="/images/Samih HABBANI - Syrama Yachting.JPG"
          alt=""
          aria-hidden
          loading="lazy"
          style={{
            position: 'absolute', inset: '-10%', width: '100%', height: '120%',
            objectFit: 'cover', objectPosition: 'center bottom',
            filter: 'brightness(0.15) contrast(1.1)',
            y: bgY,
          } as any}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--noir) 0%, rgba(6,9,15,0.6) 40%, var(--noir) 100%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1300, margin: '0 auto', padding: '160px 48px 120px' }}>

        {/* ── Top header row: title left, contact channels right ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 80, alignItems: 'end' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0, 1] }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
              <div style={{ width: 32, height: 1, background: 'var(--or)' }} />
              <span className="section-label">Private Contact</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)', fontWeight: 300,
              fontSize: 'clamp(42px, 5vw, 72px)', lineHeight: 1.05,
              color: 'var(--champagne)', margin: '0 0 32px',
            }}>
              Your next<br />
              voyage begins<br />
              <em style={{ fontStyle: 'italic', color: 'var(--or-clair)' }}>here.</em>
            </h2>
            <p style={{
              fontFamily: 'var(--font-lora)', fontSize: 14, lineHeight: 1.9,
              color: 'var(--gris)', maxWidth: 400,
            }}>
              Every request is handled by a dedicated advisor within 2 hours. No intermediaries — you speak directly with our team.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.1, 0, 1] }}
            viewport={{ once: true }}
            style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
          >
            {[
              { label: 'Private WhatsApp', val: '+971 50 554 8034' },
              { label: 'Confidential Email', val: 'contact@syrama.ae' },
              { label: 'Availability', val: '24h/24 · 7j/7 · 365j/an' },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '24px 0', borderBottom: '1px solid rgba(184,151,74,0.08)' }}>
                <span style={{ fontFamily: 'var(--font-lora)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gris)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontWeight: 300, color: 'var(--or-clair)' }}>{val}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(184,151,74,0.25) 30%, rgba(184,151,74,0.25) 70%, transparent)', marginBottom: 80 }} />

        {/* ── Bottom row: founder card left, form right ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 80, alignItems: 'stretch' }}>

          {/* Founder card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            viewport={{ once: true }}
            style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Gold top line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 2,
              background: 'linear-gradient(to right, var(--or) 0%, var(--or-clair) 50%, transparent 100%)',
            }} />
            {/* Cross mark */}
            <div style={{
              position: 'absolute', top: 14, right: 14, zIndex: 3,
              width: 26, height: 26, border: '1px solid rgba(184,151,74,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <line x1="5" y1="0" x2="5" y2="10" stroke="var(--or)" strokeWidth="0.8"/>
                <line x1="0" y1="5" x2="10" y2="5" stroke="var(--or)" strokeWidth="0.8"/>
              </svg>
            </div>
            {/* Photo */}
            <img
              src="/images/Samih HABBANI - Syrama Yachting.JPG"
              alt="Founder — Syrama Yachting"
              style={{
                width: '100%', height: '100%', minHeight: 500, objectFit: 'cover', objectPosition: 'center center',
                display: 'block',
                filter: 'brightness(0.6) contrast(1.1) saturate(0.85)',
              }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(6,9,15,0.95) 0%, rgba(6,9,15,0.35) 45%, transparent 72%)',
            }} />
            {/* Text */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '22px 22px 20px' }}>
              <div style={{
                fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: 'var(--or)',
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
              }}>
                <div style={{ width: 16, height: 1, background: 'var(--or)' }} />
                Founder & CEO
              </div>
              <div style={{
                fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 300,
                color: 'var(--champagne)', lineHeight: 1.15, marginBottom: 16,
              }}>
                Sam<br />Habbani
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <a
                  href="https://www.instagram.com/syrama_services/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'rgba(245,238,221,0.55)',
                    textDecoration: 'none', paddingBottom: 3,
                    borderBottom: '1px solid rgba(184,151,74,0.3)',
                  }}
                >
                  Instagram
                </a>
                <a
                  href="https://www.linkedin.com/in/samih-habbani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'rgba(245,238,221,0.55)',
                    textDecoration: 'none', paddingBottom: 3,
                    borderBottom: '1px solid rgba(184,151,74,0.3)',
                  }}
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0, 1] }}
            viewport={{ once: true }}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '80px 40px' }}
              >
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 20, color: 'var(--or-clair)', letterSpacing: '0.2em', marginBottom: 16 }}>◈</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 32, fontWeight: 300, color: 'var(--champagne)', marginBottom: 16 }}>
                  Request received.
                </div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--gris)', lineHeight: 1.8 }}>
                  An advisor will contact you within 2 hours.
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={e => { e.preventDefault(); setSubmitted(true) }}
                style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gris)' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alexander"
                      onFocus={() => setFocused('prenom')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle('prenom'), display: 'block', marginTop: 8 } as any}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gris)' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      onFocus={() => setFocused('nom')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle('nom'), display: 'block', marginTop: 8 } as any}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gris)' }}>
                    Type of request
                  </label>
                  <select
                    onFocus={() => setFocused('type')}
                    onBlur={() => setFocused(null)}
                    style={{ ...inputStyle('type'), display: 'block', marginTop: 8, appearance: 'none' } as any}
                  >
                    <option value="" style={{ background: 'var(--bleu-nuit)' }}>Select...</option>
                    {['Yacht Charter', 'Yacht Sales', 'Concierge Services', 'Bespoke Request'].map(o => (
                      <option key={o} value={o} style={{ background: 'var(--bleu-nuit)' }}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gris)' }}>
                    Your request
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your project..."
                    onFocus={() => setFocused('msg')}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputStyle('msg'),
                      display: 'block', marginTop: 8,
                      resize: 'none', lineHeight: 1.8,
                    } as any}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'var(--or)',
                    color: 'var(--noir)',
                    fontFamily: 'var(--font-lora)',
                    fontSize: 11,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    padding: '18px 40px',
                    border: 'none',
                    alignSelf: 'flex-start',
                    transition: 'background 0.3s ease, transform 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--or-clair)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--or)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  Send request
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid rgba(184,151,74,0.1)',
        padding: '32px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
          © 2026 · Syrama · All rights reserved
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Instagram', 'WhatsApp', 'Privacy'].map(l => (
            <a key={l} href="#" style={{ fontFamily: 'var(--font-lora)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--or)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              {l}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

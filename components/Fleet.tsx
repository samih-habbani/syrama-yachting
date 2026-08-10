'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { yachts } from '@/lib/yachts-data'

export default function Fleet() {
  const [activeTab, setActiveTab] = useState<'charter' | 'sale'>('charter')
  const filtered = yachts.filter(y => y.type === activeTab)

  return (
    <section style={{ background: '#06090f', minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{ marginBottom: 80 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>Exclusive Fleet</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 60 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.0, color: '#f5eedd', margin: 0 }}>Our vessels.</h2>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#6a6a5e', margin: '0 0 20px' }}>Handpicked superyachts for charter and acquisition. Each vessel represents the pinnacle of maritime luxury, impeccably maintained and staffed by elite crews.</p>
            </div>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', gap: 24 }}>
            {(['charter', 'sale'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  color: activeTab === tab ? '#b8974a' : '#6a6a5e',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #b8974a' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                {tab === 'charter' ? 'Charter' : 'For Sale'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Yacht Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 40, marginBottom: 80 }}>
          {filtered.map((yacht, i) => (
            <motion.div
              key={yacht.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.25, 0.1, 0, 1] }}
              viewport={{ once: true, margin: '-40px' }}
            >
              <div style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
                  <img
                    src={yacht.image}
                    alt={yacht.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.75)',
                      transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.85) 0%, transparent 60%)' }} />

                  <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2 }}>
                      {yacht.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 4 }}>
                      {yacht.length} · {yacht.builder}
                    </div>
                  </div>

                  <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.6)', background: 'rgba(6,9,15,0.5)', padding: '6px 10px' }}>
                    View →
                  </div>
                </div>

                <div style={{ padding: '18px 0', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
                  <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 11, letterSpacing: '0.1em', color: '#6a6a5e', marginBottom: 12 }}>
                    {activeTab === 'charter' ? `${yacht.guests} · ${yacht.cabins} · ${yacht.speed}` : `${yacht.guests} · Built ${yacht.year}`}
                  </div>
                  <div style={{ display: 'flex', gap: 28 }}>
                    {activeTab === 'charter' ? (
                      <>
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Length</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>{yacht.length}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Guests</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>{yacht.guests}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Rate</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>{yacht.price}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Length</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>{yacht.length}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Builder</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>{yacht.builder}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(106,106,94,0.5)', marginBottom: 4 }}>Price</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, fontWeight: 300, color: '#d4b472' }}>{yacht.price}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 300, color: '#f5eedd', marginBottom: 16 }}>
            {activeTab === 'charter' ? 'Ready to set sail?' : 'Interested in acquisition?'}
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, lineHeight: 1.8, color: '#6a6a5e', maxWidth: 480, margin: '0 auto 32px' }}>
            {activeTab === 'charter'
              ? 'Contact our concierge team to arrange your bespoke voyage.'
              : 'Speak with our brokers about purchasing opportunities and investment potential.'}
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
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}

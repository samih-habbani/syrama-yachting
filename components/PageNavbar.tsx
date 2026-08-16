'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PageNavbarProps {
  showBackButton?: boolean
}

export default function PageNavbar({ showBackButton = true }: PageNavbarProps) {
  const router = useRouter()

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 48px',
      background: 'rgba(6,9,15,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(184,151,74,0.2)'
    }}>
      {/* Left: Back button (if needed) + Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {showBackButton && (
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'rgba(245,238,221,0.6)',
              cursor: 'pointer',
              transition: 'color 0.3s',
              fontFamily: 'var(--font-lora)',
              fontSize: 9,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              padding: 0
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#b8974a')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,238,221,0.6)')}
          >
            <svg width="20" height="1" viewBox="0 0 20 1" fill="none">
              <line x1="20" y1="0.5" x2="0" y2="0.5" stroke="currentColor" strokeWidth="1"/>
            </svg>
            Back
          </button>
        )}

        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: '0.3em',
            color: '#f5eedd'
          }}>
            SYRAMA
          </div>
          <div style={{
            fontFamily: 'var(--font-tenor)',
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#9a9a8e',
            marginTop: 2
          }}>
            Yachting
          </div>
        </Link>
      </div>

      {/* Right: Contact button */}
      <Link
        href="/#contact"
        style={{
          fontFamily: 'var(--font-tenor)',
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#06090f',
          background: 'linear-gradient(135deg, #b8974a, #d4b472)',
          padding: '12px 24px',
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(184,151,74,0.35)'
        }}
      >
        Contact Us
      </Link>
    </nav>
  )
}

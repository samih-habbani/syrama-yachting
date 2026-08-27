'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Login failed')
        return
      }

      // Wait a bit for cookie to be set, then redirect
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push('/admin/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: 'var(--font-lora)',
    fontSize: 13,
    color: '#f5eedd',
    background: 'rgba(6,9,15,0.5)',
    border: '1px solid rgba(184,151,74,0.2)',
    borderRadius: 7,
    padding: '12px 14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  return (
    <div
      style={{
        minHeight: '100vh', background: '#06090f', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,151,74,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 28, fontWeight: 400, letterSpacing: '0.08em', color: '#f5eedd' }}>
            SYRAMA
          </div>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10, letterSpacing: '0.28em', color: '#8f8f7f', marginTop: 4 }}>
            ADMINISTRATION
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(184,151,74,0.06) 0%, rgba(212,180,114,0.02) 100%)',
            border: '1px solid rgba(184,151,74,0.15)',
            borderRadius: 12,
            padding: 36,
          }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: 9, margin: '0 auto 20px',
              background: 'rgba(184,151,74,0.1)', border: '1px solid rgba(184,151,74,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Lock size={17} color="#d4b472" strokeWidth={1.75} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 24, color: '#f5eedd', textAlign: 'center', margin: '0 0 28px' }}>
            Sign in to continue
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8f8f7f', display: 'block', marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.2)')}
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8f8f7f', display: 'block', marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={fieldStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.6)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.2)')}
                required
              />
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080',
                  padding: '11px 14px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 12.5, marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em',
                color: '#06090f', background: '#b8974a', border: 'none', borderRadius: 7,
                padding: '13px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#d4b472' }}
              onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#b8974a' }}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#6b6b60', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#d4b472')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6b60')}
          >
            <ArrowLeft size={13} strokeWidth={2} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Login failed')
        return
      }

      // Wait a bit for cookie to be set, then redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/admin/dashboard/yachts')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#06090f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0f1419] border border-[#b8974a] border-opacity-20 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-8" style={{ fontFamily: 'var(--font-tenor)' }}>
            Admin Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-[#b8974a] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-30 rounded px-4 py-2 text-white focus:outline-none focus:border-opacity-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#b8974a] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-30 rounded px-4 py-2 text-white focus:outline-none focus:border-opacity-100"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#b8974a] text-[#06090f] font-bold py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-gray-400 hover:text-[#b8974a] text-sm transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

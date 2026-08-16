'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/yachts?page=1&limit=10')
      if (response.status === 401) {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06090f] flex items-center justify-center">
        <div className="text-[#b8974a]" style={{ fontFamily: 'var(--font-tenor)' }}>Loading...</div>
      </div>
    )
  }

  const isYachtPage = pathname.includes('/yachts')
  const isUserPage = pathname.includes('/users')

  return (
    <div className="min-h-screen bg-[#06090f]">
      {/* Top Navigation */}
      <nav className="border-b border-[#b8974a] border-opacity-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition">
            <div>
              <h1 className="text-2xl font-bold text-[#b8974a]" style={{ fontFamily: 'var(--font-tenor)' }}>
                Administration
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage your fleet</p>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-400 hover:text-[#b8974a] transition text-sm font-light tracking-wider"
            >
              BACK TO SITE
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-[#b8974a] transition text-sm font-light tracking-wider"
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="border-t border-[#b8974a] border-opacity-20">
          <div className="max-w-7xl mx-auto px-8 flex gap-8">
            <Link
              href="/admin/dashboard/yachts"
              className={`py-4 text-sm tracking-wider transition ${
                isYachtPage
                  ? 'text-[#b8974a] border-b-2 border-[#b8974a]'
                  : 'text-gray-500 hover:text-[#b8974a]'
              }`}
            >
              YACHTS
            </Link>
            <Link
              href="/admin/dashboard/reservations"
              className={`py-4 text-sm tracking-wider transition ${
                pathname.includes('/reservations')
                  ? 'text-[#b8974a] border-b-2 border-[#b8974a]'
                  : 'text-gray-500 hover:text-[#b8974a]'
              }`}
            >
              RESERVATIONS
            </Link>
            <Link
              href="/admin/dashboard/clients"
              className={`py-4 text-sm tracking-wider transition ${
                pathname.includes('/clients')
                  ? 'text-[#b8974a] border-b-2 border-[#b8974a]'
                  : 'text-gray-500 hover:text-[#b8974a]'
              }`}
            >
              CLIENTS
            </Link>
            <Link
              href="/admin/dashboard/users"
              className={`py-4 text-sm tracking-wider transition ${
                isUserPage
                  ? 'text-[#b8974a] border-b-2 border-[#b8974a]'
                  : 'text-gray-500 hover:text-[#b8974a]'
              }`}
            >
              USERS
            </Link>
            <Link
              href="/admin/dashboard/calendar"
              className={`py-4 text-sm tracking-wider transition ${
                pathname.includes('/calendar')
                  ? 'text-[#b8974a] border-b-2 border-[#b8974a]'
                  : 'text-gray-500 hover:text-[#b8974a]'
              }`}
            >
              CALENDAR
            </Link>
            <Link
              href="/admin/dashboard/messages"
              className={`py-4 text-sm tracking-wider transition ${
                pathname.includes('/messages')
                  ? 'text-[#b8974a] border-b-2 border-[#b8974a]'
                  : 'text-gray-500 hover:text-[#b8974a]'
              }`}
            >
              MESSAGES
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {children}
      </main>
    </div>
  )
}

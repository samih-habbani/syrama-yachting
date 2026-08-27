'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/admin/ui/Sidebar'

interface SessionUser {
  name: string | null
  email: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      if (!data.isAuthenticated) {
        router.push('/admin/login')
        return
      }
      setUser(data.user ?? null)
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06090f] flex items-center justify-center">
        <div className="text-[#b8974a]" style={{ fontFamily: 'var(--font-lora)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#06090f' }}>
      <Sidebar user={user} onLogout={handleLogout} />
      <main style={{ flex: 1, minWidth: 0, padding: '36px 44px 60px' }}>
        {children}
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sailboat, CalendarCheck, Contact, MessageSquare, ShieldUser, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/admin/ui/PageHeader'
import StatCard from '@/components/admin/ui/StatCard'
import Card from '@/components/admin/ui/Card'

interface Stats {
  yachts: number
  reservations: number
  clients: number
  unreadMessages: number
  users: number
}

const SHORTCUTS = [
  { label: 'Manage Yachts', description: 'Add, edit or remove fleet listings', href: '/admin/dashboard/yachts', icon: Sailboat },
  { label: 'Reservations', description: 'Review and confirm bookings', href: '/admin/dashboard/reservations', icon: CalendarCheck },
  { label: 'Client Messages', description: 'Respond to enquiries', href: '/admin/dashboard/messages', icon: MessageSquare },
]

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [yachtsRes, reservationsRes, clientsRes, messagesRes, usersRes] = await Promise.all([
          fetch('/api/admin/yachts?limit=1'),
          fetch('/api/reservations?limit=1'),
          fetch('/api/clients?limit=1'),
          fetch('/api/messages?limit=1&status=unread'),
          fetch('/api/admin/users'),
        ])
        const [yachtsData, reservationsData, clientsData, messagesData, usersData] = await Promise.all([
          yachtsRes.json(),
          reservationsRes.json(),
          clientsRes.json(),
          messagesRes.json(),
          usersRes.json(),
        ])
        setStats({
          yachts: yachtsData.total ?? 0,
          reservations: reservationsData.total ?? 0,
          clients: clientsData.total ?? 0,
          unreadMessages: messagesData.total ?? 0,
          users: Array.isArray(usersData) ? usersData.length : 0,
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <PageHeader
        title="Overview"
        description="A snapshot of your fleet, bookings and clients."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 18, marginBottom: 40 }}>
        <StatCard label="Yachts" value={stats?.yachts ?? '—'} icon={Sailboat} tone="gold" />
        <StatCard label="Reservations" value={stats?.reservations ?? '—'} icon={CalendarCheck} tone="blue" />
        <StatCard label="Clients" value={stats?.clients ?? '—'} icon={Contact} tone="green" />
        <StatCard label="Unread Messages" value={stats?.unreadMessages ?? '—'} icon={MessageSquare} tone={stats && stats.unreadMessages > 0 ? 'red' : 'neutral'} />
        <StatCard label="Admin Users" value={stats?.users ?? '—'} icon={ShieldUser} tone="neutral" />
      </div>

      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 16 }}>
        Quick Actions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {SHORTCUTS.map((shortcut) => {
          const Icon = shortcut.icon
          return (
            <Link key={shortcut.href} href={shortcut.href} style={{ textDecoration: 'none' }}>
              <Card hoverable style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                <div
                  style={{
                    width: 42, height: 42, borderRadius: 9, flexShrink: 0,
                    background: 'rgba(184,151,74,0.1)', border: '1px solid rgba(184,151,74,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={19} color="#d4b472" strokeWidth={1.75} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd' }}>
                    {shortcut.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f', marginTop: 2 }}>
                    {shortcut.description}
                  </div>
                </div>
                <ArrowRight size={16} color="#5a5a52" strokeWidth={2} />
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

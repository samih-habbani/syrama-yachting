'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Sailboat, CalendarCheck, Calendar, Contact,
  MessageSquare, ShieldUser, ExternalLink, LogOut, Building2,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
  match?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard, match: '/admin/dashboard$' },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Yachts', href: '/admin/dashboard/yachts', icon: Sailboat, match: '/yachts' },
      { label: 'Reservations', href: '/admin/dashboard/reservations', icon: CalendarCheck, match: '/reservations' },
      { label: 'Calendar', href: '/admin/dashboard/calendar', icon: Calendar, match: '/calendar' },
    ],
  },
  {
    label: 'Clients',
    items: [
      { label: 'Clients', href: '/admin/dashboard/clients', icon: Contact, match: '/clients' },
      { label: 'Messages', href: '/admin/dashboard/messages', icon: MessageSquare, match: '/messages' },
    ],
  },
  {
    label: 'Network',
    items: [
      { label: 'Providers', href: '/admin/dashboard/providers', icon: Building2, match: '/providers' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', href: '/admin/dashboard/users', icon: ShieldUser, match: '/users' },
    ],
  },
]

function isActive(pathname: string, item: NavItem) {
  if (item.match === '/admin/dashboard$') return pathname === '/admin/dashboard'
  return item.match ? pathname.includes(item.match) : false
}

export default function Sidebar({
  user, onLogout,
}: {
  user: { name: string | null; email: string } | null
  onLogout: () => void
}) {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 248,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#080b12',
        borderRight: '1px solid rgba(184,151,74,0.1)',
      }}
    >
      {/* Brand */}
      <Link href="/" style={{ textDecoration: 'none', display: 'block', padding: '26px 24px 22px' }}>
        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontWeight: 400, letterSpacing: '0.08em', color: '#f5eedd' }}>
          SYRAMA
        </div>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10, letterSpacing: '0.28em', color: '#8f8f7f', marginTop: 2 }}>
          ADMINISTRATION
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 14px' }}>
        {NAV.map((group) => (
          <div key={group.label} style={{ marginBottom: 22 }}>
            <div
              style={{
                fontFamily: 'var(--font-lora)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a5a52',
                padding: '0 10px', marginBottom: 8,
              }}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = isActive(pathname, item)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '9px 12px', borderRadius: 7, marginBottom: 2,
                    fontFamily: 'var(--font-lora)', fontSize: 13, fontWeight: active ? 600 : 500,
                    color: active ? '#f5eedd' : '#8f8f7f',
                    background: active ? 'linear-gradient(135deg, rgba(184,151,74,0.16) 0%, rgba(184,151,74,0.05) 100%)' : 'transparent',
                    border: active ? '1px solid rgba(184,151,74,0.25)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(245,238,221,0.04)'; e.currentTarget.style.color = '#d8d8cc' } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8f8f7f' } }}
                >
                  <Icon size={16} strokeWidth={1.75} color={active ? '#d4b472' : '#75756a'} style={{ flexShrink: 0 }} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User + actions */}
      <div style={{ borderTop: '1px solid rgba(184,151,74,0.1)', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 6 }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #d4b472, #b8974a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: 700, color: '#06090f',
            }}
          >
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 600, color: '#f5eedd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: '#6b6b60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </div>
          </div>
        </div>

        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 7,
            fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', textDecoration: 'none',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,238,221,0.04)'; e.currentTarget.style.color = '#d8d8cc' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8f8f7f' }}
        >
          <ExternalLink size={16} strokeWidth={1.75} color="#75756a" />
          Back to site
        </Link>
        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 7,
            fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', background: 'transparent', border: 'none',
            cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,94,94,0.08)'; e.currentTarget.style.color = '#e08080' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8f8f7f' }}
        >
          <LogOut size={16} strokeWidth={1.75} />
          Logout
        </button>
      </div>
    </aside>
  )
}

'use client'
import { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

export default function PageHeader({
  title, description, breadcrumbs, action,
}: {
  title: string
  description?: string
  breadcrumbs?: Crumb[]
  action?: ReactNode
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <ChevronRight size={12} color="#5a5a52" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#d4b472')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#8f8f7f')}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#d4b472' }}>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 34, color: '#f5eedd', margin: 0, lineHeight: 1.15 }}>
            {title}
          </h1>
          {description && (
            <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '8px 0 0' }}>
              {description}
            </p>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
    </div>
  )
}

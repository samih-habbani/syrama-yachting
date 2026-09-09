// Small, visible breadcrumb trail — plain server-rendered links, no client
// JS needed. Kept visually minimal (same gold/uppercase eyebrow style used
// across the site, e.g. "Exclusive Fleet" labels) so it reads as navigation
// rather than a new design element. Also used to build the matching
// BreadcrumbList JSON-LD passed in from the page (see lib/breadcrumb.ts).
import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumbs({ items, overlay = false }: { items: BreadcrumbItem[]; overlay?: boolean }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        padding: overlay ? 0 : '18px clamp(24px, 6vw, 96px) 0',
        fontFamily: 'var(--font-tenor)',
        fontSize: 10,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}
    >
      <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.href ? (
              <Link
                href={item.href}
                style={{
                  color: overlay ? 'rgba(245,238,221,0.85)' : '#8f8f7f',
                  textDecoration: 'none',
                  textShadow: overlay ? '0 1px 4px rgba(0,0,0,0.6)' : undefined,
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{ color: '#d4b472', textShadow: overlay ? '0 1px 4px rgba(0,0,0,0.6)' : undefined }}
                aria-current="page"
              >
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <span style={{ color: overlay ? 'rgba(212,180,114,0.5)' : 'rgba(184,151,74,0.4)' }}>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

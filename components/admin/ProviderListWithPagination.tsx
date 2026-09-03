'use client'

import { Pencil, Trash2, Building2, Mail, Phone, Globe, FolderOpen } from 'lucide-react'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Pagination from './ui/Pagination'
import EmptyState from './ui/EmptyState'
import ActionsMenu from './ui/ActionsMenu'
import type { Provider } from './ProviderForm'

interface ProviderRow extends Provider {
  id: number
}

interface ProviderListProps {
  providers: ProviderRow[]
  currentPage: number
  totalPages: number
  onEdit: (provider: ProviderRow) => void
  onDelete: (id: number) => void
  onPageChange: (page: number) => void
}

const GRID = '1.8fr 1fr 1fr 1.5fr 1.4fr 0.8fr 44px'

// The imported dataset used dash-only strings ('-', '--', ...) as a "no
// value" placeholder, inconsistently — treat any of them as empty.
const isPlaceholder = (v?: string | null): v is undefined | null | '' => !v || /^-+$/.test(v.trim())
const real = (v?: string | null) => (isPlaceholder(v) ? null : v)

// Display-only formatting — prepend "+" to a phone number that's missing
// it, without touching the stored value (some rows already have it, e.g.
// "+33 6 ...", others were saved as plain "33 6 ..." or "06 52 ...").
const formatPhone = (v: string) => (v.trim().startsWith('+') ? v : `+${v.trim()}`)

export default function ProviderListWithPagination({
  providers, currentPage, totalPages, onEdit, onDelete, onPageChange,
}: ProviderListProps) {
  if (providers.length === 0) {
    return (
      <Card>
        <EmptyState icon={Building2} title="No providers found" description="Try adjusting your filters or add a new provider." />
      </Card>
    )
  }

  return (
    <Card style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center',
          padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)',
          fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f',
        }}
      >
        <div>Provider</div>
        <div>Type</div>
        <div>Location</div>
        <div>Contact</div>
        <div>Services</div>
        <div>Status</div>
        <div />
      </div>

      {providers.map((provider) => {
        // firstName/name sometimes hold the same value, or either can be
        // empty — join only the distinct, real parts instead of guessing.
        const nameParts = Array.from(new Set([provider.firstName, provider.name].map(real).filter((v): v is string => !!v)))
        const displayName = nameParts.join(' ') || 'Unnamed'
        const initial = displayName.charAt(0).toUpperCase()
        const location = [real(provider.city), real(provider.region)].filter((v): v is string => !!v).join(', ')
        const company = real(provider.company)
        const type = real(provider.type)
        const email = real(provider.email)
        const phone = real(provider.phone)
        const website = real(provider.website)
        const catalogUrl = real(provider.catalogUrl)
        const services = (provider.services || []).map(real).filter((v): v is string => !!v)

        return (
          <div
            key={provider.id}
            style={{
              display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center',
              padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(184,151,74,0.18), rgba(184,151,74,0.06))',
                  border: '1px solid rgba(184,151,74,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 700, color: '#d4b472',
                }}
              >
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {company || '—'}
                </div>
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {type || '—'}
            </div>

            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location || '—'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              {email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Mail size={11} strokeWidth={1.75} style={{ flexShrink: 0 }} />{email}
                </span>
              )}
              {phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Phone size={11} strokeWidth={1.75} style={{ flexShrink: 0 }} />{formatPhone(phone)}
                </span>
              )}
              {website && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Globe size={11} strokeWidth={1.75} style={{ flexShrink: 0 }} />{website}
                </span>
              )}
              {catalogUrl && (
                <a
                  href={catalogUrl.startsWith('http') ? catalogUrl : `https://${catalogUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#d4b472', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  <FolderOpen size={11} strokeWidth={1.75} style={{ flexShrink: 0 }} />Catalog
                </a>
              )}
              {!email && !phone && !website && !catalogUrl && (
                <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#5a5a52' }}>—</span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {services.slice(0, 2).map((s) => (
                <Badge key={s} tone="neutral">{s}</Badge>
              ))}
              {services.length > 2 && (
                <Badge tone="neutral">+{services.length - 2}</Badge>
              )}
            </div>

            <div>
              <Badge tone={provider.isActive === false ? 'red' : 'green'} dot>
                {provider.isActive === false ? 'Inactive' : 'Active'}
              </Badge>
            </div>

            <ActionsMenu
              items={[
                { label: 'Edit', icon: <Pencil size={13.5} strokeWidth={1.75} />, onClick: () => onEdit(provider) },
                { label: 'Delete', icon: <Trash2 size={13.5} strokeWidth={1.75} />, onClick: () => onDelete(provider.id), tone: 'danger' },
              ]}
            />
          </div>
        )
      })}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </Card>
  )
}

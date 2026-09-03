'use client'

import { useState } from 'react'
import { Pencil, Trash2, Images, Sailboat } from 'lucide-react'
import MediaManager from './MediaManager'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Pagination from './ui/Pagination'
import EmptyState from './ui/EmptyState'
import ActionsMenu from './ui/ActionsMenu'

interface Yacht {
  id: number
  model: string
  builder?: string | null
  length: number
  cabins: number
  maxGuests?: number | null
  region?: string | null
  priceDay?: number | null
  currency?: string | null
  status?: string | null
  available: boolean
  providerId?: number | null
  provider?: { id: number; name?: string | null; firstName?: string | null; company?: string | null } | null
  media?: { id: number; url: string; alt?: string | null }[]
}

interface YachtListProps {
  yachts: Yacht[]
  currentPage: number
  totalPages: number
  onEdit: (yacht: Yacht) => void
  onDelete: (id: number) => void
  onPageChange: (page: number) => void
}

const GRID = '2fr 0.9fr 1fr 1fr 1.2fr 0.9fr 44px'

function providerLabel(provider?: Yacht['provider']): string | null {
  if (!provider) return null
  return [provider.firstName, provider.name].filter(Boolean).join(' ') || provider.company || null
}

function statusTone(status?: string | null): 'gold' | 'blue' {
  return (status || '').toLowerCase() === 'vente' || (status || '').toLowerCase() === 'sale' ? 'blue' : 'gold'
}

export default function YachtListWithPagination({
  yachts, currentPage, totalPages, onEdit, onDelete, onPageChange,
}: YachtListProps) {
  const [expandedYachtId, setExpandedYachtId] = useState<number | null>(null)

  if (yachts.length === 0) {
    return (
      <Card>
        <EmptyState icon={Sailboat} title="No yachts found" description="Try adjusting your filters or add a new yacht." />
      </Card>
    )
  }

  return (
    <Card style={{ overflow: 'hidden' }}>
      {/* Header row */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center',
          padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)',
          fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f',
        }}
      >
        <div>Yacht</div>
        <div>Type</div>
        <div>Length / Cabins</div>
        <div>Region</div>
        <div>Provider</div>
        <div>Rate</div>
        <div />
      </div>

      {yachts.map((yacht) => {
        const expanded = expandedYachtId === yacht.id
        return (
          <div key={yacht.id} style={{ borderBottom: '1px solid rgba(184,151,74,0.08)' }}>
            <div
              style={{
                display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center',
                padding: '14px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                {yacht.media?.[0]?.url ? (
                  <img
                    src={`/uploads/yachts/${yacht.media[0].url}`}
                    alt={yacht.model}
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(184,151,74,0.15)', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(184,151,74,0.06)', border: '1px solid rgba(184,151,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sailboat size={16} color="#5a5a52" strokeWidth={1.5} />
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {yacht.model}
                  </div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {yacht.builder || '—'}
                  </div>
                </div>
              </div>

              <div>
                <Badge tone={statusTone(yacht.status)} dot>
                  {statusTone(yacht.status) === 'blue' ? 'For Sale' : 'Charter'}
                </Badge>
              </div>

              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc' }}>
                {yacht.length}m · {yacht.cabins} cab
              </div>

              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {yacht.region || '—'}
              </div>

              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: providerLabel(yacht.provider) ? '#d8d8cc' : '#5a5a52', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {providerLabel(yacht.provider) || 'Unlinked'}
              </div>

              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc' }}>
                {yacht.priceDay ? `${yacht.priceDay.toLocaleString()} ${yacht.currency || 'EUR'}` : '—'}
              </div>

              <ActionsMenu
                items={[
                  { label: 'Edit', icon: <Pencil size={13.5} strokeWidth={1.75} />, onClick: () => onEdit(yacht) },
                  { label: expanded ? 'Hide Images' : 'Manage Images', icon: <Images size={13.5} strokeWidth={1.75} />, onClick: () => setExpandedYachtId(expanded ? null : yacht.id) },
                  { label: 'Delete', icon: <Trash2 size={13.5} strokeWidth={1.75} />, onClick: () => onDelete(yacht.id), tone: 'danger' },
                ]}
              />
            </div>

            {expanded && (
              <div style={{ padding: '0 24px 24px' }}>
                <div style={{ padding: 20, borderRadius: 8, background: 'rgba(6,9,15,0.4)', border: '1px solid rgba(184,151,74,0.1)' }}>
                  <MediaManager yachtId={yacht.id} media={yacht.media || []} />
                </div>
              </div>
            )}
          </div>
        )
      })}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </Card>
  )
}

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
  priceHour?: number | null
  priceWeek?: number | null
  priceSale?: number | null
  b2bPrice?: number | null
  minRentalHours?: number | null
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

const GRID = '1.8fr 0.8fr 1fr 0.9fr 1.1fr 0.95fr 0.95fr 44px'

// The imported provider dataset used dash-only strings ('-', '--', ...) as
// a "no value" placeholder — treat them as empty, same convention as the
// Providers admin pages, so a yacht doesn't end up showing "- -" here.
const isPlaceholder = (v: string) => /^-+$/.test(v.trim())
const realStr = (v?: string | null) => (v && !isPlaceholder(v) ? v : null)

function providerLabel(provider?: Yacht['provider']): string | null {
  if (!provider) return null
  return [realStr(provider.firstName), realStr(provider.name)].filter(Boolean).join(' ') || realStr(provider.company) || null
}

function statusTone(status?: string | null): 'gold' | 'blue' {
  return (status || '').toLowerCase() === 'vente' || (status || '').toLowerCase() === 'sale' ? 'blue' : 'gold'
}

// Sell price for the list's Price column — whichever of day/week/hour is
// actually set (a charter yacht normally only has one), with the matching
// /d /w /h suffix; a for-sale yacht shows its flat sale price instead.
function sellPrice(yacht: Yacht): { amount: number; suffix: string; minHours?: number | null } | null {
  if (statusTone(yacht.status) === 'blue') {
    return yacht.priceSale ? { amount: yacht.priceSale, suffix: '' } : null
  }
  if (yacht.priceDay) return { amount: yacht.priceDay, suffix: '/d' }
  if (yacht.priceWeek) return { amount: yacht.priceWeek, suffix: '/w' }
  if (yacht.priceHour) return { amount: yacht.priceHour, suffix: '/h', minHours: yacht.minRentalHours }
  return null
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
        <div>Price</div>
        <div>B2B Price</div>
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
                {(() => {
                  const price = sellPrice(yacht)
                  if (!price) return <span style={{ color: '#5a5a52' }}>—</span>
                  return (
                    <>
                      {price.amount.toLocaleString()} {yacht.currency || 'EUR'}{price.suffix}
                      {price.minHours ? (
                        <div style={{ fontSize: 11, color: '#8f8f7f', marginTop: 1 }}>min {price.minHours}h</div>
                      ) : null}
                    </>
                  )
                })()}
              </div>

              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: yacht.b2bPrice ? '#d8d8cc' : '#5a5a52' }}>
                {yacht.b2bPrice ? `${yacht.b2bPrice.toLocaleString()} ${yacht.currency || 'EUR'}` : '—'}
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

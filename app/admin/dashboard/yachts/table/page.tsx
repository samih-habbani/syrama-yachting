'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sailboat } from 'lucide-react'
import YachtFilters from '@/components/admin/YachtFilters'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Button from '@/components/admin/ui/Button'
import EmptyState from '@/components/admin/ui/EmptyState'
import Pagination from '@/components/admin/ui/Pagination'
import EditableCell from '@/components/admin/ui/EditableCell'

interface Yacht {
  id: number
  model: string
  builder: string | null
  engines: string | null
  engineHours: number | null
  length: number
  beam: number | null
  beamOpenPlatform: number | null
  draft: number | null
  cruiseSpeed: number | null
  maxSpeed: number | null
  cabins: number
  bathrooms: number | null
  maxGuests: number | null
  maxSleeping: number | null
  consumption: string | null
  autonomy: string | null
  fuelCapacity: number | null
  waterCapacity: number | null
  navigationClass: string | null
  dryWeight: number | null
  hull: string | null
  status: string | null
  available: boolean
  rating: number | null
  reviewsCount: number | null
  city: string | null
  providerId: number | null
  provider: { id: number; name?: string | null; firstName?: string | null; company?: string | null } | null
  priceDay: number | null
  priceSale: number | null
  year: number | null
  region: string | null
  currency: string
  lengthUnit: string
  mapIframeSrc: string | null
  priceHour: number | null
  priceWeek: number | null
  b2bPrice: number | null
  minRentalHours: number | null
  createdAt: string
  media?: { id: number; url: string; alt?: string | null }[]
}

// One entry per editable column, in the same left-to-right order they're
// rendered — drives both the header row and every data row so there's a
// single place to add/reorder a field instead of two.
interface ColumnConfig {
  key: keyof Yacht
  label: string
  type: 'text' | 'number'
  step?: string
  width: number
}

const COLUMNS: ColumnConfig[] = [
  { key: 'length', label: 'Length (m)', type: 'number', step: '0.01', width: 100 },
  { key: 'lengthUnit', label: 'Unit', type: 'text', width: 70 },
  { key: 'beam', label: 'Beam', type: 'number', step: '0.01', width: 90 },
  { key: 'beamOpenPlatform', label: 'Beam (Open)', type: 'number', step: '0.01', width: 110 },
  { key: 'draft', label: 'Draft', type: 'number', step: '0.01', width: 90 },
  { key: 'cruiseSpeed', label: 'Cruise Speed', type: 'number', step: '0.1', width: 110 },
  { key: 'maxSpeed', label: 'Max Speed', type: 'number', step: '0.1', width: 100 },
  { key: 'cabins', label: 'Cabins', type: 'number', width: 80 },
  { key: 'bathrooms', label: 'Bathrooms', type: 'number', width: 90 },
  { key: 'maxGuests', label: 'Max Guests', type: 'number', width: 100 },
  { key: 'maxSleeping', label: 'Max Sleeping', type: 'number', width: 110 },
  { key: 'engines', label: 'Engines', type: 'text', width: 140 },
  { key: 'engineHours', label: 'Engine Hours', type: 'number', width: 110 },
  { key: 'consumption', label: 'Consumption', type: 'text', width: 130 },
  { key: 'autonomy', label: 'Autonomy', type: 'text', width: 120 },
  { key: 'fuelCapacity', label: 'Fuel Capacity', type: 'number', width: 110 },
  { key: 'waterCapacity', label: 'Water Capacity', type: 'number', width: 120 },
  { key: 'navigationClass', label: 'Navigation Class', type: 'text', width: 140 },
  { key: 'dryWeight', label: 'Dry Weight', type: 'number', width: 100 },
  { key: 'hull', label: 'Hull', type: 'text', width: 100 },
  { key: 'rating', label: 'Rating', type: 'number', step: '0.1', width: 80 },
  { key: 'reviewsCount', label: 'Reviews', type: 'number', width: 90 },
  { key: 'year', label: 'Year', type: 'number', width: 80 },
  { key: 'region', label: 'Region', type: 'text', width: 140 },
  { key: 'city', label: 'City', type: 'text', width: 130 },
  { key: 'currency', label: 'Currency', type: 'text', width: 90 },
  { key: 'priceDay', label: 'Price / Day', type: 'number', step: '0.01', width: 110 },
  { key: 'priceWeek', label: 'Price / Week', type: 'number', step: '0.01', width: 120 },
  { key: 'priceHour', label: 'Price / Hour', type: 'number', step: '0.01', width: 110 },
  { key: 'minRentalHours', label: 'Min Rental Hours', type: 'number', width: 140 },
  { key: 'priceSale', label: 'Sale Price', type: 'number', step: '0.01', width: 110 },
  { key: 'b2bPrice', label: 'B2B Price', type: 'number', step: '0.01', width: 110 },
  { key: 'mapIframeSrc', label: 'Map Iframe URL', type: 'text', width: 220 },
]

const STICKY_BG = '#0b0e15'

function providerLabel(provider: Yacht['provider']): string {
  if (!provider) return 'Unlinked'
  const isPlaceholder = (v: string) => /^-+$/.test(v.trim())
  const real = (v?: string | null) => (v && !isPlaceholder(v) ? v : null)
  return [real(provider.firstName), real(provider.name)].filter(Boolean).join(' ') || real(provider.company) || 'Unlinked'
}

export default function YachtsDataTablePage() {
  const [yachts, setYachts] = useState<Yacht[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<Record<string, string | string[]>>({})
  // Key is `${yachtId}:${field}` — set when an inline save fails, so the one
  // offending cell can show an error state without a page-wide banner.
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({})

  const fetchYachts = async (page: number, appliedFilters: Record<string, string | string[]> = {}) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('fields', 'full')
      params.append('page', String(page))
      params.append('limit', '20')

      if (appliedFilters.model) params.append('model', appliedFilters.model as string)
      if (appliedFilters.minLength) params.append('minLength', appliedFilters.minLength as string)
      if (appliedFilters.maxLength) params.append('maxLength', appliedFilters.maxLength as string)
      if (appliedFilters.minGuests) params.append('minGuests', appliedFilters.minGuests as string)
      if (appliedFilters.maxGuests) params.append('maxGuests', appliedFilters.maxGuests as string)
      ;(appliedFilters.region as string[] | undefined || []).forEach((r) => params.append('region', r))
      ;(appliedFilters.city as string[] | undefined || []).forEach((c) => params.append('city', c))
      ;(appliedFilters.providerId as string[] | undefined || []).forEach((p) => params.append('providerId', p))
      if (appliedFilters.status) params.append('status', appliedFilters.status as string)

      const response = await fetch(`/api/admin/yachts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setYachts(data.yachts)
        setTotalPages(data.totalPages)
        setTotal(data.total)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Fetch yachts error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchYachts(1, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    fetchYachts(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleFieldSave = async (yachtId: number, field: keyof Yacht, value: string | boolean) => {
    const key = `${yachtId}:${field}`
    const previous = yachts.find((y) => y.id === yachtId)?.[field]

    // Optimistic — the cell reflects the new value immediately.
    setYachts((prev) => prev.map((y) => (y.id === yachtId ? { ...y, [field]: value } : y)))
    setInlineErrors((prev) => { const next = { ...prev }; delete next[key]; return next })

    try {
      const response = await fetch('/api/admin/yachts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: yachtId, field, value }),
      })

      if (!response.ok) {
        const data = await response.json()
        setYachts((prev) => prev.map((y) => (y.id === yachtId ? { ...y, [field]: previous ?? null } : y)))
        setInlineErrors((prev) => ({ ...prev, [key]: data.error || 'Failed to save' }))
      }
    } catch (err) {
      console.error('Inline yacht update error:', err)
      setYachts((prev) => prev.map((y) => (y.id === yachtId ? { ...y, [field]: previous ?? null } : y)))
      setInlineErrors((prev) => ({ ...prev, [key]: 'Failed to save' }))
    }
  }

  const thStyle: React.CSSProperties = {
    position: 'sticky', top: 0, zIndex: 2, background: STICKY_BG,
    padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap',
    fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700,
    letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8f8f7f',
    borderBottom: '1px solid rgba(184,151,74,0.15)',
  }

  const tdStyle: React.CSSProperties = {
    padding: '8px 12px', borderBottom: '1px solid rgba(184,151,74,0.08)',
    fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc',
  }

  return (
    <div>
      <PageHeader
        title="Yacht Data Table"
        description="Every field, every yacht — click any value to edit it. Changes save automatically."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Yachts', href: '/admin/dashboard/yachts' }, { label: 'Data Table' }]}
        action={
          <Link href="/admin/dashboard/yachts">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={14} strokeWidth={2} />
              Back to fleet view
            </Button>
          </Link>
        }
      />

      <YachtFilters
        onFilterChange={(newFilters) => {
          setFilters(newFilters)
          setCurrentPage(1)
        }}
      />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading yachts…</div>
        </Card>
      ) : yachts.length === 0 ? (
        <Card><EmptyState icon={Sailboat} title="No yachts found" description="Try adjusting your filters." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(184,151,74,0.1)', fontFamily: 'var(--font-lora)', fontSize: 12, color: '#6b6b60' }}>
            {total.toLocaleString()} yacht{total === 1 ? '' : 's'} — scroll right for every column, click a value to edit it
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '70vh', overflowY: 'auto' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, position: 'sticky', left: 0, top: 0, zIndex: 3, minWidth: 260 }}>Yacht</th>
                  <th style={{ ...thStyle, minWidth: 70 }}>ID</th>
                  <th style={{ ...thStyle, minWidth: 100 }}>Status</th>
                  <th style={{ ...thStyle, minWidth: 90 }}>Available</th>
                  {COLUMNS.map((col) => (
                    <th key={col.key} style={{ ...thStyle, minWidth: col.width }}>{col.label}</th>
                  ))}
                  <th style={{ ...thStyle, minWidth: 160 }}>Provider</th>
                  <th style={{ ...thStyle, minWidth: 110 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {yachts.map((yacht) => (
                  <tr key={yacht.id}>
                    <td style={{ ...tdStyle, position: 'sticky', left: 0, zIndex: 1, background: STICKY_BG, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        {yacht.media?.[0]?.url ? (
                          <img
                            src={`/uploads/yachts/${yacht.media[0].url}`}
                            alt={yacht.model}
                            style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: '1px solid rgba(184,151,74,0.15)', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(184,151,74,0.06)', border: '1px solid rgba(184,151,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Sailboat size={13} color="#5a5a52" strokeWidth={1.5} />
                          </div>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 600, color: '#f5eedd' }}>
                            <EditableCell
                              value={yacht.model}
                              onSave={(v) => handleFieldSave(yacht.id, 'model', v)}
                              hasError={!!inlineErrors[`${yacht.id}:model`]}
                            />
                          </div>
                          <div style={{ fontSize: 11 }}>
                            <EditableCell
                              value={yacht.builder}
                              onSave={(v) => handleFieldSave(yacht.id, 'builder', v)}
                              hasError={!!inlineErrors[`${yacht.id}:builder`]}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ ...tdStyle, color: '#6b6b60' }}>{yacht.id}</td>

                    <td style={tdStyle}>
                      <select
                        value={yacht.status || 'Location'}
                        onChange={(e) => handleFieldSave(yacht.id, 'status', e.target.value)}
                        style={{
                          fontFamily: 'var(--font-lora)', fontSize: 12, color: '#f5eedd',
                          background: 'rgba(6,9,15,0.6)', border: '1px solid rgba(184,151,74,0.3)',
                          borderRadius: 5, padding: '4px 6px', outline: 'none', cursor: 'pointer',
                        }}
                      >
                        <option value="Location">Location</option>
                        <option value="Vente">Vente</option>
                      </select>
                    </td>

                    <td style={tdStyle}>
                      <input
                        type="checkbox"
                        checked={yacht.available}
                        onChange={(e) => handleFieldSave(yacht.id, 'available', e.target.checked)}
                        style={{ width: 15, height: 15, accentColor: '#b8974a', cursor: 'pointer' }}
                      />
                    </td>

                    {COLUMNS.map((col) => (
                      <td key={col.key} style={tdStyle}>
                        <EditableCell
                          value={yacht[col.key] == null ? '' : String(yacht[col.key])}
                          type={col.type}
                          step={col.step}
                          onSave={(v) => handleFieldSave(yacht.id, col.key, v)}
                          hasError={!!inlineErrors[`${yacht.id}:${col.key}`]}
                        />
                      </td>
                    ))}

                    <td style={{ ...tdStyle, color: yacht.provider ? '#d8d8cc' : '#5a5a52', whiteSpace: 'nowrap' }}>
                      {providerLabel(yacht.provider)}
                    </td>

                    <td style={{ ...tdStyle, color: '#6b6b60', whiteSpace: 'nowrap' }}>
                      {new Date(yacht.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
      )}
    </div>
  )
}

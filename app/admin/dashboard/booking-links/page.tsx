'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Trash2, Link2, Sailboat, FileDown } from 'lucide-react'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import StatCard from '@/components/admin/ui/StatCard'
import Pagination from '@/components/admin/ui/Pagination'
import EmptyState from '@/components/admin/ui/EmptyState'
import { FilterField, SelectField } from '@/components/admin/ui/FilterBar'
import SearchSelectField, { type SearchSelectOption } from '@/components/admin/ui/SearchSelectField'

interface BookingLink {
  id: number
  token: string
  date: string
  endDate: string | null
  startTime: string
  endTime: string | null
  status: string
  clientName: string | null
  contractId: number | null
  createdAt: string
  yacht: { id: number; model: string; builder: string | null; media: { url: string | null }[] }
}

function formatRange(link: Pick<BookingLink, 'date' | 'endDate' | 'startTime' | 'endTime'>) {
  const start = new Date(link.date).toLocaleDateString()
  const end = link.endDate ? new Date(link.endDate).toLocaleDateString() : null
  const dateStr = end && end !== start ? `${start} – ${end}` : start
  const timeStr = link.endTime ? `${link.startTime} – ${link.endTime}` : link.startTime
  return `${dateStr} · ${timeStr}`
}

export default function BookingLinksPage() {
  const [links, setLinks] = useState<BookingLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 })
  const [status, setStatus] = useState('')
  const [yachtId, setYachtId] = useState<number | null>(null)
  const [yachtOptions, setYachtOptions] = useState<SearchSelectOption[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/yachts?limit=1000')
      .then((res) => res.json())
      .then((data) => {
        const options: SearchSelectOption[] = (data.yachts || []).map((y: { id: number; model: string; builder: string | null }) => ({
          value: y.id,
          label: y.builder ? `${y.builder} ${y.model}` : y.model,
        }))
        setYachtOptions(options)
      })
      .catch((err) => console.error('Fetch yachts error:', err))
  }, [])

  const fetchLinks = async (page: number) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', '20')
      if (status) params.append('status', status)
      if (yachtId) params.append('yachtId', String(yachtId))

      const res = await fetch(`/api/admin/booking-links?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
        setTotalPages(data.totalPages || 1)
        setStats({ total: data.total || 0, pending: data.totalPending || 0, completed: data.totalCompleted || 0 })
        setCurrentPage(page)
      }
    } catch (err) {
      console.error('Fetch booking links error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, yachtId])

  const handleCopy = async (link: BookingLink) => {
    await navigator.clipboard.writeText(`${window.location.origin}/book/${link.token}`)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (link: BookingLink) => {
    if (!confirm('Remove this booking link? The client will no longer be able to use it.')) return
    setDeletingId(link.id)
    try {
      const res = await fetch(`/api/admin/booking-links?id=${link.id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchLinks(currentPage)
      }
    } catch (err) {
      console.error('Delete booking link error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Booking Links"
        description="Every reservation link generated from the fleet — see what's still pending and what's been booked."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Booking Links' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard label="Total Links" value={stats.total} icon={Link2} tone="gold" />
        <StatCard label="Pending" value={stats.pending} icon={Link2} tone="blue" />
        <StatCard label="Booked" value={stats.completed} icon={Check} tone="green" />
      </div>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
          <FilterField label="Status">
            <SelectField value={status} onChange={setStatus}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Booked</option>
            </SelectField>
          </FilterField>
          <FilterField label="Yacht">
            <SearchSelectField
              label="yacht"
              options={yachtOptions}
              value={yachtId}
              onChange={setYachtId}
              placeholder="All yachts"
            />
          </FilterField>
        </div>
      </Card>

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading booking links…</div>
        </Card>
      ) : links.length === 0 ? (
        <Card><EmptyState icon={Link2} title="No booking links yet" description="Generate one from a yacht's actions menu on the Yachts page." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1.6fr 1fr 1.4fr 1fr 130px', gap: 16, alignItems: 'center',
              padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)',
              fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f',
            }}
          >
            <div>Yacht</div>
            <div>Date &amp; Time</div>
            <div>Status</div>
            <div>Client</div>
            <div>Generated</div>
            <div />
          </div>

          {links.map((link, i) => (
            <div
              key={link.id}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1.6fr 1fr 1.4fr 1fr 130px', gap: 16, alignItems: 'center',
                padding: '14px 24px', borderBottom: i < links.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {link.yacht.media?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/uploads/yachts/${link.yacht.media[0].url}`}
                    alt={link.yacht.model}
                    style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', border: '1px solid rgba(184,151,74,0.15)', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 7, background: 'rgba(184,151,74,0.06)', border: '1px solid rgba(184,151,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sailboat size={14} color="#5a5a52" strokeWidth={1.5} />
                  </div>
                )}
                <div style={{ minWidth: 0, fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.yacht.builder ? `${link.yacht.builder} ` : ''}{link.yacht.model}
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc' }}>
                {formatRange(link)}
              </div>

              <div>
                <Badge tone={link.status === 'completed' ? 'green' : 'gold'} dot>
                  {link.status === 'completed' ? 'Booked' : 'Pending'}
                </Badge>
              </div>

              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: link.clientName ? '#d8d8cc' : '#5a5a52', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {link.clientName || '—'}
              </div>

              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#6b6b60' }}>
                {new Date(link.createdAt).toLocaleDateString()}
              </div>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {link.contractId && (
                  <a href={`/api/admin/contracts/${link.contractId}/pdf`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" title="Download contract">
                      <FileDown size={13} strokeWidth={2} />
                    </Button>
                  </a>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleCopy(link)} title="Copy link">
                  {copiedId === link.id ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={2} />}
                </Button>
                {link.status !== 'completed' && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(link)} disabled={deletingId === link.id} title="Remove link">
                    <Trash2 size={13} strokeWidth={2} color="#e08080" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchLinks} />
        </Card>
      )}
    </div>
  )
}

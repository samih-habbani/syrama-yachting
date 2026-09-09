'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import EmptyState from '@/components/admin/ui/EmptyState'
import ActionsMenu from '@/components/admin/ui/ActionsMenu'

interface DestinationRow {
  id: number
  regionSlug: string
  citySlug: string | null
  name: string
  region: string
  city: string | null
  updatedAt: string
}

function publicPath(d: Pick<DestinationRow, 'regionSlug' | 'citySlug'>) {
  return d.citySlug ? `/yacht-charter/${d.regionSlug}/${d.citySlug}` : `/yacht-charter/${d.regionSlug}`
}

export default function DestinationsPage() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<DestinationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchDestinations = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/destinations')
      if (res.ok) {
        const data = await res.json()
        setDestinations(data.destinations || [])
      }
    } catch (err) {
      console.error('Fetch destinations error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchDestinations() }, [])

  const handleDelete = async (d: DestinationRow) => {
    if (!confirm(`Delete "${d.name}"? Its FAQ and itineraries go with it, and ${publicPath(d)} will stop resolving.`)) return
    setDeletingId(d.id)
    try {
      const res = await fetch(`/api/admin/destinations/${d.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDestinations((prev) => prev.filter((x) => x.id !== d.id))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to delete destination')
      }
    } catch (err) {
      console.error('Delete destination error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  // Grouped by region so the list reads like the site's own /yacht-charter
  // hierarchy instead of a flat, order-of-creation table.
  const byRegion = destinations.reduce<Record<string, DestinationRow[]>>((acc, d) => {
    (acc[d.regionSlug] ||= []).push(d)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Destinations"
        description="Every /yacht-charter SEO landing page — title, hero, intro, FAQ and suggested itineraries all live here, edited without a code change."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Destinations' }]}
        action={
          <Button variant="primary" onClick={() => router.push('/admin/dashboard/destinations/new')}>
            <Plus size={14} strokeWidth={2} />
            New Destination
          </Button>
        }
      />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading destinations…</div>
        </Card>
      ) : destinations.length === 0 ? (
        <Card><EmptyState icon={MapPin} title="No destinations yet" description="Create the first one to publish a /yacht-charter landing page." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.6fr 1fr 90px', gap: 16, alignItems: 'center',
              padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)',
              fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f',
            }}
          >
            <div>Destination</div>
            <div>Region</div>
            <div>City</div>
            <div>Path</div>
            <div>Updated</div>
            <div />
          </div>

          {Object.entries(byRegion).map(([regionSlug, rows]) => (
            rows.map((d, i) => (
              <div
                key={d.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.6fr 1fr 90px', gap: 16, alignItems: 'center',
                  padding: '14px 24px',
                  borderBottom: !(regionSlug === Object.keys(byRegion)[Object.keys(byRegion).length - 1] && i === rows.length - 1)
                    ? '1px solid rgba(184,151,74,0.08)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(184,151,74,0.08)', border: '1px solid rgba(184,151,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={14} color="#d4b472" strokeWidth={1.75} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.name}
                  </div>
                  {!d.citySlug && <Badge tone="gold">Region</Badge>}
                </div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc' }}>{d.region}</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: d.city ? '#d8d8cc' : '#5a5a52' }}>{d.city || '—'}</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {publicPath(d)}
                </div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#6b6b60' }}>
                  {new Date(d.updatedAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ActionsMenu
                    items={[
                      { label: 'Edit', icon: <Pencil size={13} strokeWidth={2} />, onClick: () => router.push(`/admin/dashboard/destinations/${d.id}`) },
                      { label: 'View live page', icon: <ExternalLink size={13} strokeWidth={2} />, onClick: () => window.open(publicPath(d), '_blank') },
                      { label: deletingId === d.id ? 'Deleting…' : 'Delete', icon: <Trash2 size={13} strokeWidth={2} />, tone: 'danger', onClick: () => handleDelete(d) },
                    ]}
                  />
                </div>
              </div>
            ))
          ))}
        </Card>
      )}
    </div>
  )
}

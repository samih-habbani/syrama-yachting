'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import DestinationForm, { type DestinationRecord, type RelatedOption } from '@/components/admin/DestinationForm'

interface DestinationListRow {
  id: number
  kind: 'charter' | 'sale'
  regionSlug: string
  citySlug: string | null
  name: string
  region: string
  city: string | null
}

export default function DestinationEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [destination, setDestination] = useState<DestinationRecord | null>(null)
  const [relatedOptions, setRelatedOptions] = useState<RelatedOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const listRes = await fetch('/api/admin/destinations')
        const listData = listRes.ok ? await listRes.json() : { destinations: [] }
        const rows: DestinationListRow[] = listData.destinations || []

        if (!isNew) {
          const detailRes = await fetch(`/api/admin/destinations/${params.id}`)
          if (!detailRes.ok) {
            if (!cancelled) setNotFound(true)
            return
          }
          const detail = await detailRes.json()
          if (!cancelled) setDestination(detail)
        }

        if (!cancelled) {
          const options: RelatedOption[] = rows
            .filter((d) => isNew || String(d.id) !== params.id)
            .map((d) => ({
              kind: d.kind,
              value: d.citySlug ? `${d.regionSlug}/${d.citySlug}` : d.regionSlug,
              label: `${d.name} (${d.region}${d.city ? ` · ${d.city}` : ''})`,
            }))
          setRelatedOptions(options)
        }
      } catch (err) {
        console.error('Load destination error:', err)
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [params.id, isNew])

  return (
    <div>
      <PageHeader
        title={isNew ? 'New Destination' : destination?.name || 'Edit Destination'}
        breadcrumbs={[
          { label: 'Overview', href: '/admin/dashboard' },
          { label: 'Destinations', href: '/admin/dashboard/destinations' },
          { label: isNew ? 'New' : (destination?.name || '…') },
        ]}
      />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading…</div>
        </Card>
      ) : notFound ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Destination not found.</div>
        </Card>
      ) : (
        <DestinationForm
          destination={destination}
          relatedOptions={relatedOptions}
          onCancel={() => router.push('/admin/dashboard/destinations')}
        />
      )}
    </div>
  )
}

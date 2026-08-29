'use client'

import { useEffect, useState } from 'react'
import { Plus, ArrowLeft, Building2, UserCheck, UserX, Download } from 'lucide-react'
import ProviderListWithPagination from '@/components/admin/ProviderListWithPagination'
import ProviderForm, { type Provider } from '@/components/admin/ProviderForm'
import ProviderFilters, { EMPTY_PROVIDER_FILTERS, type ProviderFilterState } from '@/components/admin/ProviderFilters'
import PageHeader from '@/components/admin/ui/PageHeader'
import StatCard from '@/components/admin/ui/StatCard'
import Button from '@/components/admin/ui/Button'
import Card from '@/components/admin/ui/Card'

interface ProviderRow extends Provider {
  id: number
}

interface Stats {
  total: number
  active: number
  inactive: number
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ProviderRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<ProviderFilterState>(EMPTY_PROVIDER_FILTERS)
  const [stats, setStats] = useState<Stats | null>(null)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/providers/meta')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Fetch provider stats error:', error)
    }
  }

  const fetchProviders = async (page: number, applied: ProviderFilterState) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', '20')

      if (applied.search) params.append('search', applied.search)
      applied.type.forEach((v) => params.append('type', v))
      applied.region.forEach((v) => params.append('region', v))
      applied.city.forEach((v) => params.append('city', v))
      applied.country.forEach((v) => params.append('country', v))
      applied.services.forEach((v) => params.append('services', v))

      const response = await fetch(`/api/admin/providers?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers)
        setTotalPages(data.totalPages)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Fetch providers error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders(1, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    fetchProviders(currentPage, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleSaved = async () => {
    await fetchProviders(currentPage, filters)
    fetchStats()
    setShowForm(false)
    setEditingProvider(null)
  }

  const handleEdit = (provider: ProviderRow) => {
    setEditingProvider(provider)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      try {
        const response = await fetch(`/api/admin/providers?id=${id}`, { method: 'DELETE' })
        if (response.ok) {
          await fetchProviders(currentPage, filters)
          fetchStats()
        }
      } catch (error) {
        console.error('Delete provider error:', error)
      }
    }
  }

  if (showForm) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingProvider(null) }} style={{ marginBottom: 24 }}>
          <ArrowLeft size={14} strokeWidth={2} />
          Back to providers
        </Button>
        <ProviderForm
          provider={editingProvider}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditingProvider(null) }}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Providers"
        description="Your network of yacht brokers, restaurants, hotels and other partners."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Providers' }]}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Plain anchor, not a Button+router navigation — this hits an API
                route that streams a binary .xlsx download, not a Next.js page. */}
            <a
              href="/api/admin/providers/export"
              download
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
                color: '#d4b472', background: 'transparent', border: '1px solid rgba(184,151,74,0.35)',
                borderRadius: 7, padding: '11px 20px', textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,151,74,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Download size={14} strokeWidth={2} />
              Export Excel
            </a>
            <Button variant="primary" onClick={() => { setEditingProvider(null); setShowForm(true) }}>
              <Plus size={14} strokeWidth={2.5} />
              Add Provider
            </Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard label="Total Providers" value={stats?.total ?? '—'} icon={Building2} tone="gold" />
        <StatCard label="Active" value={stats?.active ?? '—'} icon={UserCheck} tone="green" />
        <StatCard label="Inactive" value={stats?.inactive ?? '—'} icon={UserX} tone="red" />
      </div>

      <ProviderFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading providers…</div>
        </Card>
      ) : (
        <ProviderListWithPagination
          providers={providers}
          currentPage={currentPage}
          totalPages={totalPages}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

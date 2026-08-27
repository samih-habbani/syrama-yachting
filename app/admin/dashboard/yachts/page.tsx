'use client'

import { useEffect, useState } from 'react'
import { Plus, ArrowLeft, Sailboat, Tag, ShoppingBag } from 'lucide-react'
import YachtListWithPagination from '@/components/admin/YachtListWithPagination'
import YachtForm from '@/components/admin/YachtForm'
import YachtFilters from '@/components/admin/YachtFilters'
import PageHeader from '@/components/admin/ui/PageHeader'
import StatCard from '@/components/admin/ui/StatCard'
import Button from '@/components/admin/ui/Button'
import Card from '@/components/admin/ui/Card'

interface YachtStats {
  total: number
  charter: number
  sale: number
}

export default function YachtsPage() {
  const [yachts, setYachts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingYacht, setEditingYacht] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [stats, setStats] = useState<YachtStats | null>(null)

  const fetchStats = async () => {
    try {
      const [totalRes, charterRes, saleRes] = await Promise.all([
        fetch('/api/admin/yachts?limit=1'),
        fetch('/api/admin/yachts?limit=1&status=charter'),
        fetch('/api/admin/yachts?limit=1&status=sale'),
      ])
      const [totalData, charterData, saleData] = await Promise.all([totalRes.json(), charterRes.json(), saleRes.json()])
      setStats({ total: totalData.total ?? 0, charter: charterData.total ?? 0, sale: saleData.total ?? 0 })
    } catch (error) {
      console.error('Fetch yacht stats error:', error)
    }
  }

  const fetchYachts = async (page: number, appliedFilters: Record<string, string> = {}) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', '10')

      if (appliedFilters.model) params.append('model', appliedFilters.model)
      if (appliedFilters.minLength) params.append('minLength', appliedFilters.minLength)
      if (appliedFilters.maxLength) params.append('maxLength', appliedFilters.maxLength)
      if (appliedFilters.minGuests) params.append('minGuests', appliedFilters.minGuests)
      if (appliedFilters.maxGuests) params.append('maxGuests', appliedFilters.maxGuests)
      if (appliedFilters.region) params.append('region', appliedFilters.region)
      if (appliedFilters.city) params.append('city', appliedFilters.city)
      if (appliedFilters.status) params.append('status', appliedFilters.status)

      const response = await fetch(`/api/admin/yachts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setYachts(data.yachts)
        setTotalPages(data.totalPages)
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
    fetchYachts(currentPage, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleYachtSaved = async () => {
    await fetchYachts(currentPage)
    fetchStats()
    setShowForm(false)
    setEditingYacht(null)
  }

  const handleEdit = (yacht: any) => {
    setEditingYacht(yacht)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this yacht?')) {
      try {
        const response = await fetch(`/api/admin/yachts?id=${id}`, { method: 'DELETE' })
        if (response.ok) {
          await fetchYachts(currentPage)
          fetchStats()
        }
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  if (showForm) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={14} strokeWidth={2} />
          Back to fleet
        </Button>
        <YachtForm yacht={editingYacht} onSaved={handleYachtSaved} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Yachts"
        description="Manage your fleet — charter and sale listings."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Yachts' }]}
        action={
          <Button variant="primary" onClick={() => { setEditingYacht(null); setShowForm(true) }}>
            <Plus size={14} strokeWidth={2.5} />
            Add Yacht
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard label="Total Fleet" value={stats?.total ?? '—'} icon={Sailboat} tone="gold" />
        <StatCard label="For Charter" value={stats?.charter ?? '—'} icon={Tag} tone="blue" />
        <StatCard label="For Sale" value={stats?.sale ?? '—'} icon={ShoppingBag} tone="green" />
      </div>

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
      ) : (
        <YachtListWithPagination
          yachts={yachts}
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

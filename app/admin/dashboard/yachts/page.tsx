'use client'

import { useEffect, useState } from 'react'
import YachtListWithPagination from '@/components/admin/YachtListWithPagination'
import YachtForm from '@/components/admin/YachtForm'
import YachtFilters from '@/components/admin/YachtFilters'

export default function YachtsPage() {
  const [yachts, setYachts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingYacht, setEditingYacht] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    fetchYachts(1, filters)
  }, [filters])

  useEffect(() => {
    fetchYachts(currentPage, filters)
  }, [currentPage])

  const fetchYachts = async (page: number, appliedFilters: any = {}) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', '10')

      // Add active filters to query
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

  const handleYachtSaved = async () => {
    await fetchYachts(currentPage)
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
        const response = await fetch(`/api/admin/yachts?id=${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await fetchYachts(currentPage)
        }
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  return (
    <div>
      {!showForm && (
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-lg tracking-wider text-gray-500 mb-2">YOUR FLEET</h2>
            <p className="text-gray-600 text-sm">Manage and edit your yachts</p>
          </div>
          <button
            onClick={() => {
              setEditingYacht(null)
              setShowForm(true)
            }}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-6 py-2 transition text-sm tracking-wider font-light"
          >
            + ADD YACHT
          </button>
        </div>
      )}

      {!showForm && (
        <YachtFilters
          onFilterChange={(newFilters) => {
            setFilters(newFilters)
            setCurrentPage(1)
          }}
        />
      )}

      {showForm && (
        <div className="mb-12">
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-[#b8974a] transition text-sm tracking-wider font-light mb-8"
          >
            ← BACK
          </button>
          <YachtForm
            yacht={editingYacht}
            onSaved={handleYachtSaved}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500" style={{ fontFamily: 'var(--font-tenor)' }}>Loading yachts...</div>
        </div>
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

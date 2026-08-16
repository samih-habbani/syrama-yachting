'use client'

import { useEffect, useState } from 'react'
import ClientFilters from '@/components/admin/ClientFilters'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    fetchClients(currentPage)
  }, [currentPage, filters])

  const fetchClients = async (page: number) => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', '10')

      if (filters.fullName) queryParams.append('fullName', filters.fullName)
      if (filters.email) queryParams.append('email', filters.email)
      if (filters.phone) queryParams.append('phone', filters.phone)
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/clients?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Fetch clients error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-lg tracking-wider text-gray-500 mb-2">CLIENTS</h2>
        <p className="text-gray-600 text-sm">All clients who requested charter</p>
      </div>

      <ClientFilters onFiltersChange={handleFiltersChange} />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500" style={{ fontFamily: 'var(--font-tenor)' }}>Loading clients...</div>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No clients yet</div>
      ) : (
        <div className="space-y-2">
          {clients.map((client: any) => (
            <div
              key={client.id}
              className="bg-[#0f1419] border border-[#b8974a] border-opacity-10 hover:border-opacity-30 transition p-6 flex justify-between items-center"
            >
              <div>
                <p className="text-[#b8974a] font-semibold mb-1" style={{ fontFamily: 'var(--font-tenor)' }}>
                  {client.fullName}
                </p>
                <div className="flex gap-6 text-sm text-gray-500">
                  <p>📧 {client.email}</p>
                  <p>📞 {client.phone}</p>
                  <p>Added: {new Date(client.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-xs mb-1">RESERVATIONS</p>
                <p className="text-[#b8974a] text-lg font-semibold">{client._count?.reservations || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#b8974a] border-opacity-10">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← PREVIOUS
          </button>

          <span className="text-gray-500 text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light disabled:opacity-30 disabled:cursor-not-allowed"
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}

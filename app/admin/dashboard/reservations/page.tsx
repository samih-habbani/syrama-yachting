'use client'

import { useEffect, useState } from 'react'
import ReservationFilters from '@/components/admin/ReservationFilters'
import CreateReservationModal from '@/components/admin/CreateReservationModal'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    id: '',
    clientName: '',
    yachtModel: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    fetchReservations(currentPage)
  }, [currentPage, filters])

  const fetchReservations = async (page: number) => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', '10')

      if (filters.id) queryParams.append('id', filters.id)
      if (filters.clientName) queryParams.append('clientName', filters.clientName)
      if (filters.yachtModel) queryParams.append('yachtModel', filters.yachtModel)
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/reservations?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReservations(data.reservations)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Fetch reservations error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleReservationCreated = () => {
    fetchReservations(1)
  }

  return (
    <div>
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h2 className="text-lg tracking-wider text-gray-500 mb-2">CHARTER REQUESTS</h2>
          <p className="text-gray-600 text-sm">All incoming yacht charter reservations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#b8974a] text-[#06090f] rounded-lg px-6 py-3 transition font-medium text-sm tracking-wider uppercase hover:bg-[#d4af7a]"
        >
          + CREATE RESERVATION
        </button>
      </div>

      <ReservationFilters onFiltersChange={handleFiltersChange} />

      <CreateReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleReservationCreated}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500" style={{ fontFamily: 'var(--font-tenor)' }}>Loading reservations...</div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No reservations yet</div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res: any) => (
            <div
              key={res.id}
              className="bg-[#0f1419] border border-[#b8974a] border-opacity-10 hover:border-opacity-30 transition p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Client Info */}
                <div>
                  <p className="text-gray-600 uppercase text-xs tracking-wider mb-2">Client</p>
                  <p className="text-[#b8974a] mb-1" style={{ fontFamily: 'var(--font-tenor)' }}>
                    {res.client.fullName}
                  </p>
                  <p className="text-gray-500 text-sm">{res.client.email}</p>
                  <p className="text-gray-500 text-sm">{res.client.phone}</p>
                </div>

                {/* Yacht & Reservation Info */}
                <div>
                  <p className="text-gray-600 uppercase text-xs tracking-wider mb-2">Yacht</p>
                  <p className="text-white mb-4">{res.yacht.model}</p>

                  <p className="text-gray-600 uppercase text-xs tracking-wider mb-2">Details</p>
                  <div className="text-gray-400 text-sm space-y-1">
                    <p>📅 {new Date(res.date).toLocaleDateString()}</p>
                    <p>👥 {res.numberOfPeople} people</p>
                    <p>📍 {res.location}</p>
                    {res.price && <p>💰 €{res.price.toFixed(2)}</p>}
                  </div>
                </div>

                {/* Status & Date */}
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-gray-600 uppercase text-xs tracking-wider mb-2">Status</p>
                    <div className="inline-block">
                      <span className={`px-3 py-1 rounded text-xs tracking-wider font-light ${
                        res.status === 'pending'
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                          : 'bg-green-500 bg-opacity-20 text-green-300'
                      }`}>
                        {res.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs">
                    Submitted: {new Date(res.createdAt).toLocaleDateString()}
                  </p>
                </div>
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

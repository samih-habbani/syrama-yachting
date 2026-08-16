'use client'

import { useState } from 'react'

interface ClientFiltersProps {
  onFiltersChange: (filters: any) => void
}

export default function ClientFilters({ onFiltersChange }: ClientFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateFrom: '',
    dateTo: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updated = { ...filters, [name]: value }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const handleReset = () => {
    setFilters({
      fullName: '',
      email: '',
      phone: '',
      dateFrom: '',
      dateTo: ''
    })
    onFiltersChange({
      fullName: '',
      email: '',
      phone: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="text-[#b8974a] hover:text-white text-sm tracking-widest uppercase transition flex items-center gap-2"
      >
        {showFilters ? '▼' : '▶'} FILTERS
      </button>

      {showFilters && (
        <div className="mt-6 bg-[#0f1419] border border-[#b8974a] border-opacity-20 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={filters.fullName}
                onChange={handleChange}
                placeholder="Search by name..."
                className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-2 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={filters.email}
                onChange={handleChange}
                placeholder="Search by email..."
                className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-2 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={filters.phone}
                onChange={handleChange}
                placeholder="Search by phone..."
                className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-2 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
              />
            </div>

            <div />

            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">
                Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleChange}
                className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">
                Date To
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleChange}
                className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 border border-gray-600 hover:border-gray-500 rounded-lg transition text-sm tracking-wider uppercase"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'

interface YachtFiltersProps {
  onFilterChange: (filters: any) => void
}

export default function YachtFilters({ onFilterChange }: YachtFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    model: '',
    minLength: '',
    maxLength: '',
    minGuests: '',
    maxGuests: '',
    region: '',
    city: '',
    status: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newFilters = {
      ...filters,
      [name]: value
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const emptyFilters = {
      model: '',
      minLength: '',
      maxLength: '',
      minGuests: '',
      maxGuests: '',
      region: '',
      city: '',
      status: ''
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="mb-8">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-sm tracking-wider font-light"
      >
        {showFilters ? '▼ HIDE FILTERS' : '▶ SHOW FILTERS'}
        {hasActiveFilters && <span className="ml-2 text-xs">(Active)</span>}
      </button>

      {showFilters && (
        <div className="mt-6 bg-[#0f1419] border border-[#b8974a] border-opacity-10 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Model */}
            <div>
              <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Model</label>
              <input
                type="text"
                name="model"
                placeholder="e.g., Gozzo"
                value={filters.model}
                onChange={handleChange}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>

            {/* Length Range */}
            <div>
              <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Min Length (m)</label>
              <input
                type="number"
                step="0.1"
                name="minLength"
                placeholder="e.g., 10"
                value={filters.minLength}
                onChange={handleChange}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Max Length (m)</label>
              <input
                type="number"
                step="0.1"
                name="maxLength"
                placeholder="e.g., 50"
                value={filters.maxLength}
                onChange={handleChange}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>

            {/* Guests Range */}
            <div>
              <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Min Guests</label>
              <input
                type="number"
                name="minGuests"
                placeholder="e.g., 6"
                value={filters.minGuests}
                onChange={handleChange}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Max Guests</label>
              <input
                type="number"
                name="maxGuests"
                placeholder="e.g., 12"
                value={filters.maxGuests}
                onChange={handleChange}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>

            {/* Region */}
            <div>
              <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Region</label>
              <input
                type="text"
                name="region"
                placeholder="e.g., Mediterranean"
                value={filters.region}
                onChange={handleChange}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>

            {/* City */}
            <div>
              <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">City</label>
              <input
                type="text"
                name="city"
                placeholder="e.g., Monaco"
                value={filters.city}
                onChange={handleChange}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-2 text-white focus:outline-none transition text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Type</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-2 text-white focus:outline-none transition text-sm"
              >
                <option value="">All Types</option>
                <option value="charter">Charter</option>
                <option value="sale">Sale</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-red-600 hover:text-red-400 border border-red-600 hover:border-red-400 px-4 py-2 transition text-xs tracking-wider font-light"
            >
              RESET FILTERS
            </button>
          )}
        </div>
      )}
    </div>
  )
}

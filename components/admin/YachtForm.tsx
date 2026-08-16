'use client'

import { useState } from 'react'

interface YachtFormProps {
  yacht?: any
  onSaved: () => void
}

export default function YachtForm({ yacht, onSaved }: YachtFormProps) {
  const [formData, setFormData] = useState({
    model: yacht?.model || '',
    builder: yacht?.builder || '',
    length: yacht?.length || '',
    cabins: yacht?.cabins || '',
    maxGuests: yacht?.maxGuests || '',
    year: yacht?.year || '',
    priceDay: yacht?.priceDay || '',
    region: yacht?.region || '',
    city: yacht?.city || '',
    status: yacht?.status || 'charter',
    available: yacht?.available !== false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const url = yacht?.id ? '/api/admin/yachts' : '/api/admin/yachts'
      const method = yacht?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...(yacht?.id && { id: yacht.id })
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to save yacht')
        return
      }

      onSaved()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#0f1419] border border-[#b8974a] border-opacity-10 p-12">
      <h2 className="text-2xl text-[#b8974a] mb-2" style={{ fontFamily: 'var(--font-tenor)' }}>
        {yacht?.id ? 'Edit Yacht' : 'Add New Yacht'}
      </h2>
      <p className="text-gray-600 text-sm tracking-wider mb-8">Fill in the yacht details below</p>

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-300 px-6 py-4 mb-8 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Model *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Builder</label>
          <input
            type="text"
            name="builder"
            value={formData.builder}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Length (m) *</label>
          <input
            type="number"
            step="0.1"
            name="length"
            value={formData.length}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Cabins *</label>
          <input
            type="number"
            name="cabins"
            value={formData.cabins}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Max Guests</label>
          <input
            type="number"
            name="maxGuests"
            value={formData.maxGuests}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Price per Day</label>
          <input
            type="number"
            step="0.01"
            name="priceDay"
            value={formData.priceDay}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Region</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
          />
        </div>

        <div>
          <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Type</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
          >
            <option value="charter">Charter</option>
            <option value="sale">Sale</option>
          </select>
        </div>

        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="available"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="available" className="text-gray-400 text-sm ml-3 cursor-pointer uppercase tracking-wider">
            Available for booking
          </label>
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-8 py-3 transition text-sm tracking-wider font-light disabled:opacity-50"
        >
          {isLoading ? 'SAVING...' : 'SAVE YACHT'}
        </button>
      </div>
    </form>
  )
}

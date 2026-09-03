'use client'

import { useState, useEffect } from 'react'

interface Yacht {
  id: number
  model: string
  region: string
}

interface Client {
  id: number
  fullName: string
  email: string
  phone: string
}

interface CreateReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateReservationModal({ isOpen, onClose, onSuccess }: CreateReservationModalProps) {
  const [yachts, setYachts] = useState<Yacht[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createNewClient, setCreateNewClient] = useState(false)

  const [formData, setFormData] = useState({
    yachtId: '',
    clientId: '',
    newClientName: '',
    newClientEmail: '',
    newClientPhone: '',
    date: '',
    numberOfPeople: '',
    location: '',
    price: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      setIsLoadingData(true)
      const [yachtsRes, clientsRes] = await Promise.all([
        fetch('/api/admin/yachts?page=1&limit=1000'),
        fetch('/api/clients?page=1&limit=1000')
      ])

      if (yachtsRes.ok) {
        const yachtsData = await yachtsRes.json()
        setYachts(yachtsData.yachts)
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData.clients)
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const clientId = createNewClient ? undefined : formData.clientId

      if (!formData.yachtId || !formData.date || !formData.numberOfPeople) {
        setError('Yacht, date and number of people are required')
        return
      }

      if (createNewClient) {
        if (!formData.newClientName || !formData.newClientEmail || !formData.newClientPhone) {
          setError('All client fields are required')
          return
        }
      } else {
        if (!clientId) {
          setError('Please select a client')
          return
        }
      }

      const reservationData = {
        yachtId: formData.yachtId,
        clientId: createNewClient ? undefined : parseInt(clientId || ''),
        fullName: createNewClient ? formData.newClientName : undefined,
        email: createNewClient ? formData.newClientEmail : undefined,
        phone: createNewClient ? formData.newClientPhone : undefined,
        date: formData.date,
        numberOfPeople: formData.numberOfPeople,
        location: formData.location || 'Not specified',
        price: formData.price ? parseFloat(formData.price) : undefined
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create reservation')
        return
      }

      onSuccess()
      onClose()
      setFormData({
        yachtId: '',
        clientId: '',
        newClientName: '',
        newClientEmail: '',
        newClientPhone: '',
        date: '',
        numberOfPeople: '',
        location: '',
        price: ''
      })
      setCreateNewClient(false)
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      style={{
        background: 'rgba(6, 9, 15, 0.3)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .modal-content {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div
        className="modal-content bg-gradient-to-b from-[#0f1419] to-[#06090f] max-w-2xl w-full rounded-lg border border-[#b8974a]/20 p-8 shadow-2xl max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-[#b8974a] text-sm tracking-widest uppercase mb-2" style={{ fontFamily: 'var(--font-lora)' }}>Create Reservation</h2>
          <h3 className="text-2xl text-[#f5eedd]" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400 }}>
            New Charter Request
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Yacht Selection */}
          <div>
            <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Yacht *</label>
            <select
              name="yachtId"
              value={formData.yachtId}
              onChange={handleChange}
              className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm"
              required
              disabled={isLoadingData}
            >
              <option value="">Select a yacht...</option>
              {yachts.map(yacht => (
                <option key={yacht.id} value={yacht.id}>
                  {yacht.model} ({yacht.region})
                </option>
              ))}
            </select>
          </div>

          {/* Client Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-500 text-xs tracking-widest uppercase block">Client</label>
              <button
                type="button"
                onClick={() => setCreateNewClient(!createNewClient)}
                className="text-[#b8974a] hover:text-white text-xs tracking-wider transition"
              >
                {createNewClient ? 'Select Existing' : 'Create New'}
              </button>
            </div>

            {createNewClient ? (
              <div className="space-y-3">
                <input
                  type="text"
                  name="newClientName"
                  value={formData.newClientName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-2 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                  required={createNewClient}
                />
                <input
                  type="email"
                  name="newClientEmail"
                  value={formData.newClientEmail}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-2 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                  required={createNewClient}
                />
                <input
                  type="tel"
                  name="newClientPhone"
                  value={formData.newClientPhone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-2 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                  required={createNewClient}
                />
              </div>
            ) : (
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm"
                required={!createNewClient}
                disabled={isLoadingData}
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.fullName} ({client.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & People */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-white/5 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-2 text-white focus:outline-none transition text-sm"
                required
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Guests *</label>
              <input
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleChange}
                placeholder="Number"
                className="w-full bg-white/5 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-2 text-white focus:outline-none transition text-sm"
                min="1"
                required
              />
            </div>
          </div>

          {/* Location & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Monaco"
                className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-2 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Amount"
                className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-2 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-[#b8974a]/10">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingData}
              className="flex-1 bg-[#b8974a] text-[#06090f] rounded-lg px-6 py-3 transition font-medium text-sm tracking-wider uppercase hover:bg-[#d4af7a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Reservation'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-gray-400 hover:text-gray-300 border border-gray-600 hover:border-gray-500 rounded-lg px-6 py-3 transition text-sm tracking-wider uppercase"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

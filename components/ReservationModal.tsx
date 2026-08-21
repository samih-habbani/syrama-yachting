'use client'

import { useState, useRef } from 'react'
import { useModalA11y } from '@/lib/useModalA11y'

interface ReservationModalProps {
  yachtId: number
  yachtModel: string
  isOpen: boolean
  onClose: () => void
}

export default function ReservationModal({ yachtId, yachtModel, isOpen, onClose }: ReservationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    numberOfPeople: '',
    location: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useModalA11y(isOpen, onClose, modalRef)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          yachtId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create reservation')
        return
      }

      setSuccess(true)
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        date: '',
        numberOfPeople: '',
        location: ''
      })

      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-modal-title"
        className="modal-content bg-gradient-to-b from-[#0f1419] to-[#06090f] max-w-md w-full max-h-[90vh] overflow-y-auto rounded-lg border border-[#b8974a] border-opacity-20 p-6 sm:p-12 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-12" role="status">
            <div className="text-[#b8974a] mb-4 text-4xl" aria-hidden="true">✓</div>
            <h3 id="reservation-modal-title" className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-tenor)' }}>
              Request Received
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Thank you for your interest. Our team will contact you shortly to discuss your charter.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 id="reservation-modal-title" className="text-[#b8974a] text-sm tracking-widest uppercase mb-2">Charter Request</h2>
              <h3 className="text-2xl text-white" style={{ fontFamily: 'var(--font-tenor)' }}>
                {yachtModel}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-50 text-red-300 px-4 py-3 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reservation-fullName" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Full Name *</label>
                  <input
                    id="reservation-fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reservation-phone" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Phone *</label>
                  <input
                    id="reservation-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                    placeholder="+33..."
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reservation-email" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Email *</label>
                <input
                  id="reservation-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reservation-date" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Date *</label>
                  <input
                    id="reservation-date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reservation-guests" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Guests *</label>
                  <input
                    id="reservation-guests"
                    type="number"
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleChange}
                    className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reservation-location" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Location *</label>
                <input
                  id="reservation-location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Monaco, French Riviera"
                  className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-[#b8974a] border-opacity-10">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#b8974a] text-[#06090f] rounded-lg px-6 py-3 transition font-medium text-sm tracking-wider uppercase hover:bg-[#d4af7a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Request Charter'}
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
          </>
        )}
      </div>
    </div>
  )
}

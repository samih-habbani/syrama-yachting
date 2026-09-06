'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface Yacht {
  id: number
  model: string
  builder: string | null
  length: number
  region: string | null
  city: string | null
  media: { url: string | null; alt: string | null }[]
}

interface InitialClient {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
}

interface BookingLinkFormProps {
  token: string
  yacht: Yacht
  date: string
  endDate: string | null
  startTime: string
  endTime: string | null
  completed: boolean
  // Set when this link was generated from an existing reservation — its
  // client's details are already known, so there's no reason to ask the
  // client to retype them.
  initialClient?: InitialClient | null
}

export default function BookingLinkForm({ token, yacht, date, endDate, startTime, endTime, completed, initialClient }: BookingLinkFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialClient?.firstName || '',
    lastName: initialClient?.lastName || '',
    email: initialClient?.email || '',
    phone: initialClient?.phone || '',
    country: initialClient?.country || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/booking-links/${token}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to submit your booking')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const startDateObj = new Date(date)
  const endDateObj = endDate ? new Date(endDate) : null
  const isMultiDay = !!endDateObj && endDateObj.toDateString() !== startDateObj.toDateString()
  const formattedDate = isMultiDay
    ? `${startDateObj.toLocaleDateString('en-US', dateOptions)} – ${endDateObj!.toLocaleDateString('en-US', dateOptions)}`
    : startDateObj.toLocaleDateString('en-US', dateOptions)
  const imageUrl = yacht.media[0]?.url ? `/uploads/yachts/${yacht.media[0].url}` : null

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div
        className="modal-content"
        style={{
          width: '100%', maxWidth: 480,
          background: 'linear-gradient(180deg, #0f1419 0%, #06090f 100%)',
          border: '1px solid rgba(184,151,74,0.2)', borderRadius: 12, padding: '32px 32px 40px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {imageUrl && (
          <div style={{ margin: '-32px -32px 24px', borderRadius: '12px 12px 0 0', overflow: 'hidden', height: 180, position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={yacht.media[0]?.alt || yacht.model} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.9) 0%, transparent 60%)' }} />
          </div>
        )}

        {success || completed ? (
          <div className="text-center py-8" role="status">
            <div className="text-[#b8974a] mb-4 text-4xl" aria-hidden="true">✓</div>
            <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-tenor)' }}>
              {success ? 'Booking Confirmed' : 'Already Booked'}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {success
                ? "Thank you — we've received your booking request. A copy of your agreement has also been sent to your email. Our team will reach out shortly to confirm the details."
                : "This booking has already been confirmed. You can download your agreement below, or contact us if you need anything else."}
            </p>
            <a
              href={`/api/booking-links/${token}/contract`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#b8974a] text-[#06090f] rounded-lg px-6 py-3 transition font-medium text-sm tracking-wider uppercase hover:bg-[#d4af7a]"
            >
              <Download size={15} strokeWidth={2} />
              Download Your Contract
            </a>
          </div>
        ) : (
          <>
            <div className="mb-2" style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a' }}>
              Confirm Your Charter
            </div>
            <h3 className="text-2xl text-white mb-1" style={{ fontFamily: 'var(--font-tenor)' }}>
              {yacht.builder ? `${yacht.builder} ` : ''}{yacht.model}
            </h3>
            <p className="text-gray-400 text-sm mb-1">
              {yacht.length}m{yacht.city ? ` · ${yacht.city}` : yacht.region ? ` · ${yacht.region}` : ''}
            </p>
            <p className="text-[#d4af7a] text-sm mb-7">
              {formattedDate} · {startTime}{endTime ? ` – ${endTime}` : ''}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-firstName" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">First Name *</label>
                  <input
                    id="booking-firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="booking-lastName" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Last Name *</label>
                  <input
                    id="booking-lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="booking-email" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Email *</label>
                <input
                  id="booking-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-phone" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Phone *</label>
                  <input
                    id="booking-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                    placeholder="+33..."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="booking-country" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Country of Residence *</label>
                  <input
                    id="booking-country"
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-[#06090f]/80 border border-[#b8974a]/20 hover:border-[#b8974a]/40 focus:border-[#b8974a] rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
                    placeholder="e.g. France"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#b8974a] text-[#06090f] rounded-lg px-6 py-3 transition font-medium text-sm tracking-wider uppercase hover:bg-[#d4af7a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    destination: '',
    preferredDate: '',
    numberOfGuests: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      console.log('[Form Debug] Sending data:', formData)

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      console.log('[Form Debug] Response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        console.log('[Form Debug] Error response:', data)
        setError(data.error || 'Failed to send message')
        return
      }

      setSuccess(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        destination: '',
        preferredDate: '',
        numberOfGuests: '',
        message: ''
      })

      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-50 text-red-300 px-4 py-3 text-sm rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-50 text-green-300 px-4 py-3 text-sm rounded-lg">
          ✓ Thank you! Your message has been received and we will get back to you soon.
        </div>
      )}

      {/* Row 1: First Name, Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Your first name"
            className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Your last name"
            className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm placeholder-gray-500"
            required
          />
        </div>
      </div>

      {/* Row 2: Email, Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
            Phone / WhatsApp
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+33..."
            className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm placeholder-gray-500"
          />
        </div>
      </div>

      {/* Row 3: Request Type */}
      <div>
        <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
          Request Type *
        </label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm"
          required
        >
          <option value="">Select a request type</option>
          <option value="Yacht Charter">Yacht Charter</option>
          <option value="Yacht Sales">Yacht Sales</option>
          <option value="Bespoke Experiences">Bespoke Experiences</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Row 4: Destination, Preferred Date, Number of Guests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
            Destination
          </label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Where would you like to charter?"
            className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm placeholder-gray-500"
          />
        </div>

        <div>
          <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
            Preferred Date
          </label>
          <input
            type="date"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm placeholder-gray-500"
          />
        </div>

        <div>
          <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
            Number of Guests
          </label>
          <input
            type="number"
            name="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={handleChange}
            placeholder="Number of guests"
            min="1"
            className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm placeholder-gray-500"
          />
        </div>
      </div>

      {/* Row 5: Message */}
      <div>
        <label className="text-gray-500 text-sm tracking-widest uppercase block mb-3">
          Tell us what you're looking for *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your message..."
          rows={6}
          className="w-full bg-white bg-opacity-5 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-white focus:outline-none transition text-sm placeholder-gray-500 resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#b8974a] text-[#06090f] rounded-lg px-6 py-3 transition font-medium text-sm tracking-wider uppercase hover:bg-[#d4af7a] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending...' : 'SEND MY REQUEST'}
      </button>
    </form>
  )
}

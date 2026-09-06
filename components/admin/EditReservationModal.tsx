'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from './ui/Button'
import { FilterField, TextField, SelectField } from './ui/FilterBar'

interface Reservation {
  id: number
  date: string | null
  numberOfPeople: number | null
  location: string | null
  price?: number | null
  status: string
  startTime: string | null
  endTime: string | null
  plannedItinerary: string | null
  deposit: number | null
  paymentDeadline: string | null
  client: { fullName: string }
  yacht: { model: string } | null
}

interface EditReservationModalProps {
  reservation: Reservation | null
  onClose: () => void
  onSuccess: () => void
}

function toDateInputValue(iso: string | null) {
  return iso ? iso.slice(0, 10) : ''
}

// Fallbacks matching a freshly-created reservation's own defaults — a
// reservation edited before either was ever set (e.g. imported legacy
// data) still lands on the same "no deposit yet, due today" starting point.
function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export default function EditReservationModal({ reservation, onClose, onSuccess }: EditReservationModalProps) {
  const [formData, setFormData] = useState({
    date: '', numberOfPeople: '', location: '', price: '', status: 'pending',
    startTime: '', endTime: '', plannedItinerary: '', deposit: '0', paymentDeadline: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (reservation) {
      setFormData({
        date: toDateInputValue(reservation.date),
        numberOfPeople: reservation.numberOfPeople != null ? String(reservation.numberOfPeople) : '',
        location: reservation.location || '',
        price: reservation.price != null ? String(reservation.price) : '',
        status: reservation.status || 'pending',
        startTime: reservation.startTime || '',
        endTime: reservation.endTime || '',
        plannedItinerary: reservation.plannedItinerary || '',
        deposit: reservation.deposit != null ? String(reservation.deposit) : '0',
        paymentDeadline: toDateInputValue(reservation.paymentDeadline) || todayInputValue(),
      })
      setError('')
    }
  }, [reservation])

  if (!reservation) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservation.id, ...formData }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to update reservation')
        return
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(6,9,15,0.6)', backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
          background: 'linear-gradient(180deg, #0f1419 0%, #06090f 100%)',
          border: '1px solid rgba(184,151,74,0.2)', borderRadius: 12, padding: 32,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 8 }}>
              Edit Reservation
            </div>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 24, color: '#f5eedd', margin: 0 }}>
              {reservation.client.fullName}
            </h3>
            <p style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#8f8f7f', margin: '2px 0 0' }}>{reservation.yacht?.model || '—'}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: '#8f8f7f', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '11px 14px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 12.5, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <FilterField label="Date *">
              <TextField type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </FilterField>
            <FilterField label="Guests *">
              <TextField type="number" min={1} required value={formData.numberOfPeople} onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })} />
            </FilterField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <FilterField label="Embarkation Time *">
              <TextField type="time" required value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
            </FilterField>
            <FilterField label="Disembarkation Time">
              <TextField type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
            </FilterField>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FilterField label="Location">
              <TextField value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </FilterField>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FilterField label="Planned Itinerary">
              <textarea
                value={formData.plannedItinerary}
                onChange={(e) => setFormData({ ...formData, plannedItinerary: e.target.value })}
                rows={3}
                placeholder="e.g. Departure from Cannes, Lérins Islands, lunch anchorage, return by sunset"
                style={{
                  width: '100%', fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd',
                  background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.2)', borderRadius: 7,
                  padding: '10px 14px', outline: 'none', resize: 'vertical',
                }}
              />
            </FilterField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <FilterField label="Deposit">
              <TextField type="number" step="0.01" min={0} value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} />
            </FilterField>
            <FilterField label="Payment Deadline">
              <TextField type="date" value={formData.paymentDeadline} onChange={(e) => setFormData({ ...formData, paymentDeadline: e.target.value })} />
            </FilterField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <FilterField label="Price">
              <TextField type="number" step="0.01" min={0} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </FilterField>
            <FilterField label="Status">
              <SelectField value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </SelectField>
            </FilterField>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="submit" variant="primary" disabled={isSubmitting} style={{ flex: 1 }}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { X, FileDown } from 'lucide-react'
import Button from './ui/Button'
import { FilterField, TextField, SelectField } from './ui/FilterBar'

interface GenerateInvoiceModalProps {
  reservation: {
    id: number
    yacht: { model: string; builder: string | null } | null
    location: string | null
    price: number | null
    date: string | null
    endDate: string | null
  } | null
  onClose: () => void
}

function toDateInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : ''
}

export default function GenerateInvoiceModal({ reservation, onClose }: GenerateInvoiceModalProps) {
  const [serviceTitle, setServiceTitle] = useState('')
  const [serviceCity, setServiceCity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [priceTotal, setPriceTotal] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [applyVat, setApplyVat] = useState(false)
  const [vatRate, setVatRate] = useState('5')
  const [status, setStatus] = useState('draft')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<number | null>(null)

  useEffect(() => {
    if (!reservation) return
    const yachtLabel = reservation.yacht
      ? [reservation.yacht.builder, reservation.yacht.model].filter(Boolean).join(' ')
      : ''
    setServiceTitle(yachtLabel)
    setServiceCity(reservation.location || '')
    setStartDate(toDateInput(reservation.date))
    setEndDate(toDateInput(reservation.endDate))
    setPriceTotal(reservation.price != null ? String(reservation.price) : '')
    setCurrency('EUR')
    setApplyVat(false)
    setVatRate('5')
    setStatus('draft')
    setNotes('')
    setError('')
    setCreatedId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation?.id])

  if (!reservation) return null

  const handleClose = () => {
    setCreatedId(null)
    setError('')
    onClose()
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservation.id,
          serviceTitle: serviceTitle || undefined,
          serviceCity: serviceCity || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          priceTotal: priceTotal || undefined,
          currency,
          status,
          notes: notes || undefined,
          applyVat,
          vatRate: applyVat ? vatRate : undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to generate invoice')
        return
      }

      setCreatedId(data.id)
    } catch (err) {
      console.error('Generate invoice error:', err)
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(6,9,15,0.6)', backdropFilter: 'blur(6px)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 460, maxHeight: '88vh', overflowY: 'auto',
          background: 'linear-gradient(180deg, #0f1419 0%, #06090f 100%)',
          border: '1px solid rgba(184,151,74,0.2)', borderRadius: 12, padding: 32,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 8 }}>
              Generate Invoice
            </div>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 22, color: '#f5eedd', margin: 0 }}>
              {reservation.yacht ? [reservation.yacht.builder, reservation.yacht.model].filter(Boolean).join(' ') : 'Reservation'}
            </h3>
          </div>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#8f8f7f', cursor: 'pointer', padding: 4 }}>
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {createdId ? (
          <div>
            <p style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#8f8f7f', margin: '0 0 18px' }}>
              The invoice has been created and is ready to download.
            </p>
            <a href={`/api/admin/invoices/${createdId}/pdf`} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
              <Button type="button" variant="primary" style={{ width: '100%' }}>
                <FileDown size={14} strokeWidth={2} />
                Download Invoice
              </Button>
            </a>
          </div>
        ) : (
          <form onSubmit={handleGenerate}>
            {error && (
              <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '11px 14px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 12.5, marginBottom: 18 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <FilterField label="Service Title">
                <TextField value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} />
              </FilterField>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FilterField label="Service City">
                <TextField value={serviceCity} onChange={(e) => setServiceCity(e.target.value)} />
              </FilterField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <FilterField label="Start Date">
                <TextField type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </FilterField>
              <FilterField label="End Date">
                <TextField type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || undefined} />
              </FilterField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <FilterField label="Total Price">
                <TextField type="number" step="0.01" min={0} value={priceTotal} onChange={(e) => setPriceTotal(e.target.value)} />
              </FilterField>
              <FilterField label="Currency">
                <SelectField value={currency} onChange={setCurrency}>
                  <option value="EUR">EUR</option>
                  <option value="AED">AED</option>
                </SelectField>
              </FilterField>
            </div>

            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer',
                padding: '10px 14px', borderRadius: 7, background: 'rgba(184,151,74,0.04)', border: '1px solid rgba(184,151,74,0.12)',
              }}
            >
              <input
                type="checkbox"
                checked={applyVat}
                onChange={(e) => setApplyVat(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: '#b8974a', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc' }}>
                Apply VAT
              </span>
            </label>

            {applyVat && (
              <div style={{ marginBottom: 16 }}>
                <FilterField label="VAT Rate (%)">
                  <TextField type="number" step="0.1" min={0} value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
                </FilterField>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <FilterField label="Status">
                <SelectField value={status} onChange={setStatus}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </SelectField>
              </FilterField>
            </div>

            <div style={{ marginBottom: 28 }}>
              <FilterField label="Notes">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%', fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd',
                    background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.2)', borderRadius: 7,
                    padding: '10px 14px', outline: 'none', resize: 'vertical',
                  }}
                />
              </FilterField>
            </div>

            <Button type="submit" variant="primary" disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? 'Generating…' : 'Generate Invoice'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

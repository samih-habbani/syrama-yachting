'use client'

import { useEffect, useState } from 'react'
import { X, FileDown } from 'lucide-react'
import Button from './ui/Button'
import { FilterField, TextField, SelectField } from './ui/FilterBar'
import LineItemsEditor, { emptyItem, toLineItems, type EditableItem } from './LineItemsEditor'

interface Props {
  reservation: {
    id: number
    yacht: { model: string; builder: string | null } | null
    price: number | null
    quoteId: number | null
  } | null
  // When set, the modal edits this existing quote (PUT) instead of
  // creating a new one.
  quote?: {
    id: number; currency: string; applyVat: boolean; vatRate: number; status: string; notes: string | null
    validUntil: string | null; items: { description: string; quantity: number; unitPrice: number }[]
  } | null
  onClose: () => void
}

export default function GenerateQuoteModal({ reservation, quote, onClose }: Props) {
  const isEditing = !!quote
  const [status, setStatus] = useState('draft')
  const [rows, setRows] = useState<EditableItem[]>([emptyItem()])
  const [currency, setCurrency] = useState('AED')
  const [applyVat, setApplyVat] = useState(false)
  const [vatRate, setVatRate] = useState('5')
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<number | null>(null)

  useEffect(() => {
    if (!reservation) return
    const label = reservation.yacht ? `Yacht charter — ${[reservation.yacht.builder, reservation.yacht.model].filter(Boolean).join(' ')}` : 'Yacht charter'
    setError(''); setCreatedId(null)
    if (quote) {
      setRows(quote.items.map((i) => ({ description: i.description, quantity: String(i.quantity), unitPrice: String(i.unitPrice) })))
      setCurrency(quote.currency); setApplyVat(quote.applyVat); setVatRate(String(quote.vatRate || 5))
      setValidUntil(quote.validUntil ? quote.validUntil.slice(0, 10) : ''); setNotes(quote.notes || ''); setStatus(quote.status)
      return
    }
    setRows([{ description: label, quantity: '1', unitPrice: reservation.price != null ? String(reservation.price) : '' }])
    setCurrency('AED'); setApplyVat(false); setVatRate('5'); setValidUntil(''); setNotes(''); setStatus('draft')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation?.id, quote?.id])

  if (!reservation) return null
  const handleClose = () => { setCreatedId(null); setError(''); onClose() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const items = toLineItems(rows)
    if (items.length === 0) { setError('Add at least one line'); return }
    setIsLoading(true)
    try {
      const res = await fetch(isEditing ? `/api/admin/quotes/${quote!.id}` : '/api/admin/quotes', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservation.id, currency, items, applyVat, vatRate: applyVat ? vatRate : undefined, validUntil: validUntil || undefined, status, notes: notes || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to generate quote'); return }
      setCreatedId(data.id)
    } catch {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(6,9,15,0.6)', backdropFilter: 'blur(6px)' }} onClick={handleClose}>
      <div style={{ width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', background: 'linear-gradient(180deg, #0f1419 0%, #06090f 100%)', border: '1px solid rgba(184,151,74,0.2)', borderRadius: 12, padding: 32 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 8 }}>{isEditing ? 'Edit Quote' : 'Generate Quote'}</div>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 22, color: '#f5eedd', margin: 0 }}>
              {reservation.yacht ? [reservation.yacht.builder, reservation.yacht.model].filter(Boolean).join(' ') : 'Reservation'}
            </h3>
          </div>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#8f8f7f', cursor: 'pointer', padding: 4 }}><X size={18} strokeWidth={1.75} /></button>
        </div>

        {createdId ? (
          <div>
            <p style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#8f8f7f', margin: '0 0 18px' }}>The quote has been saved. You can now generate the invoice from this reservation — it will reuse these lines.</p>
            <a href={`/api/admin/quotes/${createdId}/pdf`} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
              <Button type="button" variant="primary" style={{ width: '100%' }}><FileDown size={14} strokeWidth={2} /> Download Quote</Button>
            </a>
          </div>
        ) : (
          <form onSubmit={submit}>
            {error && <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '11px 14px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 12.5, marginBottom: 18 }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <FilterField label="Currency">
                <SelectField value={currency} onChange={setCurrency}><option value="AED">AED (UAE dirham)</option><option value="EUR">EUR (euro)</option><option value="USD">USD (US dollar)</option></SelectField>
              </FilterField>
              <FilterField label="Valid until">
                <TextField type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </FilterField>
            </div>

            <div style={{ marginBottom: 18 }}><LineItemsEditor rows={rows} onChange={setRows} currency={currency} /></div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer', padding: '10px 14px', borderRadius: 7, background: 'rgba(184,151,74,0.04)', border: '1px solid rgba(184,151,74,0.12)' }}>
              <input type="checkbox" checked={applyVat} onChange={(e) => setApplyVat(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#b8974a' }} />
              <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc' }}>Apply VAT</span>
            </label>
            {applyVat && <div style={{ marginBottom: 16 }}><FilterField label="VAT Rate (%)"><TextField type="number" step="0.1" min={0} value={vatRate} onChange={(e) => setVatRate(e.target.value)} /></FilterField></div>}

            <div style={{ marginBottom: 16 }}>
              <FilterField label="Status">
                <SelectField value={status} onChange={setStatus}><option value="draft">Draft</option><option value="sent">Sent</option><option value="accepted">Accepted</option></SelectField>
              </FilterField>
            </div>

            <div style={{ marginBottom: 24 }}>
              <FilterField label="Notes">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ width: '100%', fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.2)', borderRadius: 7, padding: '10px 14px', outline: 'none', resize: 'vertical' }} />
              </FilterField>
            </div>
            <Button type="submit" variant="primary" disabled={isLoading} style={{ width: '100%' }}>{isLoading ? 'Saving…' : isEditing ? 'Save Quote' : 'Generate Quote'}</Button>
          </form>
        )}
      </div>
    </div>
  )
}

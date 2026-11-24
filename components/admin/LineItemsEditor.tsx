'use client'

import { Plus, Trash2 } from 'lucide-react'
import { TextField } from './ui/FilterBar'
import { formatMoney } from '@/lib/line-items'

// Editable rows as strings (so a half-typed number isn't mangled); the
// parent converts with toLineItems() on submit.
export interface EditableItem { description: string; quantity: string; unitPrice: string }

export const emptyItem = (): EditableItem => ({ description: '', quantity: '1', unitPrice: '' })

export function toLineItems(rows: EditableItem[]) {
  return rows
    .filter((r) => r.description.trim())
    .map((r) => ({ description: r.description.trim(), quantity: parseFloat(r.quantity) || 1, unitPrice: parseFloat(r.unitPrice) || 0 }))
}

export function editableTotal(rows: EditableItem[]) {
  return toLineItems(rows).reduce((n, i) => n + i.quantity * i.unitPrice, 0)
}

export default function LineItemsEditor({ rows, onChange, currency, placeholder }: {
  rows: EditableItem[]
  onChange: (rows: EditableItem[]) => void
  currency: string
  placeholder?: string
}) {
  const set = (i: number, patch: Partial<EditableItem>) => onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const label = { fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f' } as const

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 84px 28px', gap: 8, marginBottom: 6 }}>
        <span style={label}>Description</span><span style={label}>Qty</span><span style={label}>Unit ({currency})</span><span />
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 84px 28px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <TextField value={r.description} onChange={(e) => set(i, { description: e.target.value })} placeholder={i === 0 ? 'Yacht charter' : placeholder || 'Catering, sea toys…'} />
          <TextField type="number" min={0} step="any" value={r.quantity} onChange={(e) => set(i, { quantity: e.target.value })} />
          <TextField type="number" min={0} step="0.01" value={r.unitPrice} onChange={(e) => set(i, { unitPrice: e.target.value })} />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            disabled={rows.length === 1}
            aria-label="Remove line"
            style={{ background: 'none', border: 'none', color: '#e08080', cursor: rows.length === 1 ? 'not-allowed' : 'pointer', opacity: rows.length === 1 ? 0.3 : 1, padding: 0 }}
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, emptyItem()])}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed rgba(184,151,74,0.35)', color: '#d4b472', borderRadius: 7, padding: '8px 12px', fontFamily: 'var(--font-lora)', fontSize: 12, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
      >
        <Plus size={13} strokeWidth={2} /> Add an option (catering, sea toys…)
      </button>
      <div style={{ textAlign: 'right', marginTop: 10, fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc' }}>
        Subtotal: <strong>{formatMoney(editableTotal(rows))} {currency}</strong>
      </div>
    </div>
  )
}

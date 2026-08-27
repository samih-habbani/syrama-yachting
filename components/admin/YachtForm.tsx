'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import { FilterField, TextField, SelectField } from './ui/FilterBar'

interface Yacht {
  id?: number
  model?: string
  builder?: string | null
  length?: number
  cabins?: number
  maxGuests?: number | null
  year?: number | null
  priceDay?: number | null
  region?: string | null
  city?: string | null
  status?: string | null
  available?: boolean
}

interface YachtFormProps {
  yacht?: Yacht | null
  onSaved: () => void
}

// La base stocke le statut en français ('Location' / 'Vente') — on garde ces
// valeurs telles quelles pour rester lisible par les mêmes filtres que le site public.
function normalizeStatus(status?: string | null) {
  const s = (status || '').toLowerCase()
  return s === 'vente' ? 'Vente' : 'Location'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(184,151,74,0.1)' }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {children}
      </div>
    </div>
  )
}

export default function YachtForm({ yacht, onSaved }: YachtFormProps) {
  const [formData, setFormData] = useState({
    model: yacht?.model || '',
    builder: yacht?.builder || '',
    length: yacht?.length ?? '',
    cabins: yacht?.cabins ?? '',
    maxGuests: yacht?.maxGuests ?? '',
    year: yacht?.year ?? '',
    priceDay: yacht?.priceDay ?? '',
    region: yacht?.region || '',
    city: yacht?.city || '',
    status: normalizeStatus(yacht?.status),
    available: yacht?.available !== false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (patch: Partial<typeof formData>) => setFormData((prev) => ({ ...prev, ...patch }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const method = yacht?.id ? 'PUT' : 'POST'

      const response = await fetch('/api/admin/yachts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...(yacht?.id && { id: yacht.id }) }),
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
    <Card style={{ maxWidth: 760, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>
        {yacht?.id ? 'Edit Yacht' : 'Add New Yacht'}
      </h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
        {yacht?.id ? 'Update this listing\'s details.' : 'Fill in the details for this new listing.'}
      </p>

      {error && (
        <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '12px 16px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="Identity">
          <FilterField label="Model *">
            <TextField required value={formData.model} onChange={(e) => update({ model: e.target.value })} />
          </FilterField>
          <FilterField label="Builder">
            <TextField value={formData.builder} onChange={(e) => update({ builder: e.target.value })} />
          </FilterField>
          <FilterField label="Type">
            <SelectField value={formData.status} onChange={(v) => update({ status: v })}>
              <option value="Location">Charter</option>
              <option value="Vente">Sale</option>
            </SelectField>
          </FilterField>
        </Section>

        <Section title="Specifications">
          <FilterField label="Length (m) *">
            <TextField type="number" step="0.1" required value={formData.length} onChange={(e) => update({ length: e.target.value })} />
          </FilterField>
          <FilterField label="Cabins *">
            <TextField type="number" required value={formData.cabins} onChange={(e) => update({ cabins: e.target.value })} />
          </FilterField>
          <FilterField label="Max Guests">
            <TextField type="number" value={formData.maxGuests} onChange={(e) => update({ maxGuests: e.target.value })} />
          </FilterField>
          <FilterField label="Year">
            <TextField type="number" value={formData.year} onChange={(e) => update({ year: e.target.value })} />
          </FilterField>
        </Section>

        <Section title="Pricing & Location">
          <FilterField label="Price per Day">
            <TextField type="number" step="0.01" value={formData.priceDay} onChange={(e) => update({ priceDay: e.target.value })} />
          </FilterField>
          <FilterField label="Region">
            <TextField value={formData.region} onChange={(e) => update({ region: e.target.value })} />
          </FilterField>
          <FilterField label="City">
            <TextField value={formData.city} onChange={(e) => update({ city: e.target.value })} />
          </FilterField>
        </Section>

        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, cursor: 'pointer',
            padding: '14px 18px', borderRadius: 8, background: 'rgba(184,151,74,0.04)', border: '1px solid rgba(184,151,74,0.12)',
          }}
        >
          <input
            type="checkbox"
            checked={formData.available}
            onChange={(e) => update({ available: e.target.checked })}
            style={{ width: 16, height: 16, accentColor: '#b8974a', cursor: 'pointer' }}
          />
          <span style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc' }}>
            Available for booking
          </span>
        </label>

        <Button type="submit" variant="primary" disabled={isLoading}>
          <Save size={14} strokeWidth={2} />
          {isLoading ? 'Saving…' : 'Save Yacht'}
        </Button>
      </form>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { Save, X, Plus } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import { FilterField, TextField } from './ui/FilterBar'

export interface Provider {
  id?: number
  name?: string | null
  firstName?: string | null
  company?: string | null
  position?: string | null
  manager?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  instagram?: string | null
  catalogUrl?: string | null
  city?: string | null
  region?: string | null
  country?: string | null
  address?: string | null
  postalCode?: string | null
  type?: string | null
  services?: string[]
  description?: string | null
  firstContact?: string | null
  notes?: string | null
  isActive?: boolean | null
}

interface ProviderFormProps {
  provider?: Provider | null
  onSaved: () => void
  onCancel: () => void
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

const textareaStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-lora)',
  fontSize: 13,
  color: '#f5eedd',
  background: 'rgba(6,9,15,0.5)',
  border: '1px solid rgba(184,151,74,0.2)',
  borderRadius: 7,
  padding: '10px 14px',
  outline: 'none',
  resize: 'vertical',
  minHeight: 80,
}

export default function ProviderForm({ provider, onSaved, onCancel }: ProviderFormProps) {
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    firstName: provider?.firstName || '',
    company: provider?.company || '',
    position: provider?.position || '',
    manager: provider?.manager || '',
    email: provider?.email || '',
    phone: provider?.phone || '',
    website: provider?.website || '',
    instagram: provider?.instagram || '',
    catalogUrl: provider?.catalogUrl || '',
    city: provider?.city || '',
    region: provider?.region || '',
    country: provider?.country || '',
    address: provider?.address || '',
    postalCode: provider?.postalCode || '',
    type: provider?.type || '',
    services: provider?.services || [],
    description: provider?.description || '',
    firstContact: provider?.firstContact || '',
    notes: provider?.notes || '',
    isActive: provider?.isActive !== false,
  })
  const [serviceDraft, setServiceDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (patch: Partial<typeof formData>) => setFormData((prev) => ({ ...prev, ...patch }))

  const addService = () => {
    const value = serviceDraft.trim()
    if (!value || formData.services.includes(value)) { setServiceDraft(''); return }
    update({ services: [...formData.services, value] })
    setServiceDraft('')
  }

  const removeService = (service: string) => update({ services: formData.services.filter((s) => s !== service) })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const method = provider?.id ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/providers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...(provider?.id && { id: provider.id }) }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to save provider')
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
    <Card style={{ maxWidth: 820, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>
        {provider?.id ? 'Edit Provider' : 'Add New Provider'}
      </h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
        Nothing here is required — fill in whatever you have.
      </p>

      {error && (
        <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '12px 16px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="Contact">
          <FilterField label="Last Name">
            <TextField value={formData.name} onChange={(e) => update({ name: e.target.value })} />
          </FilterField>
          <FilterField label="First Name">
            <TextField value={formData.firstName} onChange={(e) => update({ firstName: e.target.value })} />
          </FilterField>
          <FilterField label="Position">
            <TextField value={formData.position} onChange={(e) => update({ position: e.target.value })} placeholder="e.g. Broker" />
          </FilterField>
          <FilterField label="Email">
            <TextField type="email" value={formData.email} onChange={(e) => update({ email: e.target.value })} />
          </FilterField>
          <FilterField label="Phone">
            <TextField type="tel" value={formData.phone} onChange={(e) => update({ phone: e.target.value })} />
          </FilterField>
          <FilterField label="Managed By">
            <TextField value={formData.manager} onChange={(e) => update({ manager: e.target.value })} placeholder="e.g. Adel" />
          </FilterField>
        </Section>

        <Section title="Company">
          <FilterField label="Company">
            <TextField value={formData.company} onChange={(e) => update({ company: e.target.value })} />
          </FilterField>
          <FilterField label="Type">
            <TextField value={formData.type} onChange={(e) => update({ type: e.target.value })} placeholder="e.g. Yacht Charter, Restaurant…" />
          </FilterField>
          <FilterField label="Website">
            <TextField value={formData.website} onChange={(e) => update({ website: e.target.value })} />
          </FilterField>
          <FilterField label="Instagram">
            <TextField value={formData.instagram} onChange={(e) => update({ instagram: e.target.value })} />
          </FilterField>
          <FilterField label="Catalog URL">
            <TextField value={formData.catalogUrl} onChange={(e) => update({ catalogUrl: e.target.value })} placeholder="e.g. Google Drive link" />
          </FilterField>
        </Section>

        <Section title="Location">
          <FilterField label="City">
            <TextField value={formData.city} onChange={(e) => update({ city: e.target.value })} />
          </FilterField>
          <FilterField label="Region">
            <TextField value={formData.region} onChange={(e) => update({ region: e.target.value })} />
          </FilterField>
          <FilterField label="Country">
            <TextField value={formData.country} onChange={(e) => update({ country: e.target.value })} />
          </FilterField>
          <FilterField label="Address">
            <TextField value={formData.address} onChange={(e) => update({ address: e.target.value })} />
          </FilterField>
          <FilterField label="Postal Code">
            <TextField value={formData.postalCode} onChange={(e) => update({ postalCode: e.target.value })} />
          </FilterField>
        </Section>

        <Section title="Services">
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: formData.services.length > 0 ? 12 : 0 }}>
              <TextField
                value={serviceDraft}
                onChange={(e) => setServiceDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addService() } }}
                placeholder="e.g. Location, Vente, Conciergerie…"
              />
              <Button type="button" variant="secondary" onClick={addService}>
                <Plus size={14} strokeWidth={2} />
                Add
              </Button>
            </div>
            {formData.services.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {formData.services.map((service) => (
                  <span
                    key={service}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: 600, color: '#d4b472',
                      background: 'rgba(184,151,74,0.12)', border: '1px solid rgba(184,151,74,0.3)',
                      borderRadius: 999, padding: '5px 8px 5px 13px',
                    }}
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      aria-label={`Remove ${service}`}
                      style={{ display: 'flex', background: 'transparent', border: 'none', color: '#d4b472', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section title="Notes">
          <div style={{ gridColumn: '1 / -1' }}>
            <FilterField label="Description">
              <textarea style={{ ...textareaStyle }} value={formData.description} onChange={(e) => update({ description: e.target.value })} />
            </FilterField>
          </div>
          <FilterField label="First Contact">
            <TextField value={formData.firstContact} onChange={(e) => update({ firstContact: e.target.value })} placeholder="How / who introduced you" />
          </FilterField>
          <div style={{ gridColumn: '1 / -1' }}>
            <FilterField label="Internal Notes">
              <textarea style={{ ...textareaStyle }} value={formData.notes} onChange={(e) => update({ notes: e.target.value })} />
            </FilterField>
          </div>
        </Section>

        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, cursor: 'pointer',
            padding: '14px 18px', borderRadius: 8, background: 'rgba(184,151,74,0.04)', border: '1px solid rgba(184,151,74,0.12)',
          }}
        >
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => update({ isActive: e.target.checked })}
            style={{ width: 16, height: 16, accentColor: '#b8974a', cursor: 'pointer' }}
          />
          <span style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc' }}>
            Active contact
          </span>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" disabled={isLoading}>
            <Save size={14} strokeWidth={2} />
            {isLoading ? 'Saving…' : 'Save Provider'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

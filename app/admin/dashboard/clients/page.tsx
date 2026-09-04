'use client'

import { useEffect, useState } from 'react'
import { Contact, Mail, Phone, CalendarDays, Briefcase, Hash, Pencil, ArrowLeft, Save, Plus, X, Users, UserCheck, UserPlus, CalendarCheck, Anchor, Home, Package } from 'lucide-react'
import ClientFilters, { EMPTY_CLIENT_FILTERS, type ClientFilterState } from '@/components/admin/ClientFilters'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import Pagination from '@/components/admin/ui/Pagination'
import EmptyState from '@/components/admin/ui/EmptyState'
import ActionsMenu from '@/components/admin/ui/ActionsMenu'
import StatCard from '@/components/admin/ui/StatCard'
import { FilterField, TextField } from '@/components/admin/ui/FilterBar'
import SearchSelectField, { type SearchSelectOption } from '@/components/admin/ui/SearchSelectField'
import EditableCell from '@/components/admin/ui/EditableCell'

interface ReservationProduct {
  id: number
  objectTitle: string | null
  image: string | null
  yacht: { model: string; builder: string | null; media: { url: string }[] } | null
  property: { title: string | null } | null
}

interface Client {
  id: number
  fullName: string
  email: string | null
  phone: string | null
  services: string[]
  tags: string[]
  createdAt: string
  _count?: { reservations: number }
  reservations?: ReservationProduct[]
}

// One chip per distinct thing a client has booked — yacht model or villa
// title, with a thumbnail when we have one. Several reservations of the
// same yacht collapse into a single chip.
interface ProductChip {
  key: string
  name: string
  image: string | null
  kind: 'yacht' | 'property' | 'other'
}

function productLabel(r: ReservationProduct): { name: string; image: string | null; kind: ProductChip['kind'] } {
  const kind: ProductChip['kind'] = r.yacht ? 'yacht' : r.property ? 'property' : 'other'
  // `Yacht.model` sometimes already has the brand baked in (e.g. model
  // "PRINCESS V55", builder "PRINCESS") and sometimes doesn't (model "32",
  // builder "VANDUTCH") — only prefix the builder when it isn't already
  // there, so we get "VANDUTCH 32" without ending up with "PRINCESS
  // PRINCESS V55".
  const yachtName = r.yacht
    ? (r.yacht.builder && !r.yacht.model.toLowerCase().startsWith(r.yacht.builder.toLowerCase().split(' ')[0])
        ? `${r.yacht.builder} ${r.yacht.model}`
        : r.yacht.model)
    : null
  const rawName = yachtName || r.property?.title || r.objectTitle || 'Reservation'
  const name = rawName.replace(/^-+\s*/, '').trim() || 'Reservation'
  const imageFile = r.image || r.yacht?.media?.[0]?.url || null
  const image = imageFile ? `/uploads/yachts/${imageFile}` : null
  return { name, image, kind }
}

function clientProducts(client: Client): ProductChip[] {
  const seen = new Map<string, ProductChip>()
  for (const r of client.reservations || []) {
    const { name, image, kind } = productLabel(r)
    const key = `${kind}:${name}`
    if (!seen.has(key)) seen.set(key, { key, name, image, kind })
  }
  return Array.from(seen.values())
}

function ProductChipIcon({ kind }: { kind: ProductChip['kind'] }) {
  if (kind === 'yacht') return <Anchor size={11} strokeWidth={2} />
  if (kind === 'property') return <Home size={11} strokeWidth={2} />
  return <Package size={11} strokeWidth={2} />
}

interface ClientStats {
  total: number
  withReservations: number
  newThisMonth: number
  totalReservations: number
}

const GRID = '1.4fr 1.5fr 1fr 1.5fr 1.9fr 44px'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<ClientFilterState>(EMPTY_CLIENT_FILTERS)
  const [stats, setStats] = useState<ClientStats | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', services: [] as string[], tags: [] as string[] })
  const [serviceDraft, setServiceDraft] = useState('')
  const [tagDraft, setTagDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  // Key is `${clientId}:${field}` — set when an inline save fails, so the
  // one offending cell can show an error state without a page-wide banner.
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({})

  // Products booked, shown while editing a client — kept as its own bit of
  // state (seeded from the client being edited) so adding/removing one
  // updates the panel immediately without a full page refetch.
  const [editingReservations, setEditingReservations] = useState<ReservationProduct[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [productType, setProductType] = useState<'yacht' | 'property'>('yacht')
  const [yachtOptions, setYachtOptions] = useState<SearchSelectOption[]>([])
  const [propertyOptions, setPropertyOptions] = useState<SearchSelectOption[]>([])
  const [productOptionsLoading, setProductOptionsLoading] = useState(false)
  const [newProductId, setNewProductId] = useState<number | null>(null)
  const [newProductDate, setNewProductDate] = useState('')
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productError, setProductError] = useState('')
  const [removingReservationId, setRemovingReservationId] = useState<number | null>(null)

  const loadProductOptions = async () => {
    if (yachtOptions.length > 0 || propertyOptions.length > 0) return
    setProductOptionsLoading(true)
    try {
      const [yachtsRes, propertiesRes] = await Promise.all([
        fetch('/api/admin/yachts?limit=1000'),
        fetch('/api/admin/properties?limit=500'),
      ])
      if (yachtsRes.ok) {
        const data = await yachtsRes.json()
        setYachtOptions(
          (data.yachts || []).map((y: { id: number; model: string; builder: string | null; region: string | null; city: string | null }) => ({
            value: y.id,
            label: y.builder && !y.model.toLowerCase().startsWith(y.builder.toLowerCase().split(' ')[0]) ? `${y.builder} ${y.model}` : y.model,
            sublabel: [y.city, y.region].filter(Boolean).join(', '),
          }))
        )
      }
      if (propertiesRes.ok) {
        const data = await propertiesRes.json()
        setPropertyOptions(
          (data.properties || []).map((p: { id: number; title: string | null; city: string | null; region: string | null }) => ({
            value: p.id,
            label: p.title || `Property #${p.id}`,
            sublabel: [p.city, p.region].filter(Boolean).join(', '),
          }))
        )
      }
    } catch (err) {
      console.error('Load product options error:', err)
    } finally {
      setProductOptionsLoading(false)
    }
  }

  const openAddProduct = () => {
    setShowAddProduct(true)
    setProductType('yacht')
    setNewProductId(null)
    setNewProductDate('')
    setProductError('')
    loadProductOptions()
  }

  const handleAddProduct = async () => {
    if (!editingClient || !newProductId) return
    setProductError('')
    setIsAddingProduct(true)
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: editingClient.id,
          [productType === 'yacht' ? 'yachtId' : 'propertyId']: newProductId,
          date: newProductDate || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setProductError(data.error || 'Failed to add product')
        return
      }

      const created = await response.json()
      setEditingReservations((prev) => [created, ...prev])
      setShowAddProduct(false)
      setNewProductId(null)
      setNewProductDate('')
      // Keep the underlying list/stat cards in sync for when we go back.
      fetchClients(currentPage)
      fetchStats()
    } catch (err) {
      console.error('Add product error:', err)
      setProductError('An error occurred')
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleRemoveProduct = async (reservationId: number) => {
    if (!confirm('Remove this product from the client?')) return
    setRemovingReservationId(reservationId)
    try {
      const response = await fetch(`/api/reservations?id=${reservationId}`, { method: 'DELETE' })
      if (response.ok) {
        setEditingReservations((prev) => prev.filter((r) => r.id !== reservationId))
        fetchClients(currentPage)
        fetchStats()
      }
    } catch (err) {
      console.error('Remove product error:', err)
    } finally {
      setRemovingReservationId(null)
    }
  }

  const addService = () => {
    const value = serviceDraft.trim()
    if (!value || formData.services.includes(value)) { setServiceDraft(''); return }
    setFormData((prev) => ({ ...prev, services: [...prev.services, value] }))
    setServiceDraft('')
  }

  const removeService = (service: string) =>
    setFormData((prev) => ({ ...prev, services: prev.services.filter((s) => s !== service) }))

  const addTag = () => {
    const value = tagDraft.trim()
    if (!value || formData.tags.includes(value)) { setTagDraft(''); return }
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }))
    setTagDraft('')
  }

  const removeTag = (tag: string) =>
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/clients/meta')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Fetch client stats error:', error)
    }
  }

  const fetchClients = async (page: number) => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', '10')

      if (filters.fullName) queryParams.append('fullName', filters.fullName)
      if (filters.email) queryParams.append('email', filters.email)
      if (filters.phone) queryParams.append('phone', filters.phone)
      filters.tags.forEach((t) => queryParams.append('tags', t))
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/clients?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Fetch clients error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    fetchClients(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleInlineSave = async (clientId: number, field: 'fullName' | 'email' | 'phone', value: string) => {
    const key = `${clientId}:${field}`
    // Optimistic — the cell reflects the new value immediately.
    const previous = clients.find((c) => c.id === clientId)?.[field]
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, [field]: value } : c)))
    setInlineErrors((prev) => { const next = { ...prev }; delete next[key]; return next })

    try {
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId, [field]: value }),
      })

      if (!response.ok) {
        const data = await response.json()
        // Revert to the last known-good value and flag the cell.
        setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, [field]: previous ?? '' } : c)))
        setInlineErrors((prev) => ({ ...prev, [key]: data.error || 'Failed to save' }))
      }
    } catch (err) {
      console.error('Inline update error:', err)
      setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, [field]: previous ?? '' } : c)))
      setInlineErrors((prev) => ({ ...prev, [key]: 'Failed to save' }))
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({ fullName: client.fullName, email: client.email || '', phone: client.phone || '', services: client.services || [], tags: client.tags || [] })
    setServiceDraft('')
    setTagDraft('')
    setError('')
    setEditingReservations(client.reservations || [])
    setShowAddProduct(false)
    setProductError('')
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingClient(null)
    setFormData({ fullName: '', email: '', phone: '', services: [], tags: [] })
    setServiceDraft('')
    setTagDraft('')
    setError('')
    setEditingReservations([])
    setShowAddProduct(false)
    setProductError('')
    setShowForm(true)
  }

  const handleBackToList = () => {
    setShowForm(false)
    setEditingClient(null)
    setEditingReservations([])
    setShowAddProduct(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const method = editingClient?.id ? 'PUT' : 'POST'
      const body = editingClient?.id ? { id: editingClient.id, ...formData } : formData

      const response = await fetch('/api/clients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to save client')
        return
      }

      await fetchClients(currentPage)
      await fetchStats()
      handleBackToList()
    } catch (error) {
      console.error('Save client error:', error)
      setError('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  if (showForm) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={handleBackToList} style={{ marginBottom: 24 }}>
          <ArrowLeft size={14} strokeWidth={2} />
          Back to clients
        </Button>

        <Card style={{ maxWidth: 480, padding: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>
            {editingClient ? 'Edit Client' : 'Add New Client'}
          </h2>
          <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
            {editingClient ? "Update this client's contact details." : 'Create a new client record.'}
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '12px 16px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 13, marginBottom: 20 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
              <FilterField label="Full Name *">
                <TextField required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </FilterField>
              <FilterField label="Email *">
                <TextField type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </FilterField>
              <FilterField label="Phone *">
                <TextField type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </FilterField>
              <FilterField label="Services">
                <div style={{ display: 'flex', gap: 8, marginBottom: formData.services.length > 0 ? 12 : 0 }}>
                  <TextField
                    value={serviceDraft}
                    onChange={(e) => setServiceDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addService() } }}
                    placeholder="e.g. Yacht Charter, Yacht Sales…"
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
              </FilterField>
              <FilterField label="Tags">
                <div style={{ display: 'flex', gap: 8, marginBottom: formData.tags.length > 0 ? 12 : 0 }}>
                  <TextField
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    placeholder="e.g. 26 French Riviera Yacht Charter"
                  />
                  <Button type="button" variant="secondary" onClick={addTag}>
                    <Plus size={14} strokeWidth={2} />
                    Add
                  </Button>
                </div>
                <p style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: '#6b6b60', margin: '0 0 12px' }}>
                  Free-form — e.g. year + region + service, so you can tell at a glance where and when this client was active.
                </p>
                {formData.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: 600, color: '#9db3cc',
                          background: 'rgba(124,147,173,0.12)', border: '1px solid rgba(124,147,173,0.3)',
                          borderRadius: 999, padding: '5px 8px 5px 13px',
                        }}
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove ${tag}`}
                          style={{ display: 'flex', background: 'transparent', border: 'none', color: '#9db3cc', cursor: 'pointer', padding: 2 }}
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </FilterField>
            </div>

            <Button type="submit" variant="primary" disabled={isSaving}>
              <Save size={14} strokeWidth={2} />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>

          {editingClient && (
            <div style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid rgba(184,151,74,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, fontWeight: 600, color: '#f5eedd' }}>
                    Products Booked
                  </div>
                  <p style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#6b6b60', margin: '3px 0 0' }}>
                    What this client has reserved — a visual reminder, shown on the clients list too.
                  </p>
                </div>
                {!showAddProduct && (
                  <Button type="button" variant="secondary" size="sm" onClick={openAddProduct}>
                    <Plus size={13} strokeWidth={2.5} />
                    Add Product
                  </Button>
                )}
              </div>

              {editingReservations.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: showAddProduct ? 16 : 0 }}>
                  {editingReservations.map((r) => {
                    const { name, image, kind } = productLabel(r)
                    return (
                      <span
                        key={r.id}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: 600, color: '#d4b472',
                          background: 'rgba(184,151,74,0.1)', border: '1px solid rgba(184,151,74,0.25)',
                          borderRadius: 999, padding: '4px 6px 4px 4px', maxWidth: 220,
                        }}
                      >
                        {image ? (
                          <img src={image} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <span
                            style={{
                              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(184,151,74,0.15)', color: '#d4b472',
                            }}
                          >
                            <ProductChipIcon kind={kind} />
                          </span>
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(r.id)}
                          disabled={removingReservationId === r.id}
                          aria-label={`Remove ${name}`}
                          style={{
                            display: 'flex', background: 'transparent', border: 'none', color: '#d4b472',
                            cursor: removingReservationId === r.id ? 'default' : 'pointer', padding: 2, opacity: removingReservationId === r.id ? 0.5 : 1,
                          }}
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}

              {editingReservations.length === 0 && !showAddProduct && (
                <p style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#5a5a52', margin: 0 }}>
                  Nothing booked yet.
                </p>
              )}

              {showAddProduct && (
                <div style={{ background: 'rgba(6,9,15,0.4)', border: '1px solid rgba(184,151,74,0.15)', borderRadius: 8, padding: 16 }}>
                  {productError && (
                    <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '9px 12px', borderRadius: 6, fontFamily: 'var(--font-lora)', fontSize: 12, marginBottom: 14 }}>
                      {productError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <Button
                      type="button"
                      variant={productType === 'yacht' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => { setProductType('yacht'); setNewProductId(null) }}
                    >
                      <Anchor size={12} strokeWidth={2} />
                      Yacht
                    </Button>
                    <Button
                      type="button"
                      variant={productType === 'property' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => { setProductType('property'); setNewProductId(null) }}
                    >
                      <Home size={12} strokeWidth={2} />
                      Villa
                    </Button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <FilterField label={productType === 'yacht' ? 'Yacht' : 'Villa'}>
                      <SearchSelectField
                        label={productType === 'yacht' ? 'yacht' : 'villa'}
                        options={productType === 'yacht' ? yachtOptions : propertyOptions}
                        value={newProductId}
                        onChange={setNewProductId}
                        placeholder={productOptionsLoading ? 'Loading…' : `Search a ${productType === 'yacht' ? 'yacht' : 'villa'}…`}
                      />
                    </FilterField>
                    <FilterField label="Date (optional)">
                      <TextField type="date" value={newProductDate} onChange={(e) => setNewProductDate(e.target.value)} />
                    </FilterField>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button type="button" variant="primary" size="sm" disabled={!newProductId || isAddingProduct} onClick={handleAddProduct}>
                      {isAddingProduct ? 'Adding…' : 'Add'}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddProduct(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Everyone who has requested a charter."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Clients' }]}
        action={
          <Button variant="primary" onClick={handleAddNew}>
            <Plus size={14} strokeWidth={2.5} />
            Add Client
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Clients" value={stats?.total ?? '—'} icon={Users} tone="gold" />
        <StatCard label="With Reservations" value={stats?.withReservations ?? '—'} icon={UserCheck} tone="green" />
        <StatCard label="New This Month" value={stats?.newThisMonth ?? '—'} icon={UserPlus} tone="blue" />
        <StatCard label="Total Reservations" value={stats?.totalReservations ?? '—'} icon={CalendarCheck} tone="neutral" />
      </div>

      <ClientFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading clients…</div>
        </Card>
      ) : clients.length === 0 ? (
        <Card><EmptyState icon={Contact} title="No clients yet" description="Clients appear here once they submit a reservation." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center',
              padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)',
              fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f',
            }}
          >
            <div>Client</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Hashtags</div>
            <div>Products Booked</div>
            <div />
          </div>

          {clients.map((client, i) => (
            <div
              key={client.id}
              style={{
                display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center',
                padding: '14px 24px', borderBottom: i < clients.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(184,151,74,0.18), rgba(184,151,74,0.06))',
                    border: '1px solid rgba(184,151,74,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 700, color: '#d4b472',
                  }}
                >
                  {client.fullName.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd' }}>
                    <EditableCell
                      value={client.fullName}
                      onSave={(v) => handleInlineSave(client.id, 'fullName', v)}
                      hasError={!!inlineErrors[`${client.id}:fullName`]}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-lora)', fontSize: 11, color: '#6b6b60', marginTop: 2 }}>
                    <CalendarDays size={10} strokeWidth={1.75} />
                    {new Date(client.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', minWidth: 0 }}>
                <Mail size={11} strokeWidth={1.75} color="#6b6b60" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <EditableCell
                    value={client.email}
                    type="email"
                    onSave={(v) => handleInlineSave(client.id, 'email', v)}
                    hasError={!!inlineErrors[`${client.id}:email`]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc', minWidth: 0 }}>
                <Phone size={11} strokeWidth={1.75} color="#6b6b60" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <EditableCell
                    value={client.phone}
                    type="tel"
                    onSave={(v) => handleInlineSave(client.id, 'phone', v)}
                    hasError={!!inlineErrors[`${client.id}:phone`]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(client.services || []).map((service) => (
                  <Badge key={service} tone="neutral">
                    <Briefcase size={10} strokeWidth={2} />
                    {service}
                  </Badge>
                ))}
                {(client.tags || []).map((tag) => (
                  <Badge key={tag} tone="blue">
                    <Hash size={10} strokeWidth={2} />
                    {tag}
                  </Badge>
                ))}
                {(client.services || []).length === 0 && (client.tags || []).length === 0 && (
                  <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#5a5a52' }}>—</span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {clientProducts(client).map((product) => (
                  <span
                    key={product.key}
                    title={product.name}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontFamily: 'var(--font-lora)', fontSize: 11.5, fontWeight: 600, color: '#d4b472',
                      background: 'rgba(184,151,74,0.1)', border: '1px solid rgba(184,151,74,0.25)',
                      borderRadius: 999, padding: '3px 10px 3px 3px', maxWidth: 180,
                    }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(184,151,74,0.15)', color: '#d4b472',
                        }}
                      >
                        <ProductChipIcon kind={product.kind} />
                      </span>
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
                  </span>
                ))}
                {clientProducts(client).length === 0 && (
                  <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#5a5a52' }}>—</span>
                )}
              </div>

              <ActionsMenu items={[{ label: 'Edit', icon: <Pencil size={13.5} strokeWidth={1.75} />, onClick: () => handleEdit(client) }]} />
            </div>
          ))}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
      )}
    </div>
  )
}

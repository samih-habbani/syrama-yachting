'use client'

import { useEffect, useState } from 'react'
import { Contact, Mail, Phone, CalendarDays, Briefcase, Pencil, ArrowLeft, Save } from 'lucide-react'
import ClientFilters from '@/components/admin/ClientFilters'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import Pagination from '@/components/admin/ui/Pagination'
import EmptyState from '@/components/admin/ui/EmptyState'
import ActionsMenu from '@/components/admin/ui/ActionsMenu'
import { FilterField, TextField } from '@/components/admin/ui/FilterBar'

interface Client {
  id: number
  fullName: string
  email: string
  phone: string
  service: string | null
  createdAt: string
  _count?: { reservations: number }
}

const EMPTY_FILTERS = { fullName: '', email: '', phone: '', dateFrom: '', dateTo: '' }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', service: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchClients = async (page: number) => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', '10')

      if (filters.fullName) queryParams.append('fullName', filters.fullName)
      if (filters.email) queryParams.append('email', filters.email)
      if (filters.phone) queryParams.append('phone', filters.phone)
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

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({ fullName: client.fullName, email: client.email, phone: client.phone, service: client.service || '' })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingClient.id, ...formData }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to update client')
        return
      }

      await fetchClients(currentPage)
      setEditingClient(null)
    } catch (error) {
      console.error('Update client error:', error)
      setError('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  if (editingClient) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setEditingClient(null)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={14} strokeWidth={2} />
          Back to clients
        </Button>

        <Card style={{ maxWidth: 480, padding: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>
            Edit Client
          </h2>
          <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
            Update this client&apos;s contact details.
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
              <FilterField label="Service">
                <TextField value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} placeholder="e.g. Yacht Charter, Yacht Sales…" />
              </FilterField>
            </div>

            <Button type="submit" variant="primary" disabled={isSaving}>
              <Save size={14} strokeWidth={2} />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
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
      />

      <ClientFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading clients…</div>
        </Card>
      ) : clients.length === 0 ? (
        <Card><EmptyState icon={Contact} title="No clients yet" description="Clients appear here once they submit a reservation." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          {clients.map((client, i) => (
            <div
              key={client.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20,
                padding: '18px 24px', borderBottom: i < clients.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(184,151,74,0.18), rgba(184,151,74,0.06))',
                    border: '1px solid rgba(184,151,74,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-lora)', fontSize: 13, fontWeight: 700, color: '#d4b472',
                  }}
                >
                  {client.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd' }}>{client.fullName}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 3, fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={11} strokeWidth={1.75} />{client.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={11} strokeWidth={1.75} />{client.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><CalendarDays size={11} strokeWidth={1.75} />{new Date(client.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {client.service && (
                  <Badge tone="neutral">
                    <Briefcase size={10} strokeWidth={2} />
                    {client.service}
                  </Badge>
                )}
                <Badge tone="gold">{client._count?.reservations || 0} reservation{(client._count?.reservations || 0) === 1 ? '' : 's'}</Badge>
                <ActionsMenu items={[{ label: 'Edit', icon: <Pencil size={13.5} strokeWidth={1.75} />, onClick: () => handleEdit(client) }]} />
              </div>
            </div>
          ))}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Plus, CalendarCheck, Users as UsersIcon, MapPin, Euro, Pencil, FileDown, Link2, Receipt, Percent } from 'lucide-react'
import ReservationFilters from '@/components/admin/ReservationFilters'
import CreateReservationModal from '@/components/admin/CreateReservationModal'
import EditReservationModal from '@/components/admin/EditReservationModal'
import GenerateBookingLinkModal from '@/components/admin/GenerateBookingLinkModal'
import GenerateInvoiceModal from '@/components/admin/GenerateInvoiceModal'
import GenerateCommissionInvoiceModal from '@/components/admin/GenerateCommissionInvoiceModal'
import PageHeader from '@/components/admin/ui/PageHeader'
import Button from '@/components/admin/ui/Button'
import Card from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Pagination from '@/components/admin/ui/Pagination'
import EmptyState from '@/components/admin/ui/EmptyState'
import ActionsMenu from '@/components/admin/ui/ActionsMenu'

interface Reservation {
  id: number
  date: string | null
  endDate: string | null
  numberOfPeople: number | null
  location: string | null
  price?: number | null
  status: string
  createdAt: string
  startTime: string | null
  endTime: string | null
  plannedItinerary: string | null
  deposit: number | null
  paymentDeadline: string | null
  client: { fullName: string; email: string; phone: string }
  yacht: { id: number; model: string; builder: string | null; providerId: number | null } | null
  contract: { id: number } | null
  bookingLinkToken: string | null
  invoiceId: number | null
  commissionInvoiceId: number | null
}

const EMPTY_FILTERS = { id: '', clientName: '', yachtModel: '', dateFrom: '', dateTo: '' }

function statusTone(status: string): 'gold' | 'green' | 'red' {
  if (status === 'confirmed') return 'green'
  if (status === 'cancelled') return 'red'
  return 'gold'
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [linkingReservation, setLinkingReservation] = useState<Reservation | null>(null)
  const [invoicingReservation, setInvoicingReservation] = useState<Reservation | null>(null)
  const [commissionReservation, setCommissionReservation] = useState<Reservation | null>(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const fetchReservations = async (page: number) => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', '10')

      if (filters.id) queryParams.append('id', filters.id)
      if (filters.clientName) queryParams.append('clientName', filters.clientName)
      if (filters.yachtModel) queryParams.append('yachtModel', filters.yachtModel)
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/reservations?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReservations(data.reservations)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Fetch reservations error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    fetchReservations(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters])

  return (
    <div>
      <PageHeader
        title="Reservations"
        description="All incoming yacht charter requests."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Reservations' }]}
        action={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} strokeWidth={2.5} />
            Create Reservation
          </Button>
        }
      />

      <ReservationFilters filters={filters} onFiltersChange={setFilters} />

      <CreateReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchReservations(1)}
      />

      <EditReservationModal
        reservation={editingReservation}
        onClose={() => setEditingReservation(null)}
        onSuccess={() => fetchReservations(currentPage)}
      />

      <GenerateBookingLinkModal
        yacht={linkingReservation?.yacht || null}
        reservation={linkingReservation ? {
          id: linkingReservation.id,
          date: linkingReservation.date,
          endDate: linkingReservation.endDate,
          startTime: linkingReservation.startTime,
          endTime: linkingReservation.endTime,
          numberOfPeople: linkingReservation.numberOfPeople,
          bookingLinkToken: linkingReservation.bookingLinkToken,
        } : null}
        onClose={() => {
          setLinkingReservation(null)
          // A link may have just been generated — refresh so the row
          // switches from "Generate Booking Link" to "Get Link".
          fetchReservations(currentPage)
        }}
      />

      <GenerateInvoiceModal
        reservation={invoicingReservation ? {
          id: invoicingReservation.id,
          yacht: invoicingReservation.yacht,
          location: invoicingReservation.location,
          price: invoicingReservation.price ?? null,
          date: invoicingReservation.date,
          endDate: invoicingReservation.endDate,
        } : null}
        onClose={() => {
          setInvoicingReservation(null)
          // An invoice may have just been generated — refresh so the row
          // switches from "Generate Invoice" to "Download Invoice".
          fetchReservations(currentPage)
        }}
      />

      <GenerateCommissionInvoiceModal
        reservation={commissionReservation ? {
          id: commissionReservation.id,
          yacht: commissionReservation.yacht,
          price: commissionReservation.price ?? null,
          providerId: commissionReservation.yacht?.providerId ?? null,
        } : null}
        onClose={() => {
          setCommissionReservation(null)
          fetchReservations(currentPage)
        }}
      />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading reservations…</div>
        </Card>
      ) : reservations.length === 0 ? (
        <Card><EmptyState icon={CalendarCheck} title="No reservations yet" description="Charter requests will appear here once submitted." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          {reservations.map((res, i) => (
            <div
              key={res.id}
              style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1.8fr 1fr 44px', gap: 20, alignItems: 'center',
                padding: '20px 24px', borderBottom: i < reservations.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd' }}>{res.client.fullName}</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', marginTop: 2 }}>{res.client.email}</div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc' }}>{res.yacht?.model || '—'}</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', marginTop: 2 }}>
                  {res.date ? new Date(res.date).toLocaleDateString() : '—'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UsersIcon size={12} strokeWidth={1.75} />{res.numberOfPeople != null ? `${res.numberOfPeople} guests` : '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} strokeWidth={1.75} />{res.location || '—'}</span>
                {res.price != null && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Euro size={12} strokeWidth={1.75} />{res.price.toFixed(2)}</span>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <Badge tone={statusTone(res.status)} dot>{res.status}</Badge>
              </div>

              <ActionsMenu
                items={[
                  { label: 'Edit', icon: <Pencil size={13.5} strokeWidth={1.75} />, onClick: () => setEditingReservation(res) },
                  ...(res.contract
                    ? [
                        { label: 'Download Contract', icon: <FileDown size={13.5} strokeWidth={1.75} />, onClick: () => window.open(`/api/admin/contracts/${res.contract!.id}/pdf`, '_blank') },
                        res.invoiceId
                          ? { label: 'Download Invoice', icon: <Receipt size={13.5} strokeWidth={1.75} />, onClick: () => window.open(`/api/admin/invoices/${res.invoiceId}/pdf`, '_blank') }
                          : { label: 'Generate Invoice', icon: <Receipt size={13.5} strokeWidth={1.75} />, onClick: () => setInvoicingReservation(res) },
                      ]
                    : res.bookingLinkToken
                      ? [{ label: 'Get Link', icon: <Link2 size={13.5} strokeWidth={1.75} />, onClick: () => setLinkingReservation(res) }]
                      : res.yacht
                        ? [{ label: 'Generate Booking Link', icon: <Link2 size={13.5} strokeWidth={1.75} />, onClick: () => setLinkingReservation(res) }]
                        : []),
                  // Independent of the client-facing contract/invoice flow
                  // above — for a booking where SYRAMA was the referral /
                  // apporteur d'affaires rather than the direct party.
                  res.commissionInvoiceId
                    ? { label: 'Download Commission Invoice', icon: <Percent size={13.5} strokeWidth={1.75} />, onClick: () => window.open(`/api/admin/invoices/${res.commissionInvoiceId}/pdf`, '_blank') }
                    : { label: 'Generate Commission Invoice', icon: <Percent size={13.5} strokeWidth={1.75} />, onClick: () => setCommissionReservation(res) },
                ]}
              />
            </div>
          ))}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
      )}
    </div>
  )
}

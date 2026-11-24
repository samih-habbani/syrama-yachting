'use client'

import { useEffect, useState } from 'react'
import { FileText, Pencil, FileDown, Trash2 } from 'lucide-react'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import EmptyState from '@/components/admin/ui/EmptyState'
import Pagination from '@/components/admin/ui/Pagination'
import ActionsMenu from '@/components/admin/ui/ActionsMenu'
import GenerateQuoteModal from '@/components/admin/GenerateQuoteModal'
import { formatMoney } from '@/lib/line-items'

type QuoteEdit = NonNullable<React.ComponentProps<typeof GenerateQuoteModal>['quote']>

interface QuoteRow extends QuoteEdit {
  reservationId: number
  quoteNumber: string
  createdAt: string
  total: number
  clientName: string | null
  yachtLabel: string | null
  reservationDate: string | null
}

const tone = (s: string): 'gold' | 'blue' | 'green' => (s === 'accepted' ? 'green' : s === 'sent' ? 'blue' : 'gold')

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editing, setEditing] = useState<QuoteRow | null>(null)

  const load = async (p: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/quotes?page=${p}&limit=15`)
      if (res.ok) {
        const data = await res.json()
        setQuotes(data.quotes)
        setTotalPages(data.totalPages)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  const remove = async (q: QuoteRow) => {
    if (!confirm(`Delete quote ${q.quoteNumber}?`)) return
    const res = await fetch(`/api/admin/quotes/${q.id}`, { method: 'DELETE' })
    if (res.ok) load(page)
  }

  return (
    <div>
      <PageHeader
        title="Quotes"
        description="Every client quote (devis), saved and editable. Create one from a reservation's ⋮ menu."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Quotes' }]}
      />

      <GenerateQuoteModal
        reservation={editing ? { id: editing.reservationId, yacht: null, price: null, quoteId: editing.id } : null}
        quote={editing}
        onClose={() => { setEditing(null); load(page) }}
      />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading quotes…</div>
        </Card>
      ) : quotes.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No quotes yet" description="Open a reservation's ⋮ menu and choose Generate Quote." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          {quotes.map((q, i) => (
            <div key={q.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.2fr 1fr 44px', gap: 20, alignItems: 'center', padding: '18px 24px', borderBottom: i < quotes.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd' }}>{q.quoteNumber}</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', marginTop: 2 }}>{new Date(q.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#d8d8cc' }}>{q.clientName || '—'}</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', marginTop: 2 }}>{q.yachtLabel || '—'} · reservation #{q.reservationId}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, color: '#d4b472' }}>{formatMoney(q.total)} {q.currency}</div>
              <div><Badge tone={tone(q.status)} dot>{q.status}</Badge></div>
              <ActionsMenu
                items={[
                  { label: 'Edit', icon: <Pencil size={13.5} strokeWidth={1.75} />, onClick: () => setEditing(q) },
                  { label: 'Download PDF', icon: <FileDown size={13.5} strokeWidth={1.75} />, onClick: () => window.open(`/api/admin/quotes/${q.id}/pdf`, '_blank') },
                  { label: 'Delete', icon: <Trash2 size={13.5} strokeWidth={1.75} />, tone: 'danger', onClick: () => remove(q) },
                ]}
              />
            </div>
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </Card>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Receipt, FileText, Percent, FileDown } from 'lucide-react'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import StatCard from '@/components/admin/ui/StatCard'
import Pagination from '@/components/admin/ui/Pagination'
import EmptyState from '@/components/admin/ui/EmptyState'
import { FilterField, SelectField } from '@/components/admin/ui/FilterBar'

interface Invoice {
  id: number
  invoiceNumber: string
  type: string
  category: string
  status: string
  currency: string
  priceTotal: number | null
  commissionAmount: number | null
  createdAt: string
  yachtLabel: string | null
  clientName: string | null
  providerName: string | null
}

const CURRENT_YEAR = new Date().getFullYear()

function formatAmount(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function statusTone(status: string): 'gold' | 'green' | 'blue' {
  if (status === 'paid') return 'green'
  if (status === 'sent') return 'blue'
  return 'gold'
}

const GRID = '1.3fr 1.3fr 1.2fr 1.2fr 0.9fr 0.8fr 0.9fr 80px'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ totalCount: 0, totalYachtSalesEur: 0, totalCommissionEur: 0 })
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')

  const fetchInvoices = async (page: number) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', '20')
      if (status) params.append('status', status)
      if (category) params.append('category', category)

      const res = await fetch(`/api/admin/invoices?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices || [])
        setTotalPages(data.totalPages || 1)
        setStats(data.stats || { totalCount: 0, totalYachtSalesEur: 0, totalCommissionEur: 0 })
        setCurrentPage(page)
      }
    } catch (err) {
      console.error('Fetch invoices error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category])

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Every client invoice and provider commission — service and referral fees alike."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Invoices' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard label={`Invoices (${CURRENT_YEAR})`} value={stats.totalCount} icon={Receipt} tone="gold" />
        <StatCard label={`Yachts Sold — EUR (${CURRENT_YEAR})`} value={`€${formatAmount(stats.totalYachtSalesEur)}`} icon={FileText} tone="blue" />
        <StatCard label={`Commission Taken — EUR (${CURRENT_YEAR})`} value={`€${formatAmount(stats.totalCommissionEur)}`} icon={Percent} tone="green" />
      </div>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
          <FilterField label="Status">
            <SelectField value={status} onChange={setStatus}>
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </SelectField>
          </FilterField>
          <FilterField label="Category">
            <SelectField value={category} onChange={setCategory}>
              <option value="">All categories</option>
              <option value="service">Client (service)</option>
              <option value="commission">Commission</option>
            </SelectField>
          </FilterField>
        </div>
      </Card>

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading invoices…</div>
        </Card>
      ) : invoices.length === 0 ? (
        <Card><EmptyState icon={Receipt} title="No invoices yet" description="Generate one from a reservation that already has a contract, or as a provider commission." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center',
              padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)',
              fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f',
            }}
          >
            <div>Invoice</div>
            <div>Yacht</div>
            <div>Client</div>
            <div>Provider</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
            <div />
          </div>

          {invoices.map((inv, i) => {
            const amount = inv.category === 'commission' ? inv.commissionAmount : inv.priceTotal
            return (
              <div
                key={inv.id}
                style={{
                  display: 'grid', gridTemplateColumns: GRID, gap: 16, alignItems: 'center',
                  padding: '14px 24px', borderBottom: i < invoices.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd', marginBottom: 4 }}>{inv.invoiceNumber}</div>
                  <Badge tone={inv.category === 'commission' ? 'blue' : 'gold'} dot>
                    {inv.category === 'commission' ? 'Commission' : 'Client'}
                  </Badge>
                </div>

                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: inv.yachtLabel ? '#d8d8cc' : '#5a5a52', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inv.yachtLabel || '—'}
                </div>

                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: inv.clientName ? '#d8d8cc' : '#5a5a52', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inv.clientName || '—'}
                </div>

                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: inv.providerName ? '#d8d8cc' : '#5a5a52', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inv.providerName || '—'}
                </div>

                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc' }}>
                  {amount != null ? `${formatAmount(amount)} ${inv.currency}` : '—'}
                </div>

                <div>
                  <Badge tone={statusTone(inv.status)} dot>{inv.status}</Badge>
                </div>

                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#6b6b60' }}>
                  {new Date(inv.createdAt).toLocaleDateString()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <a href={`/api/admin/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" title="Download invoice">
                      <FileDown size={13} strokeWidth={2} />
                    </Button>
                  </a>
                </div>
              </div>
            )
          })}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchInvoices} />
        </Card>
      )}
    </div>
  )
}

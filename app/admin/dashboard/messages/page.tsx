'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Mail, Phone, CalendarDays, Check, Trash2 } from 'lucide-react'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Button from '@/components/admin/ui/Button'
import Pagination from '@/components/admin/ui/Pagination'
import EmptyState from '@/components/admin/ui/EmptyState'

interface Message {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('unread')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const fetchMessages = async (page: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/messages?page=${page}&limit=10&status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Fetch messages error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  useEffect(() => {
    fetchMessages(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'read' }),
      })
      fetchMessages(currentPage)
      setSelectedMessage(null)
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchMessages(currentPage)
      setSelectedMessage(null)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Enquiries submitted through the contact form."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Messages' }]}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <Button variant={statusFilter === 'unread' ? 'primary' : 'secondary'} size="sm" onClick={() => { setStatusFilter('unread'); setCurrentPage(1) }}>
          Unread
        </Button>
        <Button variant={statusFilter === 'read' ? 'primary' : 'secondary'} size="sm" onClick={() => { setStatusFilter('read'); setCurrentPage(1) }}>
          Read
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1.6fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
        {isLoading ? (
          <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading messages…</div>
          </Card>
        ) : messages.length === 0 ? (
          <Card><EmptyState icon={MessageSquare} title="No messages" description="Nothing here for this filter yet." /></Card>
        ) : (
          <Card style={{ overflow: 'hidden' }}>
            {messages.map((msg, i) => {
              const active = selectedMessage?.id === msg.id
              return (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
                    padding: '18px 24px', border: 'none', cursor: 'pointer',
                    borderBottom: i < messages.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none',
                    background: active ? 'rgba(184,151,74,0.08)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(245,238,221,0.03)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd' }}>{msg.name}</span>
                      {msg.status === 'unread' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4b472', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#a8a89a', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.subject}
                    </div>
                    <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#6b6b60', marginTop: 3 }}>{msg.email}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: '#6b6b60', whiteSpace: 'nowrap' }}>
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </div>
                </button>
              )
            })}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </Card>
        )}

        {selectedMessage && (
          <Card style={{ padding: 26, position: 'sticky', top: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 22, color: '#f5eedd', margin: '0 0 4px' }}>
              {selectedMessage.name}
            </h3>
            <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 18px' }}>{selectedMessage.subject}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#a8a89a' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Mail size={13} strokeWidth={1.75} />{selectedMessage.email}</span>
              {selectedMessage.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Phone size={13} strokeWidth={1.75} />{selectedMessage.phone}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><CalendarDays size={13} strokeWidth={1.75} />{new Date(selectedMessage.createdAt).toLocaleString()}</span>
            </div>

            <div style={{ background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.1)', borderRadius: 8, padding: 16, marginBottom: 22 }}>
              <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, lineHeight: 1.7, color: '#d8d8cc', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {selectedMessage.status === 'unread' && (
                <Button variant="primary" size="sm" onClick={() => handleMarkAsRead(selectedMessage.id)} style={{ flex: 1 }}>
                  <Check size={13} strokeWidth={2} />
                  Mark as Read
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => handleDelete(selectedMessage.id)} style={{ flex: 1 }}>
                <Trash2 size={13} strokeWidth={1.75} />
                Delete
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

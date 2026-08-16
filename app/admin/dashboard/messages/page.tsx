'use client'

import { useEffect, useState } from 'react'

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

  useEffect(() => {
    fetchMessages(1)
  }, [statusFilter])

  useEffect(() => {
    fetchMessages(currentPage)
  }, [currentPage])

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

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'read' })
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
        body: JSON.stringify({ id })
      })
      fetchMessages(currentPage)
      setSelectedMessage(null)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Messages List */}
      <div className="lg:col-span-2">
        <div className="mb-8">
          <h2 className="text-lg tracking-wider text-gray-500 mb-4">MESSAGES</h2>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                setStatusFilter('unread')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 text-xs tracking-wider uppercase transition ${
                statusFilter === 'unread'
                  ? 'bg-[#b8974a] text-[#06090f]'
                  : 'border border-[#b8974a] text-[#b8974a] hover:bg-[#b8974a] hover:bg-opacity-10'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => {
                setStatusFilter('read')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 text-xs tracking-wider uppercase transition ${
                statusFilter === 'read'
                  ? 'bg-[#b8974a] text-[#06090f]'
                  : 'border border-[#b8974a] text-[#b8974a] hover:bg-[#b8974a] hover:bg-opacity-10'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No messages</div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  selectedMessage?.id === msg.id
                    ? 'bg-[#0f1419] border-[#b8974a] border-opacity-50'
                    : `border-[#b8974a] border-opacity-10 hover:border-opacity-30 ${
                        msg.status === 'unread' ? 'bg-[#0f1419]' : 'bg-[#06090f] opacity-75'
                      }`
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#b8974a] font-semibold">{msg.name}</p>
                      {msg.status === 'unread' && (
                        <span className="inline-block w-2 h-2 bg-[#b8974a] rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{msg.subject}</p>
                    <p className="text-gray-600 text-xs">{msg.email}</p>
                  </div>
                  <p className="text-gray-600 text-xs whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-[#b8974a] border-opacity-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← PREVIOUS
            </button>

            <span className="text-gray-500 text-sm">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light disabled:opacity-30 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </div>
        )}
      </div>

      {/* Message Details */}
      {selectedMessage && (
        <div className="lg:col-span-1">
          <div className="bg-[#0f1419] border border-[#b8974a] border-opacity-20 rounded-lg p-6 sticky top-8">
            <div className="mb-6">
              <h3 className="text-[#b8974a] font-semibold mb-2" style={{ fontFamily: 'var(--font-tenor)' }}>
                {selectedMessage.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{selectedMessage.subject}</p>

              <div className="space-y-2 text-sm text-gray-400 mb-6">
                <p>📧 {selectedMessage.email}</p>
                {selectedMessage.phone && <p>📞 {selectedMessage.phone}</p>}
                <p>📅 {new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>

              <div className="bg-[#06090f] rounded p-4 mb-6">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedMessage.status === 'unread' && (
                  <button
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                    className="flex-1 px-3 py-2 bg-[#b8974a] text-[#06090f] text-xs tracking-wider uppercase rounded transition hover:bg-[#d4af7a]"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="flex-1 px-3 py-2 border border-red-500 text-red-400 text-xs tracking-wider uppercase rounded transition hover:bg-red-500 hover:bg-opacity-10"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

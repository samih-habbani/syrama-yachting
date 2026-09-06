'use client'

import { useEffect, useState } from 'react'
import { X, Copy, Check, MessageCircle, AlertTriangle } from 'lucide-react'
import Button from './ui/Button'
import { FilterField, TextField } from './ui/FilterBar'

interface GenerateBookingLinkModalProps {
  yacht: { id: number; model: string; builder?: string | null } | null
  onClose: () => void
  // When set, the link is generated "from" an existing reservation that
  // has no contract yet, instead of from scratch off the yacht: its own
  // date/time pre-fill the form, and submitting the resulting link will
  // attach the contract to this reservation rather than create a new one.
  // If that reservation already has a pending link (`bookingLinkToken`),
  // the modal skips the form entirely and just shows that link to share —
  // generating a second one for the same reservation would be redundant.
  reservation?: {
    id: number
    date: string | null
    endDate: string | null
    startTime: string | null
    endTime: string | null
    numberOfPeople: number | null
    bookingLinkToken?: string | null
  } | null
}

function toDateInput(iso: string) {
  return iso.slice(0, 10)
}

interface BookingLinkRow {
  id: number
  token: string
  date: string
  endDate: string | null
  startTime: string
  endTime: string | null
  status: string
}

interface Conflict {
  date: string
  endDate: string | null
  client: string
}

function formatLinkRange(link: Pick<BookingLinkRow, 'date' | 'endDate' | 'startTime' | 'endTime'>) {
  const start = new Date(link.date).toLocaleDateString()
  const end = link.endDate ? new Date(link.endDate).toLocaleDateString() : null
  const dateStr = end && end !== start ? `${start} – ${end}` : start
  const timeStr = link.endTime ? `${link.startTime} – ${link.endTime}` : link.startTime
  return `${dateStr} · ${timeStr}`
}

export default function GenerateBookingLinkModal({ yacht, onClose, reservation }: GenerateBookingLinkModalProps) {
  const [singleDay, setSingleDay] = useState(true)
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [links, setLinks] = useState<BookingLinkRow[]>([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)

  const fetchLinks = async (yachtId: number) => {
    setIsLoadingLinks(true)
    try {
      const res = await fetch(`/api/admin/booking-links?yachtId=${yachtId}`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
      }
    } catch (err) {
      console.error('Fetch booking links error:', err)
    } finally {
      setIsLoadingLinks(false)
    }
  }

  useEffect(() => {
    // The "links already generated for this yacht" history isn't
    // meaningful when generating from a specific reservation instead —
    // skip the extra fetch.
    if (yacht && !reservation) fetchLinks(yacht.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yacht?.id, reservation?.id])

  useEffect(() => {
    // A pending link already exists for this reservation — show it
    // directly instead of the generation form.
    if (reservation?.bookingLinkToken) {
      setUrl(`${window.location.origin}/book/${reservation.bookingLinkToken}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation?.bookingLinkToken])

  useEffect(() => {
    if (!reservation || reservation.bookingLinkToken) return
    if (reservation.date) setDate(toDateInput(reservation.date))
    setStartTime(reservation.startTime || '')
    setEndTime(reservation.endTime || '')
    if (reservation.endDate) {
      setSingleDay(false)
      setEndDate(toDateInput(reservation.endDate))
    } else {
      setSingleDay(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation?.id])

  if (!yacht) return null

  // A pending link already exists for this reservation — the modal only
  // shows it (to copy/share), it never offers to generate a second one.
  const isExistingLink = !!reservation?.bookingLinkToken

  const reset = () => {
    if (reservation?.date) {
      setDate(toDateInput(reservation.date))
      setStartTime(reservation.startTime || '')
      setEndTime(reservation.endTime || '')
      if (reservation.endDate) {
        setSingleDay(false)
        setEndDate(toDateInput(reservation.endDate))
      } else {
        setSingleDay(true)
        setEndDate('')
      }
    } else {
      setSingleDay(true)
      setDate('')
      setEndDate('')
      setStartTime('')
      setEndTime('')
    }
    setError('')
    setUrl('')
    setCopied(false)
    setConflicts([])
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/booking-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(reservation ? { reservationId: reservation.id } : { yachtId: yacht.id }),
          date,
          endDate: singleDay ? undefined : (endDate || undefined),
          startTime,
          endTime: endTime || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to generate link')
        return
      }

      setUrl(`${window.location.origin}/book/${data.token}`)
      setConflicts(data.conflicts || [])
      if (!reservation) fetchLinks(yacht.id)
    } catch (err) {
      console.error('Generate booking link error:', err)
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text?: string) => {
    await navigator.clipboard.writeText(text || url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(6,9,15,0.6)', backdropFilter: 'blur(6px)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 440, maxHeight: '88vh', overflowY: 'auto',
          background: 'linear-gradient(180deg, #0f1419 0%, #06090f 100%)',
          border: '1px solid rgba(184,151,74,0.2)', borderRadius: 12, padding: 32,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 8 }}>
              {isExistingLink ? 'Booking Link' : reservation ? 'Generate Link for This Reservation' : 'Generate Booking Link'}
            </div>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 22, color: '#f5eedd', margin: 0 }}>
              {yacht.builder ? `${yacht.builder} ` : ''}{yacht.model}
            </h3>
            {reservation?.numberOfPeople != null && (
              <p style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f', margin: '4px 0 0' }}>
                {reservation.numberOfPeople} guest{reservation.numberOfPeople === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#8f8f7f', cursor: 'pointer', padding: 4 }}>
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {url ? (
          <div>
            {conflicts.length > 0 && (
              <div style={{
                display: 'flex', gap: 10, background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)',
                borderRadius: 7, padding: '12px 14px', marginBottom: 16,
              }}>
                <AlertTriangle size={15} strokeWidth={2} color="#e08080" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 600, color: '#e08080', marginBottom: 4 }}>
                    This yacht already has a booking that overlaps this slot
                  </div>
                  {conflicts.map((c, i) => (
                    <div key={i} style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#e0a0a0' }}>
                      {c.client} — {new Date(c.date).toLocaleDateString()}{c.endDate && new Date(c.endDate).toDateString() !== new Date(c.date).toDateString() ? ` – ${new Date(c.endDate).toLocaleDateString()}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#8f8f7f', margin: '0 0 14px' }}>
              {isExistingLink
                ? "This reservation already has a pending booking link — share it with the client again if needed."
                : reservation
                  ? "Share this link with the client — once submitted, the contract will be attached to this existing reservation."
                  : "Share this link with the client — they'll fill in their details and the reservation is created automatically."}
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{
                flex: 1, fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#f5eedd',
                background: 'rgba(6,9,15,0.6)', border: '1px solid rgba(184,151,74,0.3)', borderRadius: 7,
                padding: '10px 14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {url}
              </div>
              <Button type="button" variant="secondary" onClick={() => handleCopy()}>
                {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--font-lora)', fontSize: 12, fontWeight: 600, color: '#06090f',
                background: '#25D366', borderRadius: 7, padding: '11px 20px', textDecoration: 'none', marginBottom: 8,
              }}
            >
              <MessageCircle size={15} strokeWidth={2} />
              Share on WhatsApp
            </a>
            {!isExistingLink && (
              <Button type="button" variant="ghost" onClick={reset} style={{ width: '100%' }}>
                Generate another link
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleGenerate}>
            {error && (
              <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '11px 14px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 12.5, marginBottom: 18 }}>
                {error}
              </div>
            )}

            {!isLoadingLinks && links.length > 0 && (
              <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(184,151,74,0.1)' }}>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 10 }}>
                  Links already generated for this yacht
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {links.map((link) => (
                    <div
                      key={link.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                        padding: '8px 10px', borderRadius: 6, background: 'rgba(184,151,74,0.04)', border: '1px solid rgba(184,151,74,0.1)',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#d8d8cc' }}>
                          {formatLinkRange(link)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{
                          fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                          color: link.status === 'completed' ? '#8fc088' : '#d4b472',
                          background: link.status === 'completed' ? 'rgba(122,168,116,0.12)' : 'rgba(184,151,74,0.12)',
                          border: `1px solid ${link.status === 'completed' ? 'rgba(122,168,116,0.3)' : 'rgba(184,151,74,0.3)'}`,
                          borderRadius: 999, padding: '3px 9px',
                        }}>
                          {link.status === 'completed' ? 'Booked' : 'Pending'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(`${window.location.origin}/book/${link.token}`)}
                          aria-label="Copy link"
                          style={{ display: 'flex', background: 'transparent', border: 'none', color: '#8f8f7f', cursor: 'pointer', padding: 3 }}
                        >
                          <Copy size={12} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer',
                padding: '10px 14px', borderRadius: 7, background: 'rgba(184,151,74,0.04)', border: '1px solid rgba(184,151,74,0.12)',
              }}
            >
              <input
                type="checkbox"
                checked={singleDay}
                onChange={(e) => { setSingleDay(e.target.checked); if (e.target.checked) setEndDate('') }}
                style={{ width: 15, height: 15, accentColor: '#b8974a', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#d8d8cc' }}>
                Single day
              </span>
            </label>

            {singleDay ? (
              <div style={{ marginBottom: 16 }}>
                <FilterField label="Date *">
                  <TextField type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </FilterField>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <FilterField label="Start Date *">
                  <TextField type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </FilterField>
                <FilterField label="End Date *">
                  <TextField type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} min={date || undefined} />
                </FilterField>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <FilterField label="Start Time *">
                <TextField type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </FilterField>
              <FilterField label="End Time">
                <TextField type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </FilterField>
            </div>

            <Button type="submit" variant="primary" disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? 'Generating…' : 'Generate Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search, X, Loader2 } from 'lucide-react'

export interface AsyncSearchSelectOption {
  value: number
  label: string
  sublabel?: string
}

// Same portal + dropdown UI as SearchSelectField, but options come from a
// debounced server-side search instead of a list loaded upfront — for
// fields backed by a large table (e.g. yachts) where fetching everything
// just to filter it client-side is slow.
export default function AsyncSearchSelectField({
  label, value, selectedOption, onChange, fetchOptions, placeholder, debounceMs = 250,
}: {
  label: string
  value: number | null
  // The caller owns the currently-picked option's display info (label,
  // sublabel) since it may not be present in the latest search results.
  selectedOption: AsyncSearchSelectOption | null
  onChange: (option: AsyncSearchSelectOption | null) => void
  fetchOptions: (query: string) => Promise<AsyncSearchSelectOption[]>
  placeholder?: string
  debounceMs?: number
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<AsyncSearchSelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => setMounted(true), [])

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width })
  }

  useEffect(() => {
    if (!open) return
    updatePosition()

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const handleReposition = () => updatePosition()

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [open])

  // Debounced remote search — re-runs on every keystroke while open, and
  // once immediately on open (empty query) to show a starting list.
  useEffect(() => {
    if (!open) return
    const requestId = ++requestIdRef.current
    setIsLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchOptions(query)
        if (requestId === requestIdRef.current) setOptions(results)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false)
      }
    }, debounceMs)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open])

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) setQuery('')
          setOpen(!open)
        }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          fontFamily: 'var(--font-lora)', fontSize: 13, textAlign: 'left',
          color: selectedOption ? '#f5eedd' : '#6b6b60',
          background: 'rgba(6,9,15,0.5)',
          border: open ? '1px solid rgba(184,151,74,0.6)' : '1px solid rgba(184,151,74,0.2)',
          borderRadius: 7, padding: '10px 14px', cursor: 'pointer', transition: 'border-color 0.2s ease',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : (placeholder || `Search ${label.toLowerCase()}…`)}
        </span>
        <ChevronDown size={14} color="#8f8f7f" strokeWidth={2} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {open && mounted && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          style={{
            position: 'fixed', top: coords.top, left: coords.left, width: Math.max(coords.width, 260), zIndex: 100,
            background: '#0b0e15', border: '1px solid rgba(184,151,74,0.25)', borderRadius: 8,
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ position: 'relative', padding: 8, borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
            <Search size={13} color="#6b6b60" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Type to search ${label.toLowerCase()}…`}
              style={{
                width: '100%', fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#f5eedd',
                background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.15)', borderRadius: 6,
                padding: '7px 10px 7px 30px', outline: 'none',
              }}
            />
            {isLoading && (
              <Loader2 size={13} color="#8f8f7f" className="animate-spin" style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)' }} />
            )}
          </div>

          <div style={{ maxHeight: 260, overflowY: 'auto', padding: 4 }}>
            {options.length === 0 ? (
              <div style={{ padding: '14px 12px', fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#6b6b60', textAlign: 'center' }}>
                {isLoading ? 'Searching…' : 'No matches'}
              </div>
            ) : (
              options.map((option) => {
                const checked = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => { onChange(option); setOpen(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 5,
                      fontFamily: 'var(--font-lora)', color: checked ? '#f5eedd' : '#d8d8cc',
                      background: checked ? 'rgba(184,151,74,0.1)' : 'transparent', border: 'none', cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,151,74,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = checked ? 'rgba(184,151,74,0.1)' : 'transparent')}
                  >
                    <div style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</div>
                    {option.sublabel && (
                      <div style={{ fontSize: 11, color: '#6b6b60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{option.sublabel}</div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {value !== null && (
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: 'var(--font-lora)', fontSize: 11.5, fontWeight: 600, color: '#8f8f7f',
                background: 'transparent', border: 'none', borderTop: '1px solid rgba(184,151,74,0.12)',
                padding: '9px 10px', cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#e08080')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8f8f7f')}
            >
              <X size={12} strokeWidth={2} />
              Clear selection
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'

// Click a cell to edit it inline, blur (or Enter) to save, Escape to
// discard. `onSave` is only called when the value actually changed, and
// the caller decides what "saved" vs "still editing" looks like (error
// styling, revert on failure, etc). Shared by the Clients list and the
// Yachts data table — both use the exact same click-to-edit/blur-to-save
// interaction.
export default function EditableCell({
  value, onSave, type = 'text', hasError, step, align,
}: {
  value: string | null | undefined
  onSave: (next: string) => void
  type?: string
  hasError?: boolean
  step?: string
  align?: 'left' | 'right'
}) {
  const normalized = value || ''
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(normalized)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!editing) setDraft(normalized) }, [normalized, editing])
  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select() } }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed !== normalized) onSave(trimmed)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        step={step}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); inputRef.current?.blur() }
          if (e.key === 'Escape') { setDraft(normalized); setEditing(false) }
        }}
        style={{
          width: '100%', fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#f5eedd',
          background: 'rgba(6,9,15,0.6)', border: `1px solid ${hasError ? 'rgba(196,94,94,0.6)' : 'rgba(184,151,74,0.6)'}`,
          borderRadius: 5, padding: '4px 7px', outline: 'none', textAlign: align,
        }}
      />
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'text',
        borderRadius: 5, padding: '4px 7px', margin: '-4px -7px',
        border: `1px solid ${hasError ? 'rgba(196,94,94,0.5)' : 'transparent'}`,
        transition: 'background 0.15s ease', textAlign: align,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,151,74,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {value || '—'}
    </div>
  )
}

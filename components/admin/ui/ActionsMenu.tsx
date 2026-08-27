'use client'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'

export interface ActionItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  tone?: 'default' | 'danger'
}

// Portaled to <body> and positioned via the trigger's viewport rect — a
// row-level `overflow: hidden` (used to clip table corners) would otherwise
// clip this dropdown since it'd be an absolutely-positioned descendant of it.
export default function ActionsMenu({ items }: { items: ActionItem[] }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 0 })
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
  }

  useEffect(() => {
    if (!open) return
    updatePosition()

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 7,
          background: open ? 'rgba(184,151,74,0.12)' : 'transparent',
          border: '1px solid rgba(184,151,74,0.25)',
          color: '#d4b472', cursor: 'pointer', transition: 'background 0.2s ease',
        }}
      >
        <MoreHorizontal size={16} strokeWidth={2} />
      </button>

      {open && mounted && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: 'fixed', top: coords.top, right: coords.right, zIndex: 100,
            minWidth: 168,
            background: '#0b0e15',
            border: '1px solid rgba(184,151,74,0.25)',
            borderRadius: 8,
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
            overflow: 'hidden',
            padding: 4,
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              onClick={() => { setOpen(false); item.onClick() }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                textAlign: 'left', fontFamily: 'var(--font-lora)', fontSize: 12.5, fontWeight: 500,
                color: item.tone === 'danger' ? '#e08080' : '#d8d8cc',
                background: 'transparent', border: 'none', borderRadius: 5,
                padding: '9px 10px', cursor: 'pointer', transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = item.tone === 'danger' ? 'rgba(196,94,94,0.1)' : 'rgba(184,151,74,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

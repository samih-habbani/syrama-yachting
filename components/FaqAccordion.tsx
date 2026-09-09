'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// A 2-column grid of bordered cards — replaces the earlier thin single-
// column list, which read as too quiet next to the rest of the page's
// bordered blocks (itinerary cards, filter panels). Same gold-chevron +
// smooth-height language as before (CustomSelect's dropdown arrow,
// FleetFilters' collapsible panel), now inside a card that visibly
// highlights — border brightens, subtle gold tint — when open, so the FAQ
// carries the same visual weight as the rest of the page instead of
// disappearing into a list of plain text rows.
export default function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: 18,
        alignItems: 'start',
      }}
    >
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={item.question}
            style={{
              border: `1px solid ${isOpen ? 'rgba(184,151,74,0.55)' : 'rgba(184,151,74,0.2)'}`,
              background: isOpen ? 'rgba(184,151,74,0.06)' : 'transparent',
              transition: 'border-color 0.25s ease, background 0.25s ease',
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                background: 'transparent',
                border: 'none',
                padding: '24px 26px',
                cursor: 'pointer',
                textAlign: 'left',
                color: isOpen ? '#b8974a' : '#f5eedd',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.color = '#b8974a' }}
              onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.color = '#f5eedd' }}
            >
              <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 1.5 }}>{item.question}</span>
              <motion.svg
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                width="11" height="7" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0 }}
              >
                <path d="M1 1L5 5L9 1" stroke="#b8974a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#8f8f7f', margin: '0 26px 24px' }}>
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

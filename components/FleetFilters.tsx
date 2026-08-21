'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface FilterState {
  region: string | null
  builder: string | null
  minLength: number
  maxLength: number
  minGuests: number
  maxGuests: number
  minPrice: number
  maxPrice: number
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'length-asc' | 'length-desc'
}

export interface FilterBounds {
  minLength: number
  maxLength: number
  minGuests: number
  maxGuests: number
  minPrice: number
  maxPrice: number
}

interface FleetFiltersProps {
  filters: FilterState
  bounds: FilterBounds
  regions: string[]
  builders: string[]
  resultCount: number
  onFiltersChange: (filters: FilterState) => void
  onReset: () => void
}

const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'length-asc', label: 'Length: Shortest First' },
  { value: 'length-desc', label: 'Length: Longest First' },
]

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-tenor)',
  fontSize: 10,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#b8974a',
  display: 'block',
  marginBottom: 12,
}

// Composant purement contrôlé : toutes les données (yachts, bornes, régions,
// builders) sont chargées UNE SEULE FOIS par le parent (Fleet.tsx). Ici, on ne
// fait que lire/écrire l'état des filtres — aucun appel réseau, filtrage 100% côté DOM.
export default function FleetFilters({ filters, bounds, regions, builders, resultCount, onFiltersChange, onReset }: FleetFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...newFilters })
  }

  const hasActiveFilters =
    filters.region !== null ||
    filters.builder !== null ||
    filters.sortBy !== 'default' ||
    filters.minLength > bounds.minLength ||
    filters.maxLength < bounds.maxLength ||
    filters.minGuests > bounds.minGuests ||
    filters.maxGuests < bounds.maxGuests ||
    filters.minPrice > bounds.minPrice ||
    filters.maxPrice < bounds.maxPrice

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, rgba(184,151,74,0.08) 0%, rgba(212,180,114,0.03) 100%)',
        border: '1px solid rgba(184,151,74,0.2)',
        borderRadius: 8,
        marginBottom: 60,
      }}
    >
      <style>{rangeInputStyles}</style>
      {/* Header */}
      <div
        style={{
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          borderBottom: isExpanded ? '1px solid rgba(184,151,74,0.15)' : 'none',
        }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="fleet-filters-panel"
          style={{
            flex: 1,
            textAlign: 'left',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 4 }}>
            REFINE YOUR SEARCH
          </div>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, color: '#8f8f7f' }}>
            {resultCount} vessel{resultCount !== 1 ? 's' : ''} found
            {hasActiveFilters && <span style={{ color: '#b8974a' }}> • Filtered</span>}
          </div>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              style={{
                fontFamily: 'var(--font-tenor)',
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                background: 'transparent',
                border: '1px solid rgba(184,151,74,0.4)',
                color: '#b8974a',
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,151,74,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Clear Filters
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            aria-expanded={isExpanded}
            aria-controls="fleet-filters-panel"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ color: '#b8974a', display: 'flex' }}
            >
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="fleet-filters-panel"
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 36 }}>
              {/* Row 1 — selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <CustomSelect
                  label="Destination"
                  placeholder="All Destinations"
                  value={filters.region}
                  options={regions.map(r => ({ value: r, label: r }))}
                  onChange={(v) => handleFilterChange({ region: v })}
                />
                <CustomSelect
                  label="Builder"
                  placeholder="All Builders"
                  value={filters.builder}
                  options={builders.map(b => ({ value: b, label: b }))}
                  onChange={(v) => handleFilterChange({ builder: v })}
                />
                <CustomSelect
                  label="Sort By"
                  placeholder="Featured"
                  value={filters.sortBy === 'default' ? null : filters.sortBy}
                  options={SORT_OPTIONS.filter(o => o.value !== 'default')}
                  onChange={(v) => handleFilterChange({ sortBy: (v || 'default') as FilterState['sortBy'] })}
                />
              </div>

              {/* Row 2 — ranges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <DualRangeSlider
                  label="Length"
                  min={bounds.minLength}
                  max={bounds.maxLength}
                  valueMin={filters.minLength}
                  valueMax={filters.maxLength}
                  format={(v) => `${v}m`}
                  onChange={(minLength, maxLength) => handleFilterChange({ minLength, maxLength })}
                />
                <DualRangeSlider
                  label="Guests"
                  min={bounds.minGuests}
                  max={bounds.maxGuests}
                  valueMin={filters.minGuests}
                  valueMax={filters.maxGuests}
                  format={(v) => `${v}`}
                  onChange={(minGuests, maxGuests) => handleFilterChange({ minGuests, maxGuests })}
                />
                <DualRangeSlider
                  label="Budget"
                  min={bounds.minPrice}
                  max={bounds.maxPrice}
                  valueMin={filters.minPrice}
                  valueMax={filters.maxPrice}
                  format={(v) => `€${v.toLocaleString('en-US')}`}
                  onChange={(minPrice, maxPrice) => handleFilterChange({ minPrice, maxPrice })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// Custom styled select — fully themed trigger + option list
// ─────────────────────────────────────────────────────────────
function CustomSelect({
  label, value, options, onChange, placeholder,
}: {
  label: string
  value: string | null
  options: { value: string; label: string }[]
  onChange: (value: string | null) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [focusIntent, setFocusIntent] = useState<'first' | 'last' | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const triggerId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`
  const listboxId = `${triggerId}-listbox`

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Move focus into the option list once it has mounted, after opening via keyboard
  useEffect(() => {
    if (!open || !focusIntent) return
    const optionEls = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
    const target = focusIntent === 'last' ? optionEls[optionEls.length - 1] : optionEls[0]
    target?.focus()
    setFocusIntent(null)
  }, [open, focusIntent])

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder

  return (
    <div
      ref={ref}
      style={{ position: 'relative' }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          setOpen(false)
          ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
          return
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault()
          if (!open) {
            setOpen(true)
            setFocusIntent(e.key === 'ArrowDown' ? 'first' : 'last')
            return
          }
          const optionEls = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
          if (optionEls.length === 0) return
          const currentIndex = optionEls.indexOf(document.activeElement as HTMLButtonElement)
          const nextIndex = e.key === 'ArrowDown'
            ? (currentIndex + 1) % optionEls.length
            : (currentIndex - 1 + optionEls.length) % optionEls.length
          optionEls[nextIndex]?.focus()
          return
        }
        if (open && (e.key === 'Home' || e.key === 'End')) {
          e.preventDefault()
          const optionEls = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
          const target = e.key === 'Home' ? optionEls[0] : optionEls[optionEls.length - 1]
          target?.focus()
        }
      }}
    >
      <label id={`${triggerId}-label`} style={labelStyle}>{label}</label>
      <button
        id={triggerId}
        type="button"
        onClick={(e) => {
          setOpen(o => {
            const next = !o
            if (next && e.detail === 0) setFocusIntent('first')
            return next
          })
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={`${triggerId}-label ${triggerId}`}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '13px 16px',
          fontFamily: 'var(--font-tenor)',
          fontSize: 12,
          textAlign: 'left',
          color: value ? '#f5eedd' : 'rgba(245,238,221,0.5)',
          background: open ? 'rgba(184,151,74,0.1)' : 'rgba(184,151,74,0.05)',
          border: `1px solid ${open ? '#b8974a' : 'rgba(184,151,74,0.25)'}`,
          borderRadius: 4,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedLabel}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0 }}
        >
          <path d="M1 1L5 5L9 1" stroke="#b8974a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            id={listboxId}
            aria-labelledby={`${triggerId}-label`}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 30,
              maxHeight: 280,
              overflowY: 'auto',
              background: '#0b0e15',
              border: '1px solid rgba(184,151,74,0.35)',
              borderRadius: 4,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            }}
          >
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => { onChange(null); setOpen(false) }}
              style={{
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
                border: 'none',
                padding: '11px 16px',
                fontFamily: 'var(--font-tenor)',
                fontSize: 12,
                color: value === null ? '#b8974a' : 'rgba(245,238,221,0.55)',
                background: value === null ? 'rgba(184,151,74,0.1)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,151,74,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = value === null ? 'rgba(184,151,74,0.1)' : 'transparent')}
            >
              {placeholder}
            </button>
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={value === o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  font: 'inherit',
                  border: 'none',
                  borderTop: '1px solid rgba(184,151,74,0.08)',
                  padding: '11px 16px',
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 12,
                  color: value === o.value ? '#b8974a' : 'rgba(245,238,221,0.8)',
                  background: value === o.value ? 'rgba(184,151,74,0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,151,74,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = value === o.value ? 'rgba(184,151,74,0.1)' : 'transparent')}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Dual-thumb range slider — min & max on one styled track
// ─────────────────────────────────────────────────────────────
function DualRangeSlider({
  label, min, max, valueMin, valueMax, format, onChange,
}: {
  label: string
  min: number
  max: number
  valueMin: number
  valueMax: number
  format: (v: number) => string
  onChange: (min: number, max: number) => void
}) {
  const span = Math.max(max - min, 1)
  const percentMin = ((valueMin - min) / span) * 100
  const percentMax = ((valueMax - min) / span) * 100

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontFamily: 'var(--font-cormorant)', fontSize: 16, fontWeight: 300, color: '#d4b472' }}>
        <span>{format(valueMin)}</span>
        <span>{format(valueMax)}</span>
      </div>
      <div className="fleet-range" style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'rgba(184,151,74,0.2)', borderRadius: 1 }} />
        <div
          style={{
            position: 'absolute',
            height: 2,
            background: 'linear-gradient(to right, #b8974a, #d4b472)',
            borderRadius: 1,
            left: `${percentMin}%`,
            width: `${Math.max(percentMax - percentMin, 0)}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax), valueMax)}
          className="fleet-range-input"
          style={{ zIndex: valueMin > max - 5 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin))}
          className="fleet-range-input"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  )
}

const rangeInputStyles = `
  .fleet-range-input {
    position: absolute;
    left: 0;
    right: 0;
    width: 100%;
    margin: 0;
    background: transparent;
    pointer-events: none;
    -webkit-appearance: none;
    appearance: none;
  }
  .fleet-range-input::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    background: transparent;
  }
  .fleet-range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: auto;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #d4b472;
    border: 2px solid #06090f;
    box-shadow: 0 0 0 1px rgba(184,151,74,0.6);
    cursor: pointer;
    margin-top: 0;
  }
  .fleet-range-input::-moz-range-track {
    background: transparent;
  }
  .fleet-range-input::-moz-range-thumb {
    pointer-events: auto;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #d4b472;
    border: 2px solid #06090f;
    box-shadow: 0 0 0 1px rgba(184,151,74,0.6);
    cursor: pointer;
  }
`

'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { yachts } from '@/lib/yachts-data'

interface FilterState {
  region: string | null
  minLength: number
  maxLength: number
  minGuests: number
  maxGuests: number
  minCabins: number
  maxCabins: number
  builder: string | null
  minYear: number
  maxYear: number
}

interface FleetFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  resultCount: number
}

// Extract unique values from yachts
const regions = Array.from(new Set(yachts.flatMap(y => y.regions)))
const builders = Array.from(new Set(yachts.map(y => y.builder))).sort()
const lengths = yachts.map(y => parseInt(y.length)).sort((a, b) => a - b)
const years = yachts.map(y => parseInt(y.year)).sort((a, b) => a - b)
const guests = yachts.map(y => parseInt(y.guests)).sort((a, b) => a - b)
const cabins = yachts.map(y => parseInt(y.cabins)).sort((a, b) => a - b)

const minLength = Math.min(...lengths)
const maxLength = Math.max(...lengths)
const minYear = Math.min(...years)
const maxYear = Math.max(...years)
const minGuests = Math.min(...guests)
const maxGuests = Math.max(...guests)
const minCabins = Math.min(...cabins)
const maxCabins = Math.max(...cabins)

const regionLabels: { [key: string]: string } = {
  'med': 'Mediterranean',
  'caribbean': 'Caribbean',
  'red-sea': 'Red Sea',
  'indian-ocean': 'Indian Ocean',
}

export default function FleetFilters({ onFiltersChange, resultCount }: FleetFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const [filters, setFilters] = useState<FilterState>({
    region: null,
    minLength: minLength,
    maxLength: maxLength,
    minGuests: minGuests,
    maxGuests: maxGuests,
    minCabins: minCabins,
    maxCabins: maxCabins,
    builder: null,
    minYear: minYear,
    maxYear: maxYear,
  })

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }, [filters, onFiltersChange])

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      region: null,
      minLength: minLength,
      maxLength: maxLength,
      minGuests: minGuests,
      maxGuests: maxGuests,
      minCabins: minCabins,
      maxCabins: maxCabins,
      builder: null,
      minYear: minYear,
      maxYear: maxYear,
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters =
    filters.region !== null ||
    filters.builder !== null ||
    filters.minLength > minLength ||
    filters.maxLength < maxLength ||
    filters.minGuests > minGuests ||
    filters.maxGuests < maxGuests ||
    filters.minCabins > minCabins ||
    filters.maxCabins < maxCabins ||
    filters.minYear > minYear ||
    filters.maxYear < maxYear

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
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid rgba(184,151,74,0.15)' : 'none',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 4 }}>
            REFINE YOUR SEARCH
          </div>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, color: '#6a6a5e' }}>
            {resultCount} vessel{resultCount !== 1 ? 's' : ''} found
            {hasActiveFilters && <span style={{ color: '#b8974a' }}> • Filtered</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                resetFilters()
              }}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(184,151,74,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Clear Filters
            </button>
          )}
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 16, color: '#b8974a' }}>
            {isExpanded ? '−' : '+'}
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
              {/* Region Filter */}
              <div>
                <label style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', display: 'block', marginBottom: 12 }}>
                  Destination
                </label>
                <select
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange({ region: e.target.value || null })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontFamily: 'var(--font-tenor)',
                    fontSize: 12,
                    color: '#f5eedd',
                    background: 'rgba(184,151,74,0.05)',
                    border: '1px solid rgba(184,151,74,0.2)',
                    borderRadius: 4,
                  }}
                >
                  <option value="">All Destinations</option>
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {regionLabels[region] || region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Length Filter */}
              <div>
                <label style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', display: 'block', marginBottom: 12 }}>
                  Length: up to {filters.maxLength}m
                </label>
                <input
                  type="range"
                  min={minLength}
                  max={maxLength}
                  value={filters.maxLength}
                  onChange={(e) => handleFilterChange({ maxLength: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#b8974a' }}
                />
              </div>

              {/* Guests Filter */}
              <div>
                <label style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', display: 'block', marginBottom: 12 }}>
                  Guests: up to {filters.maxGuests}
                </label>
                <input
                  type="range"
                  min={minGuests}
                  max={maxGuests}
                  value={filters.maxGuests}
                  onChange={(e) => handleFilterChange({ maxGuests: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#b8974a' }}
                />
              </div>

              {/* Cabins Filter */}
              <div>
                <label style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', display: 'block', marginBottom: 12 }}>
                  Cabins: up to {filters.maxCabins}
                </label>
                <input
                  type="range"
                  min={minCabins}
                  max={maxCabins}
                  value={filters.maxCabins}
                  onChange={(e) => handleFilterChange({ maxCabins: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#b8974a' }}
                />
              </div>

              {/* Builder Filter */}
              <div>
                <label style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', display: 'block', marginBottom: 12 }}>
                  Builder
                </label>
                <select
                  value={filters.builder || ''}
                  onChange={(e) => handleFilterChange({ builder: e.target.value || null })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontFamily: 'var(--font-tenor)',
                    fontSize: 12,
                    color: '#f5eedd',
                    background: 'rgba(184,151,74,0.05)',
                    border: '1px solid rgba(184,151,74,0.2)',
                    borderRadius: 4,
                  }}
                >
                  <option value="">All Builders</option>
                  {builders.map(builder => (
                    <option key={builder} value={builder}>
                      {builder}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', display: 'block', marginBottom: 12 }}>
                  Year: up to {filters.maxYear}
                </label>
                <input
                  type="range"
                  min={minYear}
                  max={maxYear}
                  value={filters.maxYear}
                  onChange={(e) => handleFilterChange({ maxYear: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#b8974a' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

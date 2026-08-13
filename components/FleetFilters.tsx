'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FilterState {
  region: string | null
  minLength: number
  maxLength: number
  minGuests: number
  maxGuests: number
  builder: string | null
}

interface FleetFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  resultCount: number
}

export default function FleetFilters({ onFiltersChange, resultCount }: FleetFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [regions, setRegions] = useState<string[]>([])
  const [builders, setBuilders] = useState<string[]>([])
  const [minLength, setMinLength] = useState(0)
  const [maxLength, setMaxLength] = useState(200)
  const [minGuests, setMinGuests] = useState(0)
  const [maxGuests, setMaxGuests] = useState(100)

  const [filters, setFilters] = useState<FilterState>({
    region: null,
    minLength: 0,
    maxLength: 200,
    minGuests: 0,
    maxGuests: 100,
    builder: null,
  })

  // Charger les options de filtres depuis la BDD
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/yachts')
        const yachts = await response.json()

        // Extraire les régions uniques
        const uniqueRegions = Array.from(new Set(yachts.map((y: any) => y.region).filter(Boolean)))
          .sort()
        setRegions(uniqueRegions as string[])

        // Extraire les constructeurs uniques
        const uniqueBuilders = Array.from(new Set(yachts.map((y: any) => y.builder).filter(Boolean)))
          .sort()
        setBuilders(uniqueBuilders as string[])

        // Calculer les min/max
        const lengths = yachts.map((y: any) => y.length).filter(Boolean)
        const guests = yachts.map((y: any) => y.maxGuests).filter(Boolean)

        if (lengths.length > 0) {
          setMinLength(Math.floor(Math.min(...lengths)))
          setMaxLength(Math.ceil(Math.max(...lengths)))
        }

        if (guests.length > 0) {
          setMinGuests(Math.floor(Math.min(...guests)))
          setMaxGuests(Math.ceil(Math.max(...guests)))
        }
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }

    fetchFilterOptions()
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }, [filters, onFiltersChange])

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      region: null,
      minLength,
      maxLength,
      minGuests,
      maxGuests,
      builder: null,
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
    filters.maxGuests < maxGuests

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
              {regions.length > 0 && (
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
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

              {/* Builder Filter */}
              {builders.length > 0 && (
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import FilterBar, { FilterField, SearchField, TextField, SelectField } from './ui/FilterBar'

const EMPTY_FILTERS = {
  model: '',
  minLength: '',
  maxLength: '',
  minGuests: '',
  maxGuests: '',
  region: '',
  city: '',
  status: '',
}

interface YachtFiltersProps {
  onFilterChange: (filters: typeof EMPTY_FILTERS) => void
}

export default function YachtFilters({ onFilterChange }: YachtFiltersProps) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const update = (patch: Partial<typeof EMPTY_FILTERS>) => {
    const next = { ...filters, ...patch }
    setFilters(next)
    onFilterChange(next)
  }

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    onFilterChange(EMPTY_FILTERS)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <FilterBar hasActiveFilters={hasActiveFilters} onReset={handleReset}>
      <FilterField label="Model">
        <SearchField value={filters.model} onChange={(v) => update({ model: v })} placeholder="e.g. Gozzo" />
      </FilterField>

      <FilterField label="Type">
        <SelectField value={filters.status} onChange={(v) => update({ status: v })}>
          <option value="">All types</option>
          <option value="charter">Charter</option>
          <option value="sale">Sale</option>
        </SelectField>
      </FilterField>

      <FilterField label="Region">
        <TextField placeholder="e.g. Mediterranean" value={filters.region} onChange={(e) => update({ region: e.target.value })} />
      </FilterField>

      <FilterField label="City">
        <TextField placeholder="e.g. Monaco" value={filters.city} onChange={(e) => update({ city: e.target.value })} />
      </FilterField>

      <FilterField label="Length (m)">
        <div style={{ display: 'flex', gap: 8 }}>
          <TextField type="number" step="0.1" placeholder="Min" value={filters.minLength} onChange={(e) => update({ minLength: e.target.value })} />
          <TextField type="number" step="0.1" placeholder="Max" value={filters.maxLength} onChange={(e) => update({ maxLength: e.target.value })} />
        </div>
      </FilterField>

      <FilterField label="Guests">
        <div style={{ display: 'flex', gap: 8 }}>
          <TextField type="number" placeholder="Min" value={filters.minGuests} onChange={(e) => update({ minGuests: e.target.value })} />
          <TextField type="number" placeholder="Max" value={filters.maxGuests} onChange={(e) => update({ maxGuests: e.target.value })} />
        </div>
      </FilterField>
    </FilterBar>
  )
}

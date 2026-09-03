'use client'

import { useEffect, useState } from 'react'
import FilterBar, { FilterField, SearchField, TextField, SelectField } from './ui/FilterBar'
import MultiSelectField, { type MultiSelectOption } from './ui/MultiSelectField'

const EMPTY_FILTERS = {
  model: '',
  minLength: '',
  maxLength: '',
  minGuests: '',
  maxGuests: '',
  region: [] as string[],
  city: [] as string[],
  providerId: [] as string[],
  status: '',
}

interface Meta {
  regions: string[]
  cities: string[]
  providers: MultiSelectOption[]
}

const EMPTY_META: Meta = { regions: [], cities: [], providers: [] }

interface YachtFiltersProps {
  onFilterChange: (filters: typeof EMPTY_FILTERS) => void
}

type OpenFilter = 'region' | 'city' | 'provider' | null

export default function YachtFilters({ onFilterChange }: YachtFiltersProps) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [meta, setMeta] = useState<Meta>(EMPTY_META)
  // Shared so opening one of the two dropdowns closes the other, instead of
  // both being able to stay open at once.
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null)

  useEffect(() => {
    fetch('/api/admin/yachts/meta')
      .then((res) => res.json())
      .then((data) => setMeta({ regions: data.regions || [], cities: data.cities || [], providers: data.providers || [] }))
      .catch((err) => console.error('Fetch yacht meta error:', err))
  }, [])

  const update = (patch: Partial<typeof EMPTY_FILTERS>) => {
    const next = { ...filters, ...patch }
    setFilters(next)
    onFilterChange(next)
  }

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    onFilterChange(EMPTY_FILTERS)
  }

  const hasActiveFilters = Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== ''))

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
        <MultiSelectField
          label="Regions"
          options={meta.regions}
          selected={filters.region}
          onChange={(v) => update({ region: v })}
          isOpen={openFilter === 'region'}
          onOpenChange={(open) => setOpenFilter(open ? 'region' : null)}
        />
      </FilterField>

      <FilterField label="City">
        <MultiSelectField
          label="Cities"
          options={meta.cities}
          selected={filters.city}
          onChange={(v) => update({ city: v })}
          isOpen={openFilter === 'city'}
          onOpenChange={(open) => setOpenFilter(open ? 'city' : null)}
        />
      </FilterField>

      <FilterField label="Provider">
        <MultiSelectField
          label="Providers"
          options={meta.providers}
          selected={filters.providerId}
          onChange={(v) => update({ providerId: v })}
          isOpen={openFilter === 'provider'}
          onOpenChange={(open) => setOpenFilter(open ? 'provider' : null)}
        />
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

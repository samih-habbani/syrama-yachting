'use client'

import { useEffect, useState } from 'react'
import FilterBar, { FilterField, SearchField, TextField } from './ui/FilterBar'
import MultiSelectField from './ui/MultiSelectField'

export const EMPTY_CLIENT_FILTERS = { fullName: '', email: '', phone: '', tags: [] as string[], dateFrom: '', dateTo: '' }

export type ClientFilterState = typeof EMPTY_CLIENT_FILTERS

interface ClientFiltersProps {
  filters: ClientFilterState
  onFiltersChange: (filters: ClientFilterState) => void
}

export default function ClientFilters({ filters, onFiltersChange }: ClientFiltersProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [tagsOpen, setTagsOpen] = useState(false)

  useEffect(() => {
    fetch('/api/clients/meta')
      .then((res) => res.json())
      .then((data) => setAvailableTags(data.tags || []))
      .catch((err) => console.error('Fetch client meta error:', err))
  }, [])

  const update = (patch: Partial<ClientFilterState>) => onFiltersChange({ ...filters, ...patch })

  const hasActiveFilters =
    filters.fullName !== '' || filters.email !== '' || filters.phone !== '' ||
    filters.tags.length > 0 || filters.dateFrom !== '' || filters.dateTo !== ''

  return (
    <FilterBar hasActiveFilters={hasActiveFilters} onReset={() => onFiltersChange(EMPTY_CLIENT_FILTERS)}>
      <FilterField label="Full Name">
        <SearchField value={filters.fullName} onChange={(v) => update({ fullName: v })} placeholder="Search by name…" />
      </FilterField>
      <FilterField label="Email">
        <TextField type="email" placeholder="Search by email…" value={filters.email} onChange={(e) => update({ email: e.target.value })} />
      </FilterField>
      <FilterField label="Phone">
        <TextField type="tel" placeholder="Search by phone…" value={filters.phone} onChange={(e) => update({ phone: e.target.value })} />
      </FilterField>
      <FilterField label="Hashtags">
        <MultiSelectField
          label="hashtags"
          options={availableTags}
          selected={filters.tags}
          onChange={(v) => update({ tags: v })}
          isOpen={tagsOpen}
          onOpenChange={setTagsOpen}
        />
      </FilterField>
      <FilterField label="Date From">
        <TextField type="date" value={filters.dateFrom} onChange={(e) => update({ dateFrom: e.target.value })} />
      </FilterField>
      <FilterField label="Date To">
        <TextField type="date" value={filters.dateTo} onChange={(e) => update({ dateTo: e.target.value })} />
      </FilterField>
    </FilterBar>
  )
}

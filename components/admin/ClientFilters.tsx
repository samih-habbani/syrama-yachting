'use client'

import FilterBar, { FilterField, SearchField, TextField } from './ui/FilterBar'

const EMPTY_FILTERS = { fullName: '', email: '', phone: '', dateFrom: '', dateTo: '' }

interface ClientFiltersProps {
  filters: typeof EMPTY_FILTERS
  onFiltersChange: (filters: typeof EMPTY_FILTERS) => void
}

export default function ClientFilters({ filters, onFiltersChange }: ClientFiltersProps) {
  const update = (patch: Partial<typeof EMPTY_FILTERS>) => onFiltersChange({ ...filters, ...patch })
  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <FilterBar hasActiveFilters={hasActiveFilters} onReset={() => onFiltersChange(EMPTY_FILTERS)}>
      <FilterField label="Full Name">
        <SearchField value={filters.fullName} onChange={(v) => update({ fullName: v })} placeholder="Search by name…" />
      </FilterField>
      <FilterField label="Email">
        <TextField type="email" placeholder="Search by email…" value={filters.email} onChange={(e) => update({ email: e.target.value })} />
      </FilterField>
      <FilterField label="Phone">
        <TextField type="tel" placeholder="Search by phone…" value={filters.phone} onChange={(e) => update({ phone: e.target.value })} />
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

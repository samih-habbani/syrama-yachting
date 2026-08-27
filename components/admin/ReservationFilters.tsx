'use client'

import FilterBar, { FilterField, SearchField, TextField } from './ui/FilterBar'

const EMPTY_FILTERS = { id: '', clientName: '', yachtModel: '', dateFrom: '', dateTo: '' }

interface ReservationFiltersProps {
  filters: typeof EMPTY_FILTERS
  onFiltersChange: (filters: typeof EMPTY_FILTERS) => void
}

export default function ReservationFilters({ filters, onFiltersChange }: ReservationFiltersProps) {
  const update = (patch: Partial<typeof EMPTY_FILTERS>) => onFiltersChange({ ...filters, ...patch })
  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <FilterBar hasActiveFilters={hasActiveFilters} onReset={() => onFiltersChange(EMPTY_FILTERS)}>
      <FilterField label="Reservation ID">
        <TextField type="number" placeholder="e.g. 123" value={filters.id} onChange={(e) => update({ id: e.target.value })} />
      </FilterField>
      <FilterField label="Client">
        <SearchField value={filters.clientName} onChange={(v) => update({ clientName: v })} placeholder="Search by name…" />
      </FilterField>
      <FilterField label="Yacht">
        <TextField placeholder="Search by model…" value={filters.yachtModel} onChange={(e) => update({ yachtModel: e.target.value })} />
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

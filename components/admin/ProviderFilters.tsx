'use client'

import { useEffect, useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import { RotateCcw } from 'lucide-react'
import { FilterField, SearchField } from './ui/FilterBar'
import MultiSelectField from './ui/MultiSelectField'

export const EMPTY_PROVIDER_FILTERS = {
  search: '',
  type: [] as string[],
  region: [] as string[],
  city: [] as string[],
  country: [] as string[],
  services: [] as string[],
}

export type ProviderFilterState = typeof EMPTY_PROVIDER_FILTERS

interface Meta {
  types: string[]
  regions: string[]
  cities: string[]
  countries: string[]
  services: string[]
}

const EMPTY_META: Meta = { types: [], regions: [], cities: [], countries: [], services: [] }

interface ProviderFiltersProps {
  filters: ProviderFilterState
  onFiltersChange: (filters: ProviderFilterState) => void
}

type OpenFilter = 'type' | 'region' | 'city' | 'country' | null

export default function ProviderFilters({ filters, onFiltersChange }: ProviderFiltersProps) {
  const [meta, setMeta] = useState<Meta>(EMPTY_META)
  // Shared across the four multi-selects below so opening one closes any
  // other already-open dropdown, instead of each field tracking its own.
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null)

  useEffect(() => {
    fetch('/api/admin/providers/meta')
      .then((res) => res.json())
      .then((data) => setMeta({
        types: data.types || [],
        regions: data.regions || [],
        cities: data.cities || [],
        countries: data.countries || [],
        services: data.services || [],
      }))
      .catch((err) => console.error('Fetch provider meta error:', err))
  }, [])

  const update = (patch: Partial<ProviderFilterState>) => onFiltersChange({ ...filters, ...patch })

  const toggleService = (service: string) => {
    const next = filters.services.includes(service)
      ? filters.services.filter((s) => s !== service)
      : [...filters.services, service]
    update({ services: next })
  }

  const hasActiveFilters = Object.entries(filters).some(([key, v]) =>
    key === 'search' ? v !== '' : (v as string[]).length > 0
  )

  return (
    <Card style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, alignItems: 'end', marginBottom: meta.services.length > 0 ? 22 : 0 }}>
        <FilterField label="Search">
          <SearchField value={filters.search} onChange={(v) => update({ search: v })} placeholder="Name, company, email, phone…" />
        </FilterField>

        <FilterField label="Type">
          <MultiSelectField
            label="Types"
            options={meta.types}
            selected={filters.type}
            onChange={(v) => update({ type: v })}
            isOpen={openFilter === 'type'}
            onOpenChange={(open) => setOpenFilter(open ? 'type' : null)}
          />
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

        <FilterField label="Country">
          <MultiSelectField
            label="Countries"
            options={meta.countries}
            selected={filters.country}
            onChange={(v) => update({ country: v })}
            isOpen={openFilter === 'country'}
            onOpenChange={(open) => setOpenFilter(open ? 'country' : null)}
          />
        </FilterField>

        <div>
          <Button
            variant="ghost"
            size="md"
            onClick={() => onFiltersChange(EMPTY_PROVIDER_FILTERS)}
            disabled={!hasActiveFilters}
            style={{ width: '100%' }}
          >
            <RotateCcw size={13} strokeWidth={1.75} />
            Reset
          </Button>
        </div>
      </div>

      {meta.services.length > 0 && (
        <div>
          <label style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8f8f7f', display: 'block', marginBottom: 10 }}>
            Services {filters.services.length > 0 && `(${filters.services.length} selected)`}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {meta.services.map((service) => {
              const active = filters.services.includes(service)
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  style={{
                    fontFamily: 'var(--font-lora)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.02em',
                    color: active ? '#06090f' : '#a8a89a',
                    background: active ? '#d4b472' : 'rgba(143,143,127,0.08)',
                    border: active ? '1px solid transparent' : '1px solid rgba(143,143,127,0.2)',
                    borderRadius: 999, padding: '6px 13px', cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  {service}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}

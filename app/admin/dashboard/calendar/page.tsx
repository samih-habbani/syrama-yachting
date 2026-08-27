'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react'
import CalendarView from '@/components/admin/CalendarView'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Button from '@/components/admin/ui/Button'
import { FilterField, SelectField } from '@/components/admin/ui/FilterBar'

export default function CalendarPage() {
  const [regions, setRegions] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    return new Date(now.setDate(diff))
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/yachts?page=1&limit=1000')
        if (response.ok) {
          const data = await response.json()
          const uniqueRegions = Array.from(new Set(data.yachts.map((y: { region?: string }) => y.region).filter(Boolean))) as string[]
          setRegions(uniqueRegions.sort())
          if (uniqueRegions.length > 0) setSelectedRegion(uniqueRegions[0])
        }
      } catch (error) {
        console.error('Fetch regions error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRegions()
  }, [])

  const goToPreviousWeek = () => {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() - 7)
    setWeekStart(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() + 7)
    setWeekStart(newDate)
  }

  const goToCurrentWeek = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    setWeekStart(new Date(now.setDate(diff)))
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Reservations by region and time."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Calendar' }]}
      />

      {isLoading || !selectedRegion ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading calendar…</div>
        </Card>
      ) : (
        <>
          <Card style={{ padding: 24, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 240 }}>
              <FilterField label="Region">
                <SelectField value={selectedRegion} onChange={setSelectedRegion}>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </SelectField>
              </FilterField>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12.5, color: '#8f8f7f', display: 'flex', alignItems: 'center', gap: 6, marginRight: 6 }}>
                <CalendarClock size={13} strokeWidth={1.75} />
                Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <Button variant="secondary" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft size={13} strokeWidth={2} />
              </Button>
              <Button variant="secondary" size="sm" onClick={goToCurrentWeek}>Today</Button>
              <Button variant="secondary" size="sm" onClick={goToNextWeek}>
                <ChevronRight size={13} strokeWidth={2} />
              </Button>
            </div>
          </Card>

          <Card style={{ padding: 16, overflowX: 'auto' }}>
            <CalendarView region={selectedRegion} weekStart={weekStart} />
          </Card>
        </>
      )}
    </div>
  )
}

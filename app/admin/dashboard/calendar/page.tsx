'use client'

import { useEffect, useState } from 'react'
import CalendarView from '@/components/admin/CalendarView'

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
    fetchRegions()
  }, [])

  const fetchRegions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/yachts?page=1&limit=1000')
      if (response.ok) {
        const data = await response.json()
        const uniqueRegions = Array.from(
          new Set(data.yachts.map((y: any) => y.region).filter(Boolean))
        ) as string[]
        setRegions(uniqueRegions.sort())
        if (uniqueRegions.length > 0) {
          setSelectedRegion(uniqueRegions[0])
        }
      }
    } catch (error) {
      console.error('Fetch regions error:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  if (isLoading || !selectedRegion) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500" style={{ fontFamily: 'var(--font-tenor)' }}>Loading calendar...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-lg tracking-wider text-gray-500 mb-2">RESERVATIONS CALENDAR</h2>
        <p className="text-gray-600 text-sm">View all reservations by region and time</p>
      </div>

      {/* Region Selector */}
      <div className="mb-8">
        <label className="text-gray-500 text-xs tracking-widest uppercase block mb-3">
          Select Region
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm w-full md:w-64"
        >
          {regions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Week Navigation */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={goToPreviousWeek}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light"
          >
            ← PREVIOUS WEEK
          </button>
          <button
            onClick={goToCurrentWeek}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light"
          >
            TODAY
          </button>
          <button
            onClick={goToNextWeek}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light"
          >
            NEXT WEEK →
          </button>
        </div>

        <p className="text-gray-500 text-sm">
          Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-[#06090f] rounded-lg border border-[#b8974a] border-opacity-20 p-4 overflow-x-auto">
        <CalendarView region={selectedRegion} weekStart={weekStart} />
      </div>
    </div>
  )
}

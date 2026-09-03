'use client'

import { useState, useEffect } from 'react'

interface Reservation {
  id: number
  date: string
  numberOfPeople: number
  location: string
  status: string
  client: { fullName: string }
  yacht: { model: string }
}

interface CalendarViewProps {
  region: string
  weekStart: Date
}

export default function CalendarView({ region, weekStart }: CalendarViewProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCalendarData()
  }, [region, weekStart])

  const fetchCalendarData = async () => {
    try {
      setIsLoading(true)
      const endDate = new Date(weekStart)
      endDate.setDate(endDate.getDate() + 7)

      const response = await fetch(
        `/api/calendar?region=${region}&startDate=${weekStart.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
      )

      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      console.error('Fetch calendar error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const getDayReservations = (dayIndex: number, hour: number) => {
    const dayDate = new Date(weekStart)
    dayDate.setDate(dayDate.getDate() + dayIndex)
    dayDate.setHours(hour, 0, 0, 0)

    return reservations.filter(res => {
      const resDate = new Date(res.date)
      return (
        resDate.getFullYear() === dayDate.getFullYear() &&
        resDate.getMonth() === dayDate.getMonth() &&
        resDate.getDate() === dayDate.getDate() &&
        resDate.getHours() === hour
      )
    })
  }

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading calendar...</div>
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Header - Days */}
        <div className="grid grid-cols-8 gap-0 bg-[#0f1419] border-b border-[#b8974a]/20">
          <div className="p-3 text-xs text-gray-500 font-light">Time</div>
          {days.map((day, idx) => {
            const dayDate = new Date(weekStart)
            dayDate.setDate(dayDate.getDate() + idx)
            return (
              <div key={day} className="p-3 border-l border-[#b8974a]/20">
                <p className="text-xs text-gray-500 tracking-wider uppercase">{day}</p>
                <p className="text-sm text-[#b8974a] font-semibold">
                  {dayDate.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Hours grid */}
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 gap-0 border-b border-[#b8974a]/10">
            <div className="p-3 text-xs text-gray-600 bg-[#06090f] border-r border-[#b8974a]/10">
              {String(hour).padStart(2, '0')}:00
            </div>

            {days.map((_, dayIdx) => {
              const dayReservations = getDayReservations(dayIdx, hour)
              return (
                <div
                  key={`${hour}-${dayIdx}`}
                  className="p-2 border-l border-[#b8974a]/10 min-h-20 bg-[#0f1419] hover:bg-[#141820] transition"
                >
                  {dayReservations.map(res => (
                    <div
                      key={res.id}
                      className="bg-[#b8974a]/20 border border-[#b8974a]/50 rounded px-2 py-1 mb-1 text-xs"
                    >
                      <p className="text-[#b8974a] font-semibold truncate">{res.yacht.model}</p>
                      <p className="text-gray-300 text-xs truncate">{res.client.fullName}</p>
                      <p className="text-gray-500 text-xs">
                        {res.numberOfPeople} people
                      </p>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

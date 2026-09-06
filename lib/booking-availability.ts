import { prisma } from '@/lib/prisma'

export interface DateRange {
  start: Date
  end: Date
}

// Combines a calendar day with an "HH:MM" time of day into one instant —
// shared by BookingLink and Reservation, which both keep the day and the
// time of day as separate fields.
export function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const combined = new Date(date)
  combined.setUTCHours(hours || 0, minutes || 0, 0, 0)
  return combined
}

// Any other non-cancelled reservation on this yacht whose date range
// overlaps the given one — used both as a soft warning when an admin
// generates a booking link, and as a hard block when a client actually
// submits one, so two links for the same slot can't both turn into real
// bookings.
export async function findConflictingReservations(yachtId: number, range: DateRange, excludeReservationId?: number) {
  const reservations = await prisma.reservation.findMany({
    where: {
      yachtId,
      date: { not: null },
      status: { not: 'cancelled' },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    select: {
      id: true,
      date: true,
      endDate: true,
      startTime: true,
      endTime: true,
      status: true,
      client: { select: { fullName: true } },
    },
  })

  return reservations.filter((r) => {
    if (!r.date) return false
    // A reservation with no recorded time of day is treated as a single
    // instant at midnight rather than an all-day block, so it only
    // conflicts with a range that spans that exact moment — same
    // deliberately loose fallback as before this field existed.
    const start = r.startTime ? combineDateTime(r.date, r.startTime) : r.date
    const endDay = r.endDate || r.date
    const end = r.endTime ? combineDateTime(endDay, r.endTime) : endDay
    return start < range.end && range.start < end
  })
}

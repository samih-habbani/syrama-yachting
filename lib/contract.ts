import { prisma } from '@/lib/prisma'
import type { ContractPdfData } from '@/lib/contract-pdf'
import type { Contract } from '@prisma/client'

// SYR-000025 — simple, unique, traceable back to the reservation it came
// from without needing a separate counter/sequence.
export function bookingReferenceFor(reservationId: number) {
  return `SYR-${String(reservationId).padStart(6, '0')}`
}

export async function createContractForReservation(params: {
  reservationId: number
  clientFullName: string
  clientEmail: string
  clientPhone: string
  clientCountry: string | null
  yachtModel: string
  yachtOperator: string | null
  experienceDate: Date
  experienceEndDate: Date | null
  startTime: string | null
  endTime: string | null
  numberOfGuests: number | null
  plannedItinerary: string | null
  deposit: number | null
  paymentDeadline: Date | null
  totalPrice: number | null
  reservationCreatedAt: Date
}): Promise<Contract> {
  return prisma.contract.create({
    data: {
      reservationId: params.reservationId,
      bookingReference: bookingReferenceFor(params.reservationId),
      clientFullName: params.clientFullName,
      clientEmail: params.clientEmail,
      clientPhone: params.clientPhone,
      clientCountry: params.clientCountry,
      yachtModel: params.yachtModel,
      yachtOperator: params.yachtOperator,
      experienceDate: params.experienceDate,
      experienceEndDate: params.experienceEndDate,
      startTime: params.startTime,
      endTime: params.endTime,
      numberOfGuests: params.numberOfGuests,
      plannedItinerary: params.plannedItinerary,
      deposit: params.deposit,
      paymentDeadline: params.paymentDeadline,
      totalPrice: params.totalPrice,
      reservationCreatedAt: params.reservationCreatedAt,
    },
  })
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
const TBC = '[To be confirmed]'

function formatAmount(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

export function contractToPdfData(contract: Contract): ContractPdfData {
  const start = contract.experienceDate.toLocaleDateString('en-US', DATE_OPTIONS)
  const end = contract.experienceEndDate ? contract.experienceEndDate.toLocaleDateString('en-US', DATE_OPTIONS) : null
  const experienceDateLabel = end && end !== start ? `${start} – ${end}` : start

  return {
    bookingReference: contract.bookingReference,
    agreementDate: contract.createdAt.toLocaleDateString('en-US', DATE_OPTIONS),
    clientFullName: contract.clientFullName,
    clientEmail: contract.clientEmail,
    clientPhone: contract.clientPhone,
    clientCountry: contract.clientCountry,
    yachtModel: contract.yachtModel,
    yachtOperator: contract.yachtOperator,
    experienceDateLabel,
    embarkation: contract.startTime || TBC,
    disembarkation: contract.endTime || TBC,
    numberOfGuests: contract.numberOfGuests != null ? String(contract.numberOfGuests) : TBC,
    plannedItinerary: contract.plannedItinerary || TBC,
    deposit: contract.deposit != null ? formatAmount(contract.deposit) : TBC,
    paymentDeadline: contract.paymentDeadline ? contract.paymentDeadline.toLocaleDateString('en-US', DATE_OPTIONS) : TBC,
    totalPrice: contract.totalPrice != null ? `${formatAmount(contract.totalPrice)} EUR` : TBC,
    syramaSignatureDate: (contract.reservationCreatedAt || contract.createdAt).toLocaleDateString('en-US', DATE_OPTIONS),
  }
}

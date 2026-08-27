'use client'
import { createContext, useContext, useMemo, useState, ReactNode } from 'react'

export interface WhatsappAvailabilityYacht {
  model: string
  builder?: string | null
  length?: number | null
  imageUrl?: string | null
}

interface WhatsappContextValue {
  availabilityYacht: WhatsappAvailabilityYacht | null
  setAvailabilityYacht: (yacht: WhatsappAvailabilityYacht | null) => void
}

const WhatsappContext = createContext<WhatsappContextValue | null>(null)

// Lets a page (e.g. a charter yacht's detail page) override what the global
// floating WhatsApp button does — opening the "Check Availability" popup
// pre-filled for that yacht instead of the default plain WhatsApp link.
export function WhatsappProvider({ children }: { children: ReactNode }) {
  const [availabilityYacht, setAvailabilityYacht] = useState<WhatsappAvailabilityYacht | null>(null)
  const value = useMemo(() => ({ availabilityYacht, setAvailabilityYacht }), [availabilityYacht])
  return <WhatsappContext.Provider value={value}>{children}</WhatsappContext.Provider>
}

export function useWhatsappContext() {
  const ctx = useContext(WhatsappContext)
  if (!ctx) throw new Error('useWhatsappContext must be used within a WhatsappProvider')
  return ctx
}

import { Suspense } from 'react'
import Fleet, { type Yacht, type FleetSeoContent } from './Fleet'
import type { BreadcrumbItem } from './Breadcrumbs'

interface FleetWrapperProps {
  showFilters?: boolean
  limit?: number
  initialYachts?: Yacht[]
  seo?: FleetSeoContent
  initialRegion?: string
  initialCity?: string | null
  destinationLinks?: { kind: 'charter' | 'sale'; region: string; city: string | null; path: string }[]
  breadcrumbItems?: BreadcrumbItem[]
  defaultTab?: 'charter' | 'sale'
}

function FleetLoading() {
  return (
    <div style={{ background: '#06090f', minHeight: '100vh', paddingTop: 80, paddingBottom: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#b8974a' }}>Loading yachts...</div>
    </div>
  )
}

export default function FleetWrapper({ showFilters = true, limit, initialYachts, seo, initialRegion, initialCity, destinationLinks, breadcrumbItems, defaultTab }: FleetWrapperProps) {
  return (
    <Suspense fallback={<FleetLoading />}>
      <Fleet showFilters={showFilters} limit={limit} initialYachts={initialYachts} seo={seo} initialRegion={initialRegion} initialCity={initialCity} destinationLinks={destinationLinks} breadcrumbItems={breadcrumbItems} defaultTab={defaultTab} />
    </Suspense>
  )
}

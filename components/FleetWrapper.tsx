import { Suspense } from 'react'
import Fleet from './Fleet'

interface FleetWrapperProps {
  showFilters?: boolean
  limit?: number
}

function FleetLoading() {
  return (
    <div style={{ background: '#06090f', minHeight: '100vh', paddingTop: 80, paddingBottom: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#b8974a' }}>Loading yachts...</div>
    </div>
  )
}

export default function FleetWrapper({ showFilters = true, limit }: FleetWrapperProps) {
  return (
    <Suspense fallback={<FleetLoading />}>
      <Fleet showFilters={showFilters} limit={limit} />
    </Suspense>
  )
}

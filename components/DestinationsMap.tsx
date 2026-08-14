'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface DestinationsMapProps {
  isSale?: boolean
}

const MapContent = dynamic(
  () => import('./MapContent'),
  {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
  }
)

export default function DestinationsMap({ isSale = false }: DestinationsMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
  }

  return <MapContent isSale={isSale} />
}

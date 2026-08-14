'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Destination {
  id: string
  label: string
  coords: [number, number]
}

const destinations: Destination[] = [
  { id: 'med', label: 'Mediterranean', coords: [38.5, 14.0] },
  { id: 'caribbean', label: 'Caribbean', coords: [17.5, -63.0] },
  { id: 'red-sea', label: 'Red Sea', coords: [22.0, 38.5] },
  { id: 'indian-ocean', label: 'Indian Ocean', coords: [4.0, 73.5] },
]

interface MapContentProps {
  isSale?: boolean
}

function MapEvents({ onMarkerHover }: { onMarkerHover: (id: string | null) => void }) {
  useMapEvents({
    click() {
      onMarkerHover(null)
    },
  })
  return null
}

export default function MapContent({ isSale = false }: MapContentProps) {
  const [active, setActive] = useState<string | null>(null)
  const router = useRouter()

  const handleMarkerClick = (destId: string) => {
    const url = isSale ? `/yachting/fleet?tab=sale&region=${destId}` : `/yachting/fleet?region=${destId}`
    router.push(url)
  }

  const createCustomIcon = (isActive: boolean) => {
    const color = isActive ? '#d4b472' : 'rgba(184,151,74,0.7)'
    const size = isActive ? 30 : 24
    return L.divIcon({
      html: `<div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid #f5eedd;
        box-shadow: 0 0 ${isActive ? 15 : 10}px rgba(184, 151, 74, ${isActive ? 0.8 : 0.6});
        transition: all 0.3s ease;
        cursor: pointer;
      "></div>`,
      iconSize: [size, size] as [number, number],
      iconAnchor: [size / 2, size / 2] as [number, number],
      popupAnchor: [0, -size / 2] as [number, number],
      className: 'custom-marker',
    })
  }

  return (
    <MapContainer
      center={[20, 0] as L.LatLngExpression}
      zoom={2}
      style={{ width: '100%', height: '100%', background: '#1a1a1a' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapEvents onMarkerHover={setActive} />
      {destinations.map(dest => (
        <Marker
          key={dest.id}
          position={dest.coords as L.LatLngExpression}
          icon={createCustomIcon(active === dest.id)}
          eventHandlers={{
            click: () => handleMarkerClick(dest.id),
            mouseover: () => setActive(dest.id),
            mouseout: () => setActive(null),
          }}
        />
      ))}
    </MapContainer>
  )
}

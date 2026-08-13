declare module 'react-simple-maps' {
  import React from 'react'

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, any>
    width?: number
    height?: number
    style?: React.CSSProperties
    children?: React.ReactNode
  }

  export interface GeographiesProps {
    geography: string
    children?: React.ReactNode
  }

  export interface GeographyProps {
    geography: Record<string, any>
    onClick?: (e: any) => void
    onMouseEnter?: (e: any) => void
    onMouseLeave?: (e: any) => void
    style?: Record<string, Record<string, any>>
    children?: React.ReactNode
  }

  export interface MarkerProps {
    coordinates: [number, number]
    onClick?: (e: any) => void
    onMouseEnter?: (e: any) => void
    onMouseLeave?: (e: any) => void
    children?: React.ReactNode
  }

  export const ComposableMap: React.FC<ComposableMapProps>
  export const Geographies: React.FC<GeographiesProps>
  export const Geography: React.FC<GeographyProps>
  export const Marker: React.FC<MarkerProps>
}

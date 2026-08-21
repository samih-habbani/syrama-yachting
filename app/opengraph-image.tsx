import { ImageResponse } from 'next/og'

export const alt = 'Syrama Yachting — Luxury Yacht Charter & Sales'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06090f 0%, #0b1220 100%)',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #b8974a 0%, #d4b472 100%)',
            marginBottom: 40,
          }}
        >
          <span style={{ fontFamily: 'serif', fontSize: 56, fontWeight: 700, color: '#06090f' }}>S</span>
        </div>
        <div style={{ display: 'flex', fontFamily: 'serif', fontSize: 72, fontWeight: 300, color: '#f5eedd', letterSpacing: 8 }}>
          SYRAMA
        </div>
        <div style={{ display: 'flex', fontFamily: 'serif', fontSize: 24, color: '#6a6a5e', letterSpacing: 12, marginTop: 8 }}>
          YACHTING
        </div>
        <div style={{ display: 'flex', fontFamily: 'serif', fontSize: 22, color: '#b8974a', marginTop: 36, letterSpacing: 2 }}>
          Luxury Yacht Charter &amp; Sales
        </div>
      </div>
    ),
    { ...size }
  )
}

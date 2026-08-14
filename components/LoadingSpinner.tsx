'use client'

export default function LoadingSpinner() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(6, 9, 15, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}>
        {/* Spinner */}
        <div style={{
          width: 50,
          height: 50,
          border: '3px solid rgba(184, 151, 74, 0.2)',
          borderTop: '3px solid #b8974a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />

        {/* Loading text */}
        <div style={{
          fontFamily: 'var(--font-tenor)',
          fontSize: 12,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#b8974a',
        }}>
          Loading...
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

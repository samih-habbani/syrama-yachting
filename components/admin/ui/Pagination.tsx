'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  currentPage, totalPages, onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pageBtnStyle = (active: boolean): React.CSSProperties => ({
    minWidth: 32,
    height: 32,
    padding: '0 8px',
    borderRadius: 6,
    fontFamily: 'var(--font-lora)',
    fontSize: 12,
    fontWeight: 600,
    color: active ? '#06090f' : '#8f8f7f',
    background: active ? '#d4b472' : 'transparent',
    border: active ? '1px solid transparent' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  })

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 6,
    color: disabled ? '#4a4a44' : '#d4b472',
    background: 'transparent',
    border: '1px solid rgba(184,151,74,0.2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s ease',
  })

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid rgba(184,151,74,0.1)' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={navBtnStyle(currentPage === 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} strokeWidth={2} />
      </button>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {currentPage > 2 && (
          <>
            <button onClick={() => onPageChange(1)} style={pageBtnStyle(false)}>1</button>
            {currentPage > 3 && <span style={{ color: '#5a5a52', padding: '0 4px' }}>…</span>}
          </>
        )}

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => Math.abs(page - currentPage) <= 1)
          .map((page) => (
            <button key={page} onClick={() => onPageChange(page)} style={pageBtnStyle(page === currentPage)}>
              {page}
            </button>
          ))}

        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && <span style={{ color: '#5a5a52', padding: '0 4px' }}>…</span>}
            <button onClick={() => onPageChange(totalPages)} style={pageBtnStyle(false)}>{totalPages}</button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={navBtnStyle(currentPage === totalPages)}
        aria-label="Next page"
      >
        <ChevronRight size={15} strokeWidth={2} />
      </button>
    </div>
  )
}

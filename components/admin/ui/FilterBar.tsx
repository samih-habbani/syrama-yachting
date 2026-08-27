'use client'
import { ReactNode } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import Card from './Card'
import Button from './Button'

const fieldLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-lora)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: '#8f8f7f',
  display: 'block',
  marginBottom: 8,
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-lora)',
  fontSize: 13,
  color: '#f5eedd',
  background: 'rgba(6,9,15,0.5)',
  border: '1px solid rgba(184,151,74,0.2)',
  borderRadius: 7,
  padding: '10px 14px',
  outline: 'none',
  transition: 'border-color 0.2s ease',
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  )
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <Search size={15} color="#6b6b60" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...fieldStyle, paddingLeft: 38 }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.6)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.2)')}
      />
    </div>
  )
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={fieldStyle}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.6)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.2)')}
    />
  )
}

export function SelectField({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none', backgroundImage: 'none' }}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.6)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.2)')}
    >
      {children}
    </select>
  )
}

export default function FilterBar({
  children, hasActiveFilters, onReset,
}: {
  children: ReactNode
  hasActiveFilters?: boolean
  onReset?: () => void
}) {
  return (
    <Card style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, alignItems: 'end' }}>
        {children}
        {onReset && (
          <div>
            <Button
              variant="ghost"
              size="md"
              onClick={onReset}
              disabled={!hasActiveFilters}
              style={{ width: '100%' }}
            >
              <RotateCcw size={13} strokeWidth={1.75} />
              Reset
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

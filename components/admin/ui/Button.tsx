'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANTS: Record<Variant, { bg: string; bgHover: string; color: string; border: string }> = {
  primary:   { bg: '#b8974a', bgHover: '#d4b472', color: '#06090f', border: 'transparent' },
  secondary: { bg: 'transparent', bgHover: 'rgba(184,151,74,0.1)', color: '#d4b472', border: 'rgba(184,151,74,0.35)' },
  ghost:     { bg: 'transparent', bgHover: 'rgba(245,238,221,0.06)', color: '#a8a89a', border: 'transparent' },
  danger:    { bg: 'transparent', bgHover: 'rgba(196,94,94,0.12)', color: '#e08080', border: 'rgba(196,94,94,0.35)' },
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', style, children, disabled, ...rest },
  ref
) {
  const v = VARIANTS[variant]
  const padding = size === 'sm' ? '8px 14px' : '11px 20px'
  const fontSize = size === 'sm' ? 11 : 12

  return (
    <button
      ref={ref}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: 'var(--font-lora)',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: v.color,
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: 7,
        padding,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.2s ease, border-color 0.2s ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = v.bgHover }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = v.bg }}
      {...rest}
    >
      {children}
    </button>
  )
})

export default Button

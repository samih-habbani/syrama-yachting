import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
}

export default function Card({ children, hoverable = false, className = '', style, ...rest }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(135deg, rgba(184,151,74,0.05) 0%, rgba(212,180,114,0.015) 100%)',
        border: '1px solid rgba(184,151,74,0.12)',
        borderRadius: 10,
        transition: hoverable ? 'border-color 0.25s ease, transform 0.25s ease' : undefined,
        ...style,
      }}
      onMouseEnter={hoverable ? (e) => { e.currentTarget.style.borderColor = 'rgba(184,151,74,0.3)' } : undefined}
      onMouseLeave={hoverable ? (e) => { e.currentTarget.style.borderColor = 'rgba(184,151,74,0.12)' } : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}

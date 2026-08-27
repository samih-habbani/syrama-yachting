type BadgeTone = 'gold' | 'blue' | 'green' | 'red' | 'neutral'

const TONES: Record<BadgeTone, { bg: string; border: string; text: string; dot: string }> = {
  gold:    { bg: 'rgba(184,151,74,0.12)',  border: 'rgba(184,151,74,0.3)',  text: '#d4b472', dot: '#d4b472' },
  blue:    { bg: 'rgba(124,147,173,0.12)', border: 'rgba(124,147,173,0.3)', text: '#9db3cc', dot: '#9db3cc' },
  green:   { bg: 'rgba(122,168,116,0.12)', border: 'rgba(122,168,116,0.3)', text: '#8fc088', dot: '#8fc088' },
  red:     { bg: 'rgba(196,94,94,0.12)',   border: 'rgba(196,94,94,0.3)',   text: '#e08080', dot: '#e08080' },
  neutral: { bg: 'rgba(143,143,127,0.1)',  border: 'rgba(143,143,127,0.25)', text: '#a8a89a', dot: '#a8a89a' },
}

export default function Badge({ children, tone = 'neutral', dot = false }: { children: React.ReactNode; tone?: BadgeTone; dot?: boolean }) {
  const t = TONES[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-lora)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: t.text,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 999,
        padding: '4px 12px',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />}
      {children}
    </span>
  )
}

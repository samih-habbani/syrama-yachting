import { LucideIcon } from 'lucide-react'
import Card from './Card'

type Tone = 'gold' | 'blue' | 'green' | 'red' | 'neutral'

const TONES: Record<Tone, { icon: string; iconBg: string; iconBorder: string }> = {
  gold:    { icon: '#d4b472', iconBg: 'rgba(184,151,74,0.12)',  iconBorder: 'rgba(184,151,74,0.3)' },
  blue:    { icon: '#9db3cc', iconBg: 'rgba(124,147,173,0.12)', iconBorder: 'rgba(124,147,173,0.3)' },
  green:   { icon: '#8fc088', iconBg: 'rgba(122,168,116,0.12)', iconBorder: 'rgba(122,168,116,0.3)' },
  red:     { icon: '#e08080', iconBg: 'rgba(196,94,94,0.12)',   iconBorder: 'rgba(196,94,94,0.3)' },
  neutral: { icon: '#a8a89a', iconBg: 'rgba(143,143,127,0.1)',  iconBorder: 'rgba(143,143,127,0.25)' },
}

export default function StatCard({
  label, value, icon: Icon, tone = 'gold',
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: Tone
}) {
  const t = TONES[tone]
  return (
    <Card style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: t.iconBg, border: `1px solid ${t.iconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Icon size={16} color={t.icon} strokeWidth={1.75} />
        </div>
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a8a89a' }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 40, lineHeight: 1, color: '#f5eedd' }}>
        {value}
      </div>
      <Icon
        size={92}
        strokeWidth={1}
        style={{ position: 'absolute', right: -18, bottom: -18, color: t.icon, opacity: 0.06, pointerEvents: 'none' }}
      />
    </Card>
  )
}

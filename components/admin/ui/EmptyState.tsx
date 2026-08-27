import { LucideIcon } from 'lucide-react'

export default function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '72px 24px' }}>
      <div
        style={{
          width: 52, height: 52, borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(184,151,74,0.08)', border: '1px solid rgba(184,151,74,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon size={22} color="#8f8f7f" strokeWidth={1.5} />
      </div>
      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, color: '#f5eedd', marginBottom: description ? 6 : 0 }}>
        {title}
      </div>
      {description && (
        <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: 0 }}>{description}</p>
      )}
    </div>
  )
}

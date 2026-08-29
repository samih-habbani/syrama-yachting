'use client'

import { Mail } from 'lucide-react'

interface ShareButtonsProps {
  // Label used in the pre-filled share text (e.g. the yacht's name).
  title: string
}

const WHATSAPP_ICON_PATH = 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.19-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.55 3.7-8.24 8.25-8.24m-4.53 4.7c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.13 3.63.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47Z'

// Opens the given URL as a small popup instead of a full new tab, the
// conventional feel for a share dialog (blocked popups just fall back to a
// normal new tab, so this never breaks the share).
function openSharePopup(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=560')
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const getPageUrl = () => (typeof window !== 'undefined' ? window.location.href : '')

  const shareText = `${title} — Syrama Yachting`

  const networks = [
    {
      label: 'WhatsApp',
      onClick: () => openSharePopup(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${getPageUrl()}`)}`),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d={WHATSAPP_ICON_PATH} />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      onClick: () => openSharePopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPageUrl())}`),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
        </svg>
      ),
    },
    {
      label: 'Email',
      onClick: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(getPageUrl())}`
      },
      icon: <Mail size={15} strokeWidth={1.8} />,
    },
    {
      label: 'LinkedIn',
      onClick: () => openSharePopup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPageUrl())}`),
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
        </svg>
      ),
    },
  ]

  const iconButtonStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '1px solid rgba(184,151,74,0.3)',
    background: 'transparent',
    color: '#b8974a',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    padding: 0,
    flexShrink: 0,
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 14 }}>
        Share this yacht
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {networks.map((network) => (
          <button
            key={network.label}
            type="button"
            onClick={network.onClick}
            aria-label={`Share on ${network.label}`}
            title={`Share on ${network.label}`}
            style={iconButtonStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,151,74,0.12)'; e.currentTarget.style.borderColor = 'rgba(184,151,74,0.6)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(184,151,74,0.3)' }}
          >
            {network.icon}
          </button>
        ))}
      </div>
    </div>
  )
}

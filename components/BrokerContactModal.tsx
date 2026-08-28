'use client'

import { useState, useEffect, useRef } from 'react'
import { useModalA11y } from '@/lib/useModalA11y'

interface BrokerContactModalProps {
  isOpen: boolean
  onClose: () => void
  yacht: {
    model: string
    builder?: string | null
    length?: number | null
    imageUrl?: string | null
  }
}

const WHATSAPP_NUMBER = '971505548034'

export default function BrokerContactModal({ isOpen, onClose, yacht }: BrokerContactModalProps) {
  // Message pré-rempli avec le yacht — fait gagner du temps au visiteur, qui
  // peut l'envoyer tel quel ou l'éditer. Calculé avant les hooks pour pouvoir
  // servir de valeur initiale à useState ci-dessous.
  const defaultMessage = `I'm interested in the ${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''}. Please send me more information.`
  // Identifie le yacht courant — sert à re-générer le message par défaut si
  // la même instance de popup est réutilisée pour un yacht différent (cas
  // du listing Fleet.tsx, où une seule popup partagée s'ouvre par card).
  const yachtKey = `${yacht.model}|${yacht.builder ?? ''}|${yacht.length ?? ''}`

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(defaultMessage)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [touched, setTouched] = useState(false)
  const [lastYachtKey, setLastYachtKey] = useState(yachtKey)
  const modalRef = useRef<HTMLDivElement>(null)

  // Recalcule le message par défaut quand on change de yacht — mise à jour
  // pendant le rendu plutôt que dans un effet (pattern recommandé par React
  // pour "ajuster un state quand une prop change", sans rendu intermédiaire).
  if (yachtKey !== lastYachtKey) {
    setLastYachtKey(yachtKey)
    setMessage(defaultMessage)
  }

  // Se ferme en repartant d'un statut propre — évite qu'une confirmation
  // "Sent ✓" reste affichée si l'utilisateur rouvre la popup plus tard
  // (le composant ne démonte pas quand isOpen passe à false, il rend juste null).
  const handleClose = () => {
    setStatus('idle')
    setTouched(false)
    onClose()
  }

  useModalA11y(isOpen, handleClose, modalRef)

  // Verrouille le scroll vertical de la page tant que la popup est ouverte
  // (même approche que AvailabilityModal — html ET body doivent être verrouillés).
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'

      return () => {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo({ top: scrollY, behavior: 'instant' })
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const yachtLabel = [yacht.model, yacht.builder ? `by ${yacht.builder}` : null, yacht.length ? `${yacht.length}m` : null]
    .filter(Boolean)
    .join(' — ')

  const isValid = name.trim().length > 0 && email.trim().length > 0

  const handleSendEmail = async () => {
    setTouched(true)
    if (!isValid || status === 'sending') return
    setStatus('sending')

    const [firstName, ...rest] = name.trim().split(/\s+/)
    const lastName = rest.join(' ') || firstName

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: 'Yacht Sales',
          destination: yachtLabel,
          message: message.trim() || defaultMessage,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const handleWhatsApp = () => {
    setTouched(true)
    if (!isValid) return

    const lines = [
      `Hello Syrama Yachting! I'm interested in the *${yacht.model}*${yacht.builder ? ` (${yacht.builder})` : ''}${yacht.length ? `, ${yacht.length}m` : ''}.`,
      '',
      `👤 Name: ${name.trim()}`,
      `✉️ Email: ${email.trim()}`,
      phone.trim() ? `📞 Phone: ${phone.trim()}` : null,
      '',
      message.trim() || defaultMessage,
    ].filter((line): line is string => line !== null)

    if (yacht.imageUrl) {
      const absoluteImageUrl = typeof window !== 'undefined'
        ? new URL(yacht.imageUrl, window.location.origin).toString()
        : yacht.imageUrl
      lines.push('', absoluteImageUrl)
    }

    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
    handleClose()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: 'rgba(6, 9, 15, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'brokerFadeIn 0.25s ease-out',
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes brokerFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes brokerSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .broker-modal-content {
          animation: brokerSlideUp 0.35s cubic-bezier(0.25, 0.1, 0, 1);
        }
      `}</style>

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="broker-modal-title"
        className="broker-modal-content relative bg-gradient-to-b from-[#0f1419] to-[#06090f] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden rounded-lg border border-[#b8974a] border-opacity-20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-[#06090f]/60 text-gray-300 hover:text-[#f5eedd] hover:bg-white/10 transition"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" />
            <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>

        <div className="overflow-y-auto min-h-0 p-6 sm:p-10">
          {yacht.imageUrl && (
            <div className="w-full h-36 sm:h-44 rounded-lg overflow-hidden mb-6">
              <img
                src={yacht.imageUrl}
                alt={yacht.model}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.75)' }}
              />
            </div>
          )}

          <div className="mb-8 pr-8">
            <h2 id="broker-modal-title" className="text-[#b8974a] text-sm tracking-widest uppercase mb-2">Contact Broker</h2>
            <h3 className="text-2xl text-white" style={{ fontFamily: 'var(--font-tenor)' }}>
              {yachtLabel}
            </h3>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="broker-name" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Full Name *</label>
              <input
                id="broker-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alexander Smith"
                className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
              />
              {touched && !name.trim() && (
                <p className="text-[#e0a45a] text-xs mt-2">Please enter your name.</p>
              )}
            </div>

            <div>
              <label htmlFor="broker-email" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Email *</label>
              <input
                id="broker-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
              />
              {touched && !email.trim() && (
                <p className="text-[#e0a45a] text-xs mt-2">Please enter your email.</p>
              )}
            </div>

            <div>
              <label htmlFor="broker-phone" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Phone / WhatsApp</label>
              <input
                id="broker-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33..."
                className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500"
              />
            </div>

            <div>
              <label htmlFor="broker-message" className="text-gray-500 text-xs tracking-widest uppercase block mb-3">Message</label>
              <textarea
                id="broker-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={defaultMessage}
                rows={3}
                className="w-full bg-[#06090f] bg-opacity-80 border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 rounded-lg px-4 py-3 text-[#f5eedd] focus:outline-none transition text-sm placeholder-gray-500 resize-none"
              />
            </div>

            {status === 'sent' && (
              <div className="text-[#8fd19e] text-xs bg-[#8fd19e]/10 border border-[#8fd19e]/20 rounded-lg px-4 py-3">
                ✓ Message sent — our broker will follow up with you shortly.
              </div>
            )}
            {status === 'error' && (
              <div className="text-[#e0776a] text-xs bg-[#e0776a]/10 border border-[#e0776a]/20 rounded-lg px-4 py-3">
                Something went wrong sending your message. Please try WhatsApp instead, or try again.
              </div>
            )}

            <div className="flex flex-col gap-3 pt-1">
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={status === 'sending' || status === 'sent'}
                className="w-full bg-[#b8974a] text-[#06090f] rounded-lg px-6 py-3.5 transition font-medium text-sm tracking-wider uppercase hover:bg-[#d4b472] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent ✓' : 'Send Email'}
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-[#06090f] rounded-lg px-6 py-3.5 transition font-medium text-sm tracking-wider uppercase hover:bg-[#1ebe5a]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.19-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.55 3.7-8.24 8.25-8.24m-4.53 4.7c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.13 3.63.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47Z" />
                </svg>
                Contact via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

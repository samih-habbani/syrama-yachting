'use client'
import { useState } from 'react'
import AvailabilityModal from './AvailabilityModal'
import { useWhatsappContext } from './WhatsappContext'

const buttonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '32px',
  right: '32px',
  width: '60px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  zIndex: 40,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  padding: 0,
}

const iconImg = (
  <img
    src="/assets/whatsapp.png"
    alt="WhatsApp"
    style={{ width: '52px', height: '52px', objectFit: 'contain' }}
  />
)

function onHoverIn(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = 'scale(1.1)'
  e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)'
}
function onHoverOut(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = 'scale(1)'
  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
}

export default function WhatsappButton() {
  const { availabilityYacht } = useWhatsappContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // A charter yacht's detail page registers itself via WhatsappContext —
  // in that case the button opens the same "Check Availability" popup as
  // the yacht cards, pre-filled for this yacht, instead of a plain WhatsApp link.
  if (availabilityYacht) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title="Check availability on WhatsApp"
          style={buttonStyle}
          onMouseEnter={onHoverIn}
          onMouseLeave={onHoverOut}
        >
          {iconImg}
        </button>
        <AvailabilityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          yacht={availabilityYacht}
        />
      </>
    )
  }

  const phoneNumber = '971505548034'
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20Syrama%20Yachting`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Contact us on WhatsApp"
      style={buttonStyle}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
    >
      {iconImg}
    </a>
  )
}

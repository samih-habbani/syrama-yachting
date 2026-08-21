'use client'

export default function WhatsappButton() {
  const phoneNumber = '971505548034'
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20Syrama%20Yachting`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Contact us on WhatsApp"
      style={{
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
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      <img
        src="/assets/whatsapp.png"
        alt="WhatsApp"
        style={{
          width: '52px',
          height: '52px',
          objectFit: 'contain',
        }}
      />
    </a>
  )
}

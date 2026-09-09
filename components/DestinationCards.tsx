'use client'
import Link from 'next/link'
import { motion, cubicBezier } from 'framer-motion'

const destinations = [
  { id: 'French Riviera', label: 'French Riviera', sub: 'Saint-Tropez · Cannes · Monaco', image: '/images/regions/French_Riviera.webp' },
  { id: 'Balearic Islands', label: 'Balearic Islands', sub: 'Ibiza · Formentera · Spain', image: '/images/regions/Balearic_Islands.webp' },
  { id: 'Greece', label: 'Greece', sub: 'Cyclades · Santorini · Mykonos', image: '/images/regions/Greece.webp' },
  { id: 'Emirates', label: 'Emirates', sub: 'Dubai · Abu Dhabi · Persian Gulf', image: '/images/regions/Dubai.webp' },
  { id: 'Italy', label: 'Italy', sub: 'Amalfi · Sicily · Mediterranean', image: '/images/regions/Italy.webp' },
  { id: 'Corsica', label: 'Corsica', sub: 'France · Mediterranean', image: '/images/regions/Corsica.webp' },
  { id: 'Maldives', label: 'Maldives', sub: 'Indian Ocean · Tropical Paradise', image: '/images/regions/Maldives.webp' },
  { id: 'Caribbean', label: 'Caribbean', sub: 'Virgin Islands · Bahamas', image: '/images/regions/Caribbean.webp' },
  { id: 'Sardinia', label: 'Sardinia', sub: 'Mediterranean · Italy', image: '/images/regions/Sardinia.webp' },
  { id: 'Miami', label: 'Miami', sub: 'Florida · USA', image: '/images/regions/Miami.webp' },
]

// Same destinations as components/sections/Destinations.tsx — every one now
// has a dedicated /yacht-charter/[slug] SEO page (see lib/destinations.ts).
// Charter tiles link there instead of the generic filtered fleet view.
const DESTINATION_PAGE_BY_ID: Record<string, string> = {
  'French Riviera': '/yacht-charter/french-riviera',
  'Balearic Islands': '/yacht-charter/balearic-islands',
  'Greece': '/yacht-charter/greece',
  'Emirates': '/yacht-charter/emirates/dubai',
  'Italy': '/yacht-charter/italy',
  'Corsica': '/yacht-charter/corsica',
  'Maldives': '/yacht-charter/maldives',
  'Caribbean': '/yacht-charter/caribbean',
  'Sardinia': '/yacht-charter/sardinia',
  'Miami': '/yacht-charter/miami',
}

export interface SaleDestinationTile {
  name: string
  sub: string
  heroImage: string
  href: string
}

interface DestinationCardsProps {
  isSale?: boolean
  // Server-fetched sale-kind destinations (see app/sales/page.tsx and
  // lib/destinations.ts) — real inventory only. Unlike the hardcoded
  // charter list above, sale tiles are driven entirely by what actually
  // exists in the database: today that's a single French Riviera tile
  // (all sale inventory is there), and a second tile appears automatically
  // the moment a sale destination for another region is added via
  // /admin/dashboard/destinations — no code change. Ignored when !isSale.
  saleDestinations?: SaleDestinationTile[]
}

export default function DestinationCards({ isSale = false, saleDestinations = [] }: DestinationCardsProps) {
  const buildHref = (id: string) => {
    if (DESTINATION_PAGE_BY_ID[id]) return DESTINATION_PAGE_BY_ID[id]
    return `/yachting/fleet?region=${id}`
  }

  const tiles = isSale
    ? saleDestinations.map((d) => ({ id: d.href, label: d.name, sub: d.sub, image: d.heroImage, href: d.href }))
    : destinations.map((d) => ({ id: d.id, label: d.label, sub: d.sub, image: d.image, href: buildHref(d.id) }))

  return (
    <div style={{ flex: 1, padding: '64px clamp(24px, 6vw, 96px) 100px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: cubicBezier(0.25, 0.1, 0, 1) }}
        style={{ marginBottom: 56 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 32, height: 1, background: '#b8974a' }} />
          <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>
            {isSale ? 'Yachts For Sale' : 'Charter Destinations'}
          </span>
        </div>
        {/* The page's single H1 — /yacht-charter and /yacht-sale are pillar
            pages built around this exact wording (see their page.tsx
            metadata: title/H1 are meant to match), so this text is not a
            free-form label like the rest of the component. */}
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(20px, 4.4vw, 58px)', lineHeight: 1.05, color: '#f5eedd', margin: '0 0 20px' }}>
          {isSale ? 'Luxury Yachts for Sale Worldwide' : 'Luxury Yacht Charter Worldwide'}
        </h1>
        <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#8f8f7f', margin: 0, maxWidth: 640 }}>
          {isSale
            ? 'Buy your next motor yacht or superyacht through Syrama Yachting — a curated brokerage fleet, with guidance from first enquiry through to acquisition.'
            : 'Charter a private, fully crewed luxury yacht anywhere in the world — motor yachts and superyachts, with an advisor dedicated to your itinerary from first enquiry to disembarkation.'}
        </p>

        {/* Discreet, low-commitment CTA for a visitor who already knows what
            they want and would rather message someone than browse — kept
            small and secondary so it doesn't compete with the destination
            grid below, which is still this page's main path. */}
        <a
          href={`https://wa.me/971505548034?text=${encodeURIComponent(isSale ? "Hello Syrama Yachting! I'd like help finding a yacht to buy." : "Hello Syrama Yachting! I'd like help finding the right yacht for my charter.")}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-tenor)',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#b8974a',
            border: '1px solid rgba(184,151,74,0.3)',
            padding: '13px 22px',
            textDecoration: 'none',
            marginTop: 28,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/whatsapp.png" alt="" style={{ width: 15, height: 15 }} />
          {isSale ? 'Speak to a Broker' : 'Speak to a Yacht Advisor'}
        </a>
      </motion.div>

      {/* Destination cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {tiles.map((dest, i) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: cubicBezier(0.25, 0.1, 0, 1) }}
          >
            <Link href={dest.href} style={{ textDecoration: 'none', display: 'block' }}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'relative', height: 'clamp(240px, 32vw, 320px)', overflow: 'hidden', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector('img')
                  if (img) img.style.transform = 'scale(1.08)'
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img')
                  if (img) img.style.transform = 'scale(1)'
                }}
              >
                <img
                  src={dest.image}
                  alt={dest.label}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.6)',
                    transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)',
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.92) 0%, rgba(6,9,15,0.35) 55%, transparent 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2, marginBottom: 6 }}>
                    {dest.label}
                  </div>
                  {dest.sub && (
                    <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9a8e', marginBottom: 16 }}>
                      {dest.sub}
                    </div>
                  )}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a' }}>
                    View Yachts
                    <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
                      <line x1="0" y1="2" x2="10" y2="2" stroke="currentColor" strokeWidth="0.8" />
                      <polyline points="7.5,0.5 12,2 7.5,3.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main "can't decide" CTA — the highest-intent moment on this page:
          someone who has just looked through every destination and still
          hasn't found the right fit. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{
          marginTop: 80,
          padding: 'clamp(40px, 6vw, 64px)',
          textAlign: 'center',
          border: '1px solid rgba(184,151,74,0.2)',
          background: 'linear-gradient(135deg, rgba(184,151,74,0.06) 0%, rgba(212,180,114,0.02) 100%)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 16 }}>
          {isSale ? "Can't Find The Right Yacht To Buy?" : "Can't Find The Right Yacht?"}
        </div>
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(28px, 4vw, 44px)', color: '#f5eedd', margin: '0 0 20px' }}>
          Let Us Source It For You.
        </h2>
        <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#8f8f7f', maxWidth: 560, margin: '0 auto 36px' }}>
          {isSale
            ? 'Tell us the type of yacht, your budget and preferred region. Our brokers will source the most suitable listings for you.'
            : 'Tell us your dates, number of guests and preferred itinerary. Our team will source the most suitable options for you.'}
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <a
            href={`https://wa.me/971505548034?text=${encodeURIComponent(isSale ? "Hello Syrama Yachting! I'd like a tailored yacht selection to buy. Here's the type of yacht, my budget and preferred region:" : "Hello Syrama Yachting! I'd like a tailored yacht selection. Here are my dates, guest count and preferred itinerary:")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'var(--font-tenor)',
              fontSize: 10,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#06090f',
              background: 'linear-gradient(135deg, #b8974a, #d4b472)',
              padding: '16px 32px',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(184,151,74,0.35)',
            }}
          >
            Request a Selection
            <svg width="16" height="5" viewBox="0 0 16 5" fill="none"><line x1="0" y1="2.5" x2="12" y2="2.5" stroke="currentColor" /><polyline points="9,1 14,2.5 9,4" stroke="currentColor" strokeWidth="0.8" fill="none" /></svg>
          </a>
          <a
            href={isSale
              ? "mailto:contact@syrama-services.com?subject=Yacht%20Purchase%20Selection%20Request&body=Hello%20Syrama%20Yachting%2C%0A%0AI'd%20like%20a%20tailored%20yacht%20selection%20to%20buy.%20Here's%20the%20type%20of%20yacht%2C%20my%20budget%20and%20preferred%20region%3A%0A"
              : "mailto:contact@syrama-services.com?subject=Yacht%20Selection%20Request&body=Hello%20Syrama%20Yachting%2C%0A%0AI'd%20like%20a%20tailored%20yacht%20selection.%20Here%20are%20my%20dates%2C%20guest%20count%20and%20preferred%20itinerary%3A%0A"}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'var(--font-tenor)',
              fontSize: 10,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#b8974a',
              border: '1px solid rgba(184,151,74,0.35)',
              padding: '16px 32px',
              textDecoration: 'none',
            }}
          >
            Email Us
          </a>
        </div>
        <Link
          href={isSale ? '/yacht-sale/all-yachts' : '/yachting/fleet'}
          style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8f8f7f', textDecoration: 'underline', textUnderlineOffset: 4 }}
        >
          Or browse our full fleet
        </Link>
      </motion.div>
    </div>
  )
}

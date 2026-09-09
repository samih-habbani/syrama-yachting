'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReservationModal from './ReservationModal'
import AvailabilityModal from './AvailabilityModal'
import BrokerContactModal from './BrokerContactModal'
import ShareButtons from './ShareButtons'
import YachtExperienceJourney from './YachtExperienceJourney'
import FaqAccordion from './FaqAccordion'
import Footer from './Footer'
import { useWhatsappContext } from './WhatsappContext'
import { yachtHref } from '@/lib/slug'
import { getCharterRateInfo, formatCharterRate, formatAmount } from '@/lib/yacht-price'

interface Media {
  id: number
  url: string | null
  alt: string | null
}

interface Yacht {
  id: number
  model: string
  builder: string | null
  length: number
  lengthUnit?: string
  maxGuests: number | null
  cabins: number
  bathrooms: number | null
  maxSleeping: number | null
  year: number | null
  priceDay: number | null
  priceHour: number | null
  priceWeek: number | null
  priceSale: number | null
  currency?: string | null
  region: string | null
  city: string | null
  status: string | null
  engines: string | null
  engineHours: number | null
  beam: number | null
  beamOpenPlatform: number | null
  draft: number | null
  cruiseSpeed: number | null
  maxSpeed: number | null
  consumption: string | null
  autonomy: string | null
  fuelCapacity: number | null
  waterCapacity: number | null
  navigationClass: string | null
  dryWeight: number | null
  hull: string | null
  media?: Media[]
}

interface SimilarYacht {
  id: number
  model: string
  builder: string | null
  length: number
  lengthUnit?: string
  maxGuests: number | null
  cabins: number
  priceDay: number | null
  priceHour: number | null
  priceWeek: number | null
  currency?: string | null
  priceSale: number | null
  region: string | null
  city: string | null
  status: string | null
  href?: string
  media?: Media[]
}

interface YachtDetailClientProps {
  yacht: Yacht
  similarYachts?: SimilarYacht[]
  // Set when this yacht's city/region matches one of the dedicated SEO
  // destination pages (see lib/destinations.ts) — lets the "back" link go
  // straight there instead of the generic filtered fleet view. Undefined
  // for yachts outside those destinations, which keep the existing link.
  destinationHref?: string
  // The matched destination's name and its "Suggested Itineraries" —
  // real, already-written cruising routes near where this yacht is based
  // (see lib/destinations.ts), not fabricated per-yacht content. Both
  // undefined for yachts outside a mapped destination.
  destinationName?: string
  itineraries?: { name: string; description: string }[]
  // The matched destination's FAQ — shown on a *sale* yacht's page (a
  // charter yacht's page uses the itineraries/journey section above
  // instead; there's no cruising-itinerary equivalent for a purchase
  // decision, but the same FAQ content that already exists on the
  // destination page is directly useful here too).
  destinationFaq?: { question: string; answer: string }[]
  // Other destination pages to cross-link from this yacht's page — same
  // internal-mesh links shown on the destination page itself. Empty for
  // yachts outside a mapped destination or with no sibling destinations.
  relatedDestinations?: { name: string; href: string }[]
}

// A field with no real data (null/undefined/empty string, or 0 — some
// imports store a missing number as 0 instead of null, e.g. year: 0) must
// never be shown as if it were a value. Used everywhere a spec is rendered.
const hasValue = (v: unknown): v is number | string => v !== null && v !== undefined && v !== '' && v !== 0

export default function YachtDetailClient({ yacht, similarYachts = [], destinationHref, destinationName, itineraries, destinationFaq, relatedDestinations = [] }: YachtDetailClientProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [isReservationOpen, setIsReservationOpen] = useState(false)
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false)
  const [isBrokerOpen, setIsBrokerOpen] = useState(false)
  const images = yacht.media || []
  const prev = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setImgIndex(i => (i + 1) % images.length)

  const isCharter = (yacht.status || '').toLowerCase() === 'location'
  const rate = getCharterRateInfo(yacht)

  // "Our fleet" back-link — the fleet page defaults its tab to Charter, so a
  // sale yacht's page must explicitly pass tab=sale or the user lands back
  // on the wrong filter after browsing a sale listing.
  const fleetParams = new URLSearchParams()
  if (yacht.region) fleetParams.set('region', yacht.region)
  if (!isCharter) fleetParams.set('tab', 'sale')
  // A yacht (charter or sale) whose city/region matches a dedicated SEO
  // destination page (see lib/destinations.ts) links back there instead of
  // the generic filtered fleet view — destinationHref is already kind-aware
  // (getDestinationForYacht/destinationFullPath in yacht-detail-shared.tsx
  // only ever match a same-kind destination), so this is correct for both:
  // a charter yacht returns to its /yacht-charter/... page, a sale yacht to
  // its /yacht-sale/... page — never to the generic /yachting/fleet fallback
  // (which now redirects to /yacht-charter|sale/all-yachts, losing the
  // region/city context) when a more specific page exists.
  const fleetHref = destinationHref
    ? destinationHref
    : fleetParams.size > 0 ? `/yachting/fleet?${fleetParams.toString()}` : '/yachting/fleet'

  // A charter guest planning a trip needs the essentials to picture the
  // cruise — size, capacity/comfort, brand, and where to embark — not a
  // full technical sheet (that's for a buyer, see saleSpecs below). Either
  // way, a spec with no real data is dropped instead of being shown blank
  // or as a misleading 0 (see hasValue above).
  const charterSpecs: [string, number | string | null | undefined][] = [
    ['Length', `${yacht.length}${yacht.lengthUnit || 'm'}`],
    ['Builder', yacht.builder],
    ['Year', yacht.year],
    ['Cabins', yacht.cabins],
    ['Bathrooms', yacht.bathrooms],
    ['Guests', yacht.maxGuests],
    ['Region', yacht.region],
    ['City', yacht.city],
  ]
  const saleSpecs: [string, number | string | null | undefined][] = [
    ['Length', `${yacht.length}${yacht.lengthUnit || 'm'}`],
    ['Builder', yacht.builder],
    ['Year', yacht.year],
    ['Cabins', yacht.cabins],
    ['Bathrooms', yacht.bathrooms],
    ['Guests', yacht.maxGuests],
    ['Max Sleeping', yacht.maxSleeping],
    ['Region', yacht.region],
    ['City', yacht.city],
    ['Hull', yacht.hull],
    ['Engines', yacht.engines],
    ['Engine Hours', hasValue(yacht.engineHours) ? `${yacht.engineHours}h` : null],
    ['Beam', hasValue(yacht.beam) ? `${yacht.beam}m` : null],
    ['Beam (Open Platform)', hasValue(yacht.beamOpenPlatform) ? `${yacht.beamOpenPlatform}m` : null],
    ['Draft', hasValue(yacht.draft) ? `${yacht.draft}m` : null],
    ['Cruise Speed', hasValue(yacht.cruiseSpeed) ? `${yacht.cruiseSpeed} kn` : null],
    ['Max Speed', hasValue(yacht.maxSpeed) ? `${yacht.maxSpeed} kn` : null],
    ['Fuel Capacity', hasValue(yacht.fuelCapacity) ? `${yacht.fuelCapacity} L` : null],
    ['Water Capacity', hasValue(yacht.waterCapacity) ? `${yacht.waterCapacity} L` : null],
    ['Navigation Class', yacht.navigationClass],
    ['Consumption', yacht.consumption],
    ['Autonomy', yacht.autonomy],
    ['Dry Weight', hasValue(yacht.dryWeight) ? `${yacht.dryWeight} kg` : null],
  ]
  const specs = (isCharter ? charterSpecs : saleSpecs).filter(([, value]) => hasValue(value))

  const availabilityYacht = {
    model: yacht.model,
    builder: yacht.builder,
    length: yacht.length,
    imageUrl: images[0]?.url ? `/uploads/yachts/${images[0].url}` : null,
  }
  const { setAvailabilityYacht } = useWhatsappContext()

  // On a charter yacht's page, the floating WhatsApp button opens the same
  // "Check Availability" popup as the fleet cards instead of a plain link.
  useEffect(() => {
    if (!isCharter) return
    setAvailabilityYacht(availabilityYacht)
    return () => setAvailabilityYacht(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yacht.id, isCharter])

  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh' }}>
      <nav className="px-5 md:px-12" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20, background: 'rgba(6,9,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
        <Link href={fleetHref} style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8f8f7f', textDecoration: 'none' }}>← Our fleet</Link>
        {isCharter ? (
          <button
            type="button"
            onClick={() => setIsReservationOpen(true)}
            style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '12px 24px', border: 'none', cursor: 'pointer' }}
          >
            Request Charter
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsBrokerOpen(true)}
            style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '12px 24px', border: 'none', cursor: 'pointer' }}
          >
            Contact Broker
          </button>
        )}
      </nav>

      <div className="h-[56vh] md:h-[70vh]" style={{ position: 'relative', overflow: 'hidden', marginTop: 64, background: '#1a1a1a' }}>
        {images.length > 0 && (
          <Image
            src={`/uploads/yachts/${images[imgIndex].url}`}
            alt={images[imgIndex].alt || yacht.model}
            fill
            priority
            sizes="100vw"
            quality={80}
            style={{ objectFit: 'cover', filter: 'brightness(0.65)' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(6,9,15,0.9) 100%)' }} />
        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous photo" style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.3)', color: '#b8974a', width: 44, height: 44, cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(8px)' }}>‹</button>
            <button onClick={next} aria-label="Next photo" style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(6,9,15,0.5)', border: '1px solid rgba(184,151,74,0.3)', color: '#b8974a', width: 44, height: 44, cursor: 'pointer', fontSize: 18, backdropFilter: 'blur(8px)' }}>›</button>
            <div style={{ position: 'absolute', bottom: 20, right: 24, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(245,238,221,0.5)' }}>{imgIndex + 1} / {images.length}</div>
          </>
        )}
        <div style={{ position: 'absolute', bottom: 32, left: 'clamp(24px, 6vw, 96px)', right: 'clamp(24px, 6vw, 96px)' }}>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: '#f5eedd', lineHeight: 1.1, margin: 0 }}>{yacht.model}</h1>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 8 }}>
            {[`${yacht.length}${yacht.lengthUnit || 'm'}`, yacht.builder, hasValue(yacht.year) ? yacht.year : null].filter(hasValue).join(' · ')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px clamp(24px, 6vw, 96px)', background: '#06090f', overflowX: 'auto' }}>
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setImgIndex(i)}
            aria-label={`View photo ${i + 1} of ${images.length}`}
            aria-current={imgIndex === i}
            style={{ position: 'relative', width: 80, height: 56, overflow: 'hidden', cursor: 'pointer', padding: 0, border: 'none', background: 'none', outline: imgIndex === i ? '2px solid #b8974a' : '2px solid transparent', outlineOffset: 2, transition: 'outline-color 0.2s ease', flexShrink: 0 }}
          >
            <Image
              src={`/uploads/yachts/${img.url}`}
              alt=""
              fill
              loading="lazy"
              sizes="80px"
              quality={75}
              style={{ objectFit: 'cover', filter: imgIndex === i ? 'brightness(1)' : 'brightness(0.5)', transition: 'filter 0.3s ease' }}
            />
          </button>
        ))}
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-20 pt-12 pb-16 md:pt-16 md:pb-[120px]"
        style={{ paddingLeft: 'clamp(24px, 6vw, 96px)', paddingRight: 'clamp(24px, 6vw, 96px)', alignItems: 'start' }}
      >
        <div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
            {specs.map(([label, value]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>{value}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 2, color: '#8f8f7f', marginBottom: itineraries && itineraries.length > 0 ? 40 : 48 }}>
            {isCharter
              ? `Charter the ${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''}, a ${yacht.length}${yacht.lengthUnit || 'm'} yacht${hasValue(yacht.maxGuests) ? ` accommodating up to ${yacht.maxGuests} guests` : ''}${hasValue(yacht.cabins) ? ` across ${yacht.cabins} cabin${yacht.cabins === 1 ? '' : 's'}` : ''}${yacht.city ? `, based in ${yacht.city}` : yacht.region ? `, based in ${yacht.region}` : ''}. Syrama Yachting arranges the crew, provisioning and itinerary around your dates.`
              : `The ${yacht.model}${yacht.builder ? ` by ${yacht.builder}` : ''} is available for sale — a ${yacht.length}${yacht.lengthUnit || 'm'} yacht${hasValue(yacht.year) ? ` built in ${yacht.year}` : ''}${yacht.city ? `, currently located in ${yacht.city}` : yacht.region ? `, currently located in ${yacht.region}` : ''}. Contact Syrama Yachting to speak with a broker about this vessel.`}
          </p>

          {/* Real cruising routes near where this yacht is based — reused
              from its matched destination page (lib/destinations.ts), not
              invented per-yacht. Charter-only: a buyer isn't planning a
              cruise. */}
          {isCharter && itineraries && itineraries.length > 0 && (
            <div style={{ marginBottom: 48, paddingTop: 40, borderTop: '1px solid rgba(184,151,74,0.12)' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>Suggested Itineraries</div>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(22px, 2.6vw, 30px)', fontWeight: 300, color: '#f5eedd', margin: '0 0 28px' }}>
                Cruising Near {destinationName}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28 }}>
                {itineraries.map((item) => (
                  <div key={item.name} style={{ borderLeft: '2px solid #b8974a', paddingLeft: 18 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#f5eedd', marginBottom: 8 }}>{item.name}</div>
                    <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#8f8f7f', margin: 0 }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sale equivalent of the itineraries block above — reused from
              the matched destination page's own FAQ (lib/destinations.ts),
              not invented per-yacht. There's no cruising-itinerary
              equivalent for a purchase decision, but this same content is
              directly useful here. */}
          {!isCharter && destinationFaq && destinationFaq.length > 0 && (
            <div style={{ marginBottom: 48, paddingTop: 40, borderTop: '1px solid rgba(184,151,74,0.12)' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>FAQ</div>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(22px, 2.6vw, 30px)', fontWeight: 300, color: '#f5eedd', margin: '0 0 28px' }}>
                Buying a Yacht in {destinationName}
              </h2>
              <FaqAccordion items={destinationFaq} />
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-[100px]">
          <div style={{ border: '1px solid rgba(184,151,74,0.2)', padding: 36, background: 'rgba(184,151,74,0.02)' }}>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 300, color: '#f5eedd', marginBottom: 8 }}>{yacht.model}</div>
            {isCharter && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 8 }}>{rate ? 'From' : ''}</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 2.4vw, 30px)', fontWeight: 300, color: '#d4b472', lineHeight: 1 }}>
                  {rate ? (
                    <>
                      {formatAmount(rate.amount, yacht.currency || 'EUR')}
                      <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8f8f7f' }}>/{rate.unit}</span>
                    </>
                  ) : (
                    'Price on request'
                  )}
                </div>
              </div>
            )}
            {!isCharter && yacht.priceSale && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 8 }}>Asking Price</div>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 2.4vw, 30px)', fontWeight: 300, color: '#d4b472', lineHeight: 1 }}>
                  €{yacht.priceSale.toLocaleString('en-US')}
                </div>
              </div>
            )}
            {isCharter ? (
              <button onClick={() => setIsReservationOpen(true)} style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '16px', border: 'none', cursor: 'pointer', marginBottom: 16 }}>Request charter</button>
            ) : (
              <button type="button" onClick={() => setIsBrokerOpen(true)} style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '16px', border: 'none', cursor: 'pointer', marginBottom: 16 }}>Contact Broker</button>
            )}
            {isCharter ? (
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(true)}
                style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', background: 'none', border: '1px solid rgba(184,151,74,0.3)', padding: '14px', cursor: 'pointer' }}
              >
                WhatsApp us
              </button>
            ) : (
              <a href={`https://wa.me/971505548034?text=${encodeURIComponent(`Hello Syrama Yachting! I'd like to know more about the *${yacht.model}*.`)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', border: '1px solid rgba(184,151,74,0.3)', padding: '14px', textDecoration: 'none' }}>WhatsApp us</a>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <ShareButtons title={yacht.model} />
          </div>
        </div>
      </div>

      {/* The full-experience storytelling section only makes sense for a
          charter (itinerary, catering, water toys) — a buyer isn't booking
          a day at sea, so this stays out of the sale yacht's page. */}
      {isCharter && (
        <YachtExperienceJourney
          onRequestExperience={() => setIsReservationOpen(true)}
          onWhatsApp={() => setIsAvailabilityOpen(true)}
          yachtName={yacht.model}
          place={yacht.city || yacht.region || 'the coast'}
          itineraries={itineraries}
        />
      )}

      {similarYachts.length > 0 && (
        <div style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(64px, 8vw, 120px)', borderTop: '1px solid rgba(184,151,74,0.12)' }}>
          <div style={{ paddingTop: 64, marginBottom: 40 }}>
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>Explore</div>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 300, color: '#f5eedd', margin: 0, marginBottom: 12 }}>Similar Yachts</h2>
            <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#8f8f7f', maxWidth: 560, margin: 0 }}>
              Comparable in size to {yacht.model}, these yachts may also suit your plans.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {similarYachts.map((sim) => (
              <Link key={sim.id} href={sim.href ?? yachtHref(sim)} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', background: '#1a1a1a' }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('img')
                    if (img) img.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('img')
                    if (img) img.style.transform = 'scale(1)'
                  }}
                >
                  {sim.media?.[0]?.url && (
                    <Image
                      src={`/uploads/yachts/${sim.media[0].url}`}
                      alt={sim.media[0].alt || sim.model}
                      fill
                      loading="lazy"
                      sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={75}
                      style={{ objectFit: 'cover', filter: 'brightness(0.75)', transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)' }}
                    />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.85) 0%, transparent 60%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2 }}>{sim.model}</div>
                    <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 4 }}>
                      {sim.length}{sim.lengthUnit || 'm'}{sim.builder ? ` · ${sim.builder}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 11, letterSpacing: '0.05em', color: '#8f8f7f' }}>
                    {sim.maxGuests && `${sim.maxGuests} guests`}{sim.cabins ? ` · ${sim.cabins} cabins` : ''}
                  </div>
                  <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#d4b472' }}>
                    {(sim.status || '').toLowerCase() === 'location'
                      ? (getCharterRateInfo(sim) ? `From ${formatCharterRate(sim)}` : 'Price on request')
                      : (sim.priceSale ? `€${sim.priceSale.toLocaleString('en-US')}` : 'Price on request')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other destinations — same internal-mesh links as the destination
          page this yacht belongs to (see lib/destinations.ts), so a search
          engine (and a browsing guest) can reach every sibling destination
          from here too, not just back the way they came. */}
      {relatedDestinations.length > 0 && (
        <div style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(64px, 8vw, 120px)', borderTop: '1px solid rgba(184,151,74,0.12)' }}>
          <div style={{ paddingTop: 64, marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>Explore More</div>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: 0 }}>Other Destinations</h2>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {relatedDestinations.map((rel) => (
              <Link
                key={rel.href}
                href={rel.href}
                style={{
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#b8974a',
                  border: '1px solid rgba(184,151,74,0.3)',
                  padding: '12px 22px',
                  textDecoration: 'none',
                }}
              >
                {rel.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />

      {isCharter && (
        <ReservationModal
          yachtId={yacht.id}
          yachtModel={yacht.model}
          isOpen={isReservationOpen}
          onClose={() => setIsReservationOpen(false)}
        />
      )}

      {isCharter && (
        <AvailabilityModal
          isOpen={isAvailabilityOpen}
          onClose={() => setIsAvailabilityOpen(false)}
          yacht={availabilityYacht}
        />
      )}

      {!isCharter && (
        <BrokerContactModal
          isOpen={isBrokerOpen}
          onClose={() => setIsBrokerOpen(false)}
          yacht={availabilityYacht}
        />
      )}
    </main>
  )
}

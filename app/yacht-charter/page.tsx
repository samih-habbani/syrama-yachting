// The /yacht-charter root — SEO pillar page for the whole charter section,
// AND the destination picker reached from the navbar (was /charters, which
// now permanently redirects here, see next.config.ts). Lives at the same
// prefix as every charter destination page (/yacht-charter/[region](/[city])),
// so both share one consistent namespace.
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DestinationCards from '@/components/DestinationCards'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.syrama-yachting.com'
const TITLE = 'Luxury Yacht Charter Worldwide'
const DESCRIPTION = 'Charter a private, crewed luxury yacht worldwide with Syrama Yachting. Motor yachts and superyachts, bespoke itineraries, French Riviera to the Caribbean.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Self-referencing canonical regardless of any ?region= etc. query string,
  // so a query-string variant of this URL is never treated by Google as a
  // separate page from the plain /yacht-charter URL.
  alternates: { canonical: '/yacht-charter' },
  // Without its own openGraph/twitter block, this page silently inherited
  // the root layout's (i.e. the homepage's) og:title/og:url/twitter:title —
  // wrong title and a link back to "/" on every share. Once a route defines
  // its own openGraph/twitter object, Next.js stops falling back to an
  // ancestor's for any field (images included) — the root's file-based
  // app/opengraph-image.tsx doesn't get pulled in automatically here the
  // way it does for a route with no openGraph of its own, so it's
  // re-declared explicitly below instead. There's no single destination
  // photo that would represent this picker page better than the generic
  // brand image.
  openGraph: {
    title: `${TITLE} | Syrama Yachting`,
    description: DESCRIPTION,
    url: `${SITE_URL}/yacht-charter`,
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Syrama Yachting — Luxury Yacht Charter & Sales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Syrama Yachting`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 3600

// Shared paragraph style for the editorial section below — matches the
// body-copy convention used across destination pages and yacht detail pages
// (YachtDetailClient.tsx, destination-page-shared.tsx): font-tenor, muted
// off-white, generous line-height. Kept narrow (not full-bleed) so it reads
// as a considered piece of writing rather than a marketing wall of text.
const paragraphStyle = { fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 2, color: '#8f8f7f', margin: '0 0 20px' } as const
const linkStyle = { color: '#b8974a', textDecoration: 'none', borderBottom: '1px solid rgba(184,151,74,0.35)' } as const

export default function YachtCharterLandingPage() {
  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 80 }}>
        <DestinationCards />

        {/* Editorial SEO section — deliberately placed after the
            destination selector and its own "can't find" CTA, never above
            them: the grid stays the page's primary, conversion-focused
            element, this is supporting context for the reader who scrolls
            further and for search engines indexing the page. */}
        <section
          aria-label="About luxury yacht charter with Syrama Yachting"
          style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(64px, 8vw, 120px)', borderTop: '1px solid rgba(184,151,74,0.12)' }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 72 }}>
            <div style={{ marginBottom: 56 }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: '0 0 20px' }}>
                Private Yacht Charters Tailored to You
              </h2>
              <p style={paragraphStyle}>
                Every charter with Syrama Yachting begins as a private conversation, not a search filter. We work
                exclusively with fully crewed motor yachts and superyachts, each one personally selected and matched
                to the way you actually want to spend your time on the water — a quiet weekend along a coastline, a
                week exploring several anchorages, or a single afternoon celebration.
              </p>
              <p style={paragraphStyle}>
                Your dedicated yacht advisor manages every detail: choosing the right vessel for your guest count
                and itinerary, coordinating with the captain and crew, and arranging provisioning, water toys or
                onboard catering ahead of time. Whether you charter for a few hours or several weeks, the experience
                is built around your preferences, not a fixed package.
              </p>
              <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                It&apos;s a private charter in the truest sense: no shared departures, no fixed route, and a crew
                whose only guests for the duration are you and the people you bring aboard.
              </p>
            </div>

            <div style={{ marginBottom: 56 }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: '0 0 20px' }}>
                Explore the World&apos;s Finest Yacht Charter Destinations
              </h2>
              <p style={paragraphStyle}>
                Syrama Yachting&apos;s charter fleet spans the world&apos;s most sought-after cruising grounds. Along
                the Mediterranean, charter a yacht on the <Link href="/yacht-charter/french-riviera" style={linkStyle}>French Riviera</Link>, around the calanques of{' '}
                <Link href="/yacht-charter/corsica" style={linkStyle}>Corsica</Link>, along the coast of{' '}
                <Link href="/yacht-charter/italy" style={linkStyle}>Italy</Link>, among the islands of{' '}
                <Link href="/yacht-charter/greece" style={linkStyle}>Greece</Link>, the coves of{' '}
                <Link href="/yacht-charter/sardinia" style={linkStyle}>Sardinia</Link>, and the{' '}
                <Link href="/yacht-charter/balearic-islands" style={linkStyle}>Balearic Islands</Link>.
              </p>
              <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                Further afield, charter a yacht across the turquoise waters of the{' '}
                <Link href="/yacht-charter/caribbean" style={linkStyle}>Caribbean</Link>, the atolls of the{' '}
                <Link href="/yacht-charter/maldives" style={linkStyle}>Maldives</Link>, the marina life of{' '}
                <Link href="/yacht-charter/miami" style={linkStyle}>Miami</Link>, or the skyline waters of the{' '}
                <Link href="/yacht-charter/emirates/dubai" style={linkStyle}>Emirates</Link> in Dubai. Each
                destination page details the anchorages, seasonality and yachts available in that region, so you
                can plan your itinerary with real local knowledge before you ever step aboard.
              </p>
              <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                The right yacht often depends on the destination as much as the guest list — a sleek day cruiser
                suits the coves of Sardinia, while a long-range superyacht is better matched to an extended
                itinerary across the Caribbean. Your advisor can talk you through what fits best before you commit
                to a region.
              </p>
            </div>

            <div style={{ marginBottom: 64 }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: '0 0 20px' }}>
                A Bespoke Yacht Charter Experience
              </h2>
              <p style={paragraphStyle}>
                Choosing a yacht is only the beginning. Once you&apos;ve found the right vessel, your advisor helps
                shape the itinerary itself — which anchorages suit your guests, how many days to spend in each, and
                where to arrange dinner ashore or a private mooring for the night. Onboard, the crew manages
                everything from watersports equipment to bespoke catering and special requests, so the only
                decision left to you is how you&apos;d like to spend the day.
              </p>
              <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                Before departure, we coordinate embarkation logistics, provisioning and any additional services you
                request — and remain reachable throughout the charter, in case your plans change once you&apos;re
                at sea. It&apos;s the same personal, considered approach across every destination we serve, whether
                it&apos;s your first charter or your fiftieth.
              </p>
            </div>

            {/* Discreet closing CTA — deliberately understated (a plain text
                link, not another gold button) since the destination grid
                above already carries the page's primary, high-visibility
                CTA. This is for a reader who scrolled all the way through
                the editorial content and is ready to talk specifics. */}
            <a
              href={`https://wa.me/971505548034?text=${encodeURIComponent("Hello Syrama Yachting! I'd like to speak with an advisor about a yacht charter.")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8f8f7f', textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              Have a destination or date in mind? Speak with a yacht advisor →
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

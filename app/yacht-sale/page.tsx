// The /yacht-sale root — SEO pillar page for the whole sale section, AND
// the destination picker reached from the navbar (was /sales, which now
// permanently redirects here, see next.config.ts). Lives at the same
// prefix as every sale destination page (/yacht-sale/[region](/[city])),
// so both share one consistent namespace.
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DestinationCards from '@/components/DestinationCards'
import Footer from '@/components/Footer'
import { getAllDestinations, destinationFullPath } from '@/lib/destinations'

const SITE_URL = 'https://www.syrama-yachting.com'
const TITLE = 'Luxury Yachts for Sale Worldwide'
const DESCRIPTION = 'Luxury yachts for sale worldwide with Syrama Yachting. A curated brokerage fleet of motor yachts and superyachts, with guidance from search to acquisition.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/yacht-sale' },
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
    url: `${SITE_URL}/yacht-sale`,
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

// Shared paragraph/link style for the editorial section below — matches the
// body-copy convention used across destination pages and yacht detail pages
// (YachtDetailClient.tsx, destination-page-shared.tsx): font-tenor, muted
// off-white, generous line-height. Kept narrow (not full-bleed) so it reads
// as a considered piece of writing rather than a marketing wall of text.
const paragraphStyle = { fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 2, color: '#8f8f7f', margin: '0 0 20px' } as const
const linkStyle = { color: '#b8974a', textDecoration: 'none', borderBottom: '1px solid rgba(184,151,74,0.35)' } as const

export default async function YachtSaleLandingPage() {
  // The tiles shown here are real inventory only — driven by whatever
  // sale-kind destinations actually exist (see lib/destinations.ts), not a
  // hardcoded region list like the charter page's. Today that's a single
  // French Riviera tile (all sale inventory is there); a second tile
  // appears automatically the moment another sale destination is added via
  // /admin/dashboard/destinations.
  const destinations = await getAllDestinations()
  const saleDestinations = destinations
    .filter((d) => d.kind === 'sale')
    .map((d) => ({
      name: d.name,
      sub: d.citySlug ? d.region : '',
      heroImage: d.heroImage,
      href: destinationFullPath(d),
    }))
  // Used by the editorial section's "by destination" paragraph below — a
  // real, existing destination (never a hardcoded name), so the link never
  // 404s. The prose itself is hand-written for today's single-region
  // reality (see the comment further down); if a second sale destination is
  // added, that paragraph's wording should be revisited by hand rather than
  // fully templated — a templated "X, Y and Z" list reads noticeably worse
  // than the current one-line version once there's more than one entry.
  const primarySaleDestination = saleDestinations[0]

  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 80 }}>
        <DestinationCards isSale saleDestinations={saleDestinations} />

        {/* Editorial SEO section — deliberately placed after the
            destination selector and its own "can't find" CTA, never above
            them: the grid stays the page's primary, conversion-focused
            element, this is supporting context for the reader who scrolls
            further and for search engines indexing the page. */}
        <section
          aria-label="About luxury yachts for sale with Syrama Yachting"
          style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(64px, 8vw, 120px)', borderTop: '1px solid rgba(184,151,74,0.12)' }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 72 }}>
            <div style={{ marginBottom: 56 }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: '0 0 20px' }}>
                Find the Right Yacht for Sale
              </h2>
              <p style={paragraphStyle}>
                Syrama Yachting&apos;s brokerage fleet spans motor yachts, luxury yachts and superyachts, from
                compact day boats to larger vessels built for long-range cruising. Every listing is selected for
                its condition, specification and value, so you&apos;re comparing genuinely comparable yachts rather
                than sifting through an open marketplace.
              </p>
              <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                Tell us what you&apos;re looking for — length, layout, budget or intended use — and we narrow the
                search to the yachts that actually fit, rather than sending every listing that matches a keyword.
                If nothing currently in our fleet is right for you, our brokers can also help source a suitable
                yacht through our wider network.
              </p>
            </div>

            <div style={{ marginBottom: 56 }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: '0 0 20px' }}>
                Explore Yachts for Sale by Destination
              </h2>
              <p style={paragraphStyle}>
                {primarySaleDestination ? (
                  <>
                    Our current inventory of yachts for sale is concentrated on the{' '}
                    <Link href={primarySaleDestination.href} style={linkStyle}>{primarySaleDestination.name}</Link>,
                    one of the world&apos;s most active markets for both new listings and private sales. Browse the
                    full range of motor yachts and luxury yachts currently available there, with details on
                    specification, condition and asking price for each vessel.
                  </>
                ) : (
                  'Our current inventory of yachts for sale is detailed on the region pages linked above, with specification, condition and asking price for each vessel.'
                )}
              </p>
              <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                As our portfolio grows, further regions will appear here. In the meantime, you can also browse{' '}
                <Link href="/yacht-sale/all-yachts" style={linkStyle}>our full fleet of yachts for sale</Link>{' '}
                across every price point and size.
              </p>
            </div>

            <div style={{ marginBottom: 64 }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: '0 0 20px' }}>
                A Personal Approach to Yacht Acquisition
              </h2>
              <p style={paragraphStyle}>
                Buying a yacht is a considered decision, and we treat it that way. Once you&apos;ve identified a
                yacht of interest, your broker arranges viewings, answers technical questions about the vessel&apos;s
                specification and history, and helps you compare it fairly against similar boats on the market.
              </p>
              <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                From there, we support you through the practical steps of the process — coordinating with the
                seller, keeping you informed at every stage, and staying reachable for questions as they come up —
                so you can make your decision with confidence, without having to manage the process alone.
              </p>
            </div>

            {/* Discreet closing CTA — deliberately understated (a plain text
                link, not another gold button) since the destination grid
                above already carries the page's primary, high-visibility
                CTA. This is for a reader who scrolled all the way through
                the editorial content and is ready to talk specifics. */}
            <a
              href={`https://wa.me/971505548034?text=${encodeURIComponent("Hello Syrama Yachting! I'd like to speak with a broker about a yacht I'm considering buying.")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8f8f7f', textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              Have a yacht or budget in mind? Speak with a broker →
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

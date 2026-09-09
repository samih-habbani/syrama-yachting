// Shared implementation behind every destination route — both
// /yacht-charter/[region](/[city]) and /yacht-sale/[region](/[city]) —
// not a route itself, just the logic each thin page.tsx file calls into so
// a region-only page and a city page (and the charter/sale kinds) never
// drift apart by accident (same pattern as
// app/yachting/fleet/yacht-detail-shared.tsx).
//
// This is intentionally NOT a separate, custom-built page: it renders the
// exact same Navbar / Fleet (filters, yacht cards, pagination) as
// /yachting/fleet, with destination-specific SEO copy (unique H1, intro,
// "Available Now" heading) injected into Fleet's own header via the `seo`
// prop, and the Destination/City filter pre-set to this page's region — so
// it's the same fleet browsing experience, scoped and introduced by real
// content, not a redesign. A FAQ section (with FAQPage JSON-LD) follows
// the fleet grid. Adding a new destination later — charter or sale — is a
// database edit (via /admin/dashboard/destinations, see
// lib/destinations.ts), not a code change; nothing here is
// destination-specific. The Charter/Sale toggle Fleet normally shows is
// hidden on every destination page (see components/Fleet.tsx): a
// destination's title/H1/intro/FAQ are tied to one specific kind, so
// there's no matching page for the toggle to switch to.
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Contact from '@/components/Contact'
import FleetWrapper from '@/components/FleetWrapper'
import FaqAccordion from '@/components/FaqAccordion'
import { breadcrumbJsonLd } from '@/lib/breadcrumb'
import { getYachts } from '@/lib/yacht-service'
import {
  type Destination,
  destinationFullPath,
  getRegionOverviewDestination,
  getRelatedDestinations,
  getDestinationLinks,
} from '@/lib/destinations'

const SITE_URL = 'https://www.syrama-yachting.com'

export function generateDestinationMetadata(destination: Destination): Metadata {
  const canonicalPath = destinationFullPath(destination)
  const imageUrl = `${SITE_URL}${destination.heroImage}`

  return {
    // `absolute` bypasses the root layout's `%s | Syrama Yachting` title
    // template — destination.title already includes the full desired title.
    title: { absolute: destination.title },
    description: destination.metaDescription,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: destination.title,
      description: destination.metaDescription,
      url: `${SITE_URL}${canonicalPath}`,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: destination.title,
      description: destination.metaDescription,
      images: [imageUrl],
    },
  }
}

export async function DestinationPageContent({ destination }: { destination: Destination }) {
  const isSale = destination.kind === 'sale'

  // Scoped to this destination's own kind — the Charter/Sale toggle is
  // hidden on every destination page (see components/Fleet.tsx), so the
  // other kind's yachts would never be shown here anyway; no reason to
  // fetch them.
  const initialYachts = await getYachts({ type: isSale ? 'sale' : 'charter', limit: 500 })
  const destinationLinks = await getDestinationLinks()

  // A city page's region segment only links to a region-overview page when
  // one actually exists (e.g. French Riviera does, Emirates doesn't — only
  // its Dubai city page) — otherwise that breadcrumb level is skipped
  // rather than linking to a page that would 404.
  const regionOverview = destination.citySlug ? await getRegionOverviewDestination(destination.regionSlug, destination.kind) : undefined
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: isSale ? 'Yachts For Sale' : 'Yacht Charter', href: isSale ? '/yacht-sale' : '/yacht-charter' },
    ...(destination.citySlug
      ? [{ label: destination.eyebrow, ...(regionOverview ? { href: destinationFullPath(regionOverview) } : {}) }]
      : []),
    { label: destination.name },
  ]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: destination.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  // "Other Destinations" always includes every other page covering the same
  // region and kind first (e.g. Cannes → Saint-Tropez, Monaco, French
  // Riviera — every one of them, not a hand-picked subset), then the
  // hand-curated cross-region suggestions from destination.related (e.g.
  // Corsica from the French Riviera page), deduped — see
  // lib/destinations.ts. New destinations added there are picked up
  // automatically.
  const relatedDestinations = await getRelatedDestinations(destination)

  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }} />
      {destination.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <Navbar />

      <main id="main-content" className="flex-1 pt-20">
        <FleetWrapper
          initialYachts={initialYachts}
          initialRegion={destination.region}
          initialCity={destination.city}
          breadcrumbItems={breadcrumbItems}
          defaultTab={isSale ? 'sale' : 'charter'}
          seo={{
            eyebrow: destination.eyebrow,
            h1: destination.h1,
            intro: destination.intro,
            name: destination.name,
            heroImage: destination.heroImage,
          }}
          destinationLinks={destinationLinks}
        />

        {/* FAQ — guarded against an empty list (the admin form allows saving
            with the FAQ section cleared out) so an empty section never
            renders and the FAQPage JSON-LD above is never emitted with a
            blank mainEntity. */}
        {destination.faq.length > 0 && (
          <div style={{ padding: '0 clamp(24px, 6vw, 96px) 80px', maxWidth: 1100 }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>FAQ</div>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 300, color: '#f5eedd', margin: 0 }}>
                {isSale ? `Buying a Yacht in ${destination.name}` : `Chartering a Yacht in ${destination.name}`}
              </h2>
            </div>
            <FaqAccordion items={destination.faq} />
          </div>
        )}

        {/* Related destinations — internal mesh (point 9 of the SEO brief). */}
        {relatedDestinations.length > 0 && (
          <div style={{ padding: '0 clamp(24px, 6vw, 96px) 80px', borderTop: '1px solid rgba(184,151,74,0.12)' }}>
            <div style={{ paddingTop: 64, marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>Explore More</div>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: 0 }}>Other Destinations</h2>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {relatedDestinations.map((rel) => (
                <Link
                  key={destinationFullPath(rel)}
                  href={destinationFullPath(rel)}
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

        <Contact />
      </main>

      <Footer />
    </div>
  )
}

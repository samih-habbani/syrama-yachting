// Blog category hub pages. Deliberately NOT a generic archive for every
// category — only the slugs configured in HUBS below resolve; anything
// else 404s, so there are never thin "just a list" archive pages competing
// for crawl budget. Today the only hub is the Dubai yacht charter cluster,
// which earns its place: unique metadata, real editorial introduction,
// curated internal links, and a clear path to the /yacht-charter/emirates/dubai
// money page. Add another entry here only when that category has enough
// genuinely useful articles to make a hub worthwhile.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs'
import BlogCard from '@/components/blog/BlogCard'
import { breadcrumbJsonLd } from '@/lib/breadcrumb'
import { getPostsByCategory } from '@/lib/blog'

const SITE_URL = 'https://www.syrama-yachting.com'

interface Hub {
  slug: string
  category: string
  eyebrow: string
  h1: string
  title: string
  description: string
  intro: string[]
  // The money page this hub funnels toward, and the anchor for the link.
  moneyPage: { href: string; label: string; blurb: string }
}

const HUBS: Hub[] = [
  {
    slug: 'dubai-yacht-charter',
    category: 'Dubai Yacht Charter',
    eyebrow: 'Dubai Yacht Charter',
    h1: 'Dubai Yacht Charter Guides',
    title: 'Dubai Yacht Charter Guides & Advice',
    description: 'Practical guides to chartering a yacht in Dubai — what it costs, how long to book, the best routes, yacht sizes, sunset timing and what to expect on board.',
    intro: [
      'Chartering a yacht in Dubai is straightforward once you know how the market works — but most of the questions people have come up before they book, not after. How much does an afternoon on the water actually cost? Is two hours enough to see the Marina, the Palm and the Burj Al Arab? What is included, and what is charged on top?',
      'These guides answer the questions we are asked most, written by the team that arranges the charters rather than lifted from a tourism brochure. Prices are given as realistic ranges, not fixed quotes, because the number always depends on the yacht, the date, the season, the duration and the route.',
      'When you are ready to move from reading to planning, everything here points back to one place.',
    ],
    moneyPage: {
      href: '/yacht-charter/emirates/dubai',
      label: 'Explore luxury yacht charter in Dubai',
      blurb: 'Browse the yachts available for charter in Dubai and speak to an advisor about your dates, group size and the occasion.',
    },
  },
]

export function generateStaticParams() {
  return HUBS.map((h) => ({ category: h.slug }))
}

function getHub(slug: string): Hub | undefined {
  return HUBS.find((h) => h.slug === slug)
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const hub = getHub(category)
  if (!hub) return { title: 'Not Found' }
  const canonical = `/blog/category/${hub.slug}`
  return {
    title: hub.title,
    description: hub.description,
    alternates: { canonical },
    openGraph: {
      title: `${hub.title} | Syrama Yachting`,
      description: hub.description,
      url: `${SITE_URL}${canonical}`,
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Syrama Yachting — Luxury Yacht Charter & Sales' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${hub.title} | Syrama Yachting`,
      description: hub.description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

export const revalidate = 300

export default async function BlogCategoryHubPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const hub = getHub(category)
  if (!hub) notFound()

  const posts = await getPostsByCategory(hub.category)

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Journal', href: '/blog' },
    { label: hub.h1 },
  ]

  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }} />

      <Navbar />

      <div style={{ flex: 1, padding: '120px clamp(24px, 6vw, 96px) 100px' }}>
        <div style={{ marginBottom: 20 }}>
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div style={{ maxWidth: 760, marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>
              {hub.eyebrow}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(30px, 5vw, 56px)', lineHeight: 1.05, color: '#f5eedd', margin: '0 0 24px' }}>
            {hub.h1}
          </h1>
          {hub.intro.map((p, i) => (
            <p key={i} style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 1.9, color: '#8f8f7f', margin: '0 0 16px' }}>
              {p}
            </p>
          ))}
          <Link
            href={hub.moneyPage.href}
            style={{
              display: 'inline-block',
              marginTop: 12,
              fontFamily: 'var(--font-tenor)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#b8974a',
              border: '1px solid rgba(184,151,74,0.3)',
              padding: '13px 22px',
              textDecoration: 'none',
            }}
          >
            {hub.moneyPage.label} &rarr;
          </Link>
        </div>

        {posts.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#8f8f7f' }}>Guides are on their way.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post, i) => (
              <BlogCard key={post.slug} post={post} priority={i < 3} />
            ))}
          </div>
        )}

        {/* Closing funnel back to the money page. */}
        <div style={{ maxWidth: 760, marginTop: 72, paddingTop: 40, borderTop: '1px solid rgba(184,151,74,0.12)' }}>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, lineHeight: 1.9, color: '#8f8f7f', margin: '0 0 16px' }}>
            {hub.moneyPage.blurb}
          </p>
          <Link
            href={hub.moneyPage.href}
            style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b8974a', textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            {hub.moneyPage.label} &rarr;
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}

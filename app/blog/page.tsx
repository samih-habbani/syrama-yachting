// The /blog index — the SEO hub for Syrama Yachting's cluster content
// (long-form articles that link up to the /yacht-charter and /yacht-sale
// pillar pages). Fully static, revalidated periodically so a newly
// published post appears without a redeploy. No pagination yet: with the
// current article count a single grid is fine — add /blog/page/[n] (a
// crawlable path, not a ?page= query) if the list grows past ~20.
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogCard from '@/components/blog/BlogCard'
import { getPublishedPosts } from '@/lib/blog'

const SITE_URL = 'https://www.syrama-yachting.com'
const TITLE = 'The Syrama Yachting Journal'
const DESCRIPTION = 'Guides and insight on luxury yacht charter and yacht ownership — destinations, costs, crewed charter and buying advice from the Syrama Yachting team.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: `${TITLE} | Syrama Yachting`,
    description: DESCRIPTION,
    url: `${SITE_URL}/blog`,
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Syrama Yachting — Luxury Yacht Charter & Sales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | Syrama Yachting`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 300

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts()

  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '120px clamp(24px, 6vw, 96px) 100px' }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#b8974a' }} />
            <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>
              Journal
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(30px, 5vw, 58px)', lineHeight: 1.05, color: '#f5eedd', margin: '0 0 20px' }}>
            The Syrama Yachting Journal
          </h1>
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#8f8f7f', margin: 0, maxWidth: 620 }}>
            Practical guides on chartering and buying a luxury yacht — where to cruise, what it costs, and what to expect on board — written by the team that arranges it.
          </p>
        </div>

        {posts.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#8f8f7f' }}>Articles are on their way.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post, i) => (
              <BlogCard key={post.slug} post={post} priority={i < 3} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

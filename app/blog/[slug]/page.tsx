// One blog article — /blog/[slug]. Same SSG + ISR pattern as the
// destination pages: generateStaticParams prerenders every published post,
// dynamicParams stays true so a post published after the last build still
// renders on first request, revalidate refreshes edited content.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs'
import BlogContent from '@/components/blog/BlogContent'
import BlogCard from '@/components/blog/BlogCard'
import { breadcrumbJsonLd } from '@/lib/breadcrumb'
import { getPostBySlug, getRelatedPosts, getAllPublishedSlugs } from '@/lib/blog'

const SITE_URL = 'https://www.syrama-yachting.com'
const AUTHOR = 'Sam Habbani'

export const revalidate = 300

export async function generateStaticParams() {
  return (await getAllPublishedSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Article Not Found' }

  const title = post.metaTitle || post.title
  const canonical = `/blog/${post.slug}`
  const image = `${SITE_URL}${post.coverImage}`

  return {
    title,
    description: post.metaDescription,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: `${title} | Syrama Yachting`,
      description: post.metaDescription,
      url: `${SITE_URL}${canonical}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [AUTHOR],
      images: [{ url: image, width: 1200, height: 630, alt: post.coverImageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Syrama Yachting`,
      description: post.metaDescription,
      images: [image],
    },
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post)

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Journal', href: '/blog' },
    { label: post.title },
  ]

  const publishedIso = post.publishedAt?.toISOString()
  const publishedLabel = post.publishedAt
    ? post.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    image: `${SITE_URL}${post.coverImage}`,
    datePublished: publishedIso,
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Person', name: AUTHOR, url: `${SITE_URL}/about` },
    publisher: {
      '@type': 'Organization',
      name: 'Syrama Yachting',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    keywords: post.tags.join(', ') || undefined,
    articleSection: post.category,
  }

  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }} />

      <Navbar />

      {/* Hero */}
      <header style={{ position: 'relative' }}>
        <div className="h-[52vh] md:h-[62vh]" style={{ position: 'relative', overflow: 'hidden', marginTop: 64, background: '#1a1a1a' }}>
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            fill
            priority
            sizes="100vw"
            quality={82}
            style={{ objectFit: 'cover', filter: 'brightness(0.55)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,9,15,0.35) 0%, rgba(6,9,15,0.9) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 36, left: 'clamp(24px, 6vw, 96px)', right: 'clamp(24px, 6vw, 96px)', maxWidth: 900 }}>
            <div style={{ marginBottom: 18 }}>
              <Breadcrumbs items={breadcrumbItems} overlay />
            </div>
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#d4b472', marginBottom: 14 }}>
              {post.category}
            </div>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(30px, 4.6vw, 58px)', fontWeight: 300, color: '#f5eedd', lineHeight: 1.12, margin: 0 }}>
              {post.title}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 20, fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.7)' }}>
              <span>{AUTHOR}</span>
              {publishedLabel && <><span style={{ color: 'rgba(184,151,74,0.5)' }}>/</span><span>{publishedLabel}</span></>}
              <span style={{ color: 'rgba(184,151,74,0.5)' }}>/</span>
              <span>{post.readingMinutes} min read</span>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <article style={{ flex: 1, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 96px)' }}>
        <p style={{ maxWidth: 720, margin: '0 auto 40px', fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(18px, 2.2vw, 22px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.6, color: '#d8d8cc' }}>
          {post.excerpt}
        </p>

        <BlogContent blocks={post.content} />

        {/* Author byline — a real person (E-E-A-T), reusing the founder
            photo already on the site's Contact section. */}
        <div style={{ maxWidth: 720, margin: '56px auto 0', paddingTop: 32, borderTop: '1px solid rgba(184,151,74,0.15)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(184,151,74,0.3)' }}>
            <Image src="/assets/founder.webp" alt={`${AUTHOR}, Founder of Syrama Yachting`} fill sizes="52px" quality={82} style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 17, color: '#f5eedd' }}>{AUTHOR}</div>
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8f8f7f', marginTop: 3 }}>
              Founder &amp; CEO, <Link href="/about" style={{ color: '#b8974a', textDecoration: 'none' }}>Syrama Yachting</Link>
            </div>
          </div>
        </div>

        {/* Discreet closing CTA — same understated text-link pattern used on
            the /yacht-charter and /yacht-sale editorial sections. */}
        <div style={{ maxWidth: 720, margin: '40px auto 0' }}>
          <a
            href={`https://wa.me/971505548034?text=${encodeURIComponent("Hello Syrama Yachting! I read one of your articles and would like to discuss a yacht charter or purchase.")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8f8f7f', textDecoration: 'underline', textUnderlineOffset: 4 }}
          >
            Planning a charter or a purchase? Speak with the Syrama Yachting team →
          </a>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(64px, 8vw, 110px)', borderTop: '1px solid rgba(184,151,74,0.12)' }}>
          <div style={{ paddingTop: 64, marginBottom: 36 }}>
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>Keep Reading</div>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, color: '#f5eedd', margin: 0 }}>Related Articles</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {related.map((r) => (
              <BlogCard key={r.slug} post={r} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

'use client'
// One article tile on the /blog index — same visual grammar as the
// destination tiles in components/DestinationCards.tsx (cover image, bottom
// gradient, title over it, small meta line) so the blog reads as part of
// the same site, not a bolted-on section. Client component only for the
// hover image-scale, matching how DestinationCards does it.
import Image from 'next/image'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'

export default function BlogCard({ post, priority = false }: { post: BlogPost; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{ position: 'relative', height: 'clamp(240px, 30vw, 300px)', overflow: 'hidden', cursor: 'pointer' }}
        onMouseEnter={(e) => {
          const img = e.currentTarget.querySelector('img')
          if (img) img.style.transform = 'scale(1.06)'
        }}
        onMouseLeave={(e) => {
          const img = e.currentTarget.querySelector('img')
          if (img) img.style.transform = 'scale(1)'
        }}
      >
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={75}
          style={{ objectFit: 'cover', filter: 'brightness(0.62)', transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.92) 0%, rgba(6,9,15,0.35) 55%, transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 22px' }}>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 10 }}>
            {post.category}
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontWeight: 300, color: '#f5eedd', lineHeight: 1.25, marginBottom: 12 }}>
            {post.title}
          </div>
          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9a8e' }}>
            {post.readingMinutes} min read
          </div>
        </div>
      </div>
    </Link>
  )
}

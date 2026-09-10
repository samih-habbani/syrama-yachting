'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import BlogPostForm, { type BlogPostRecord } from '@/components/admin/BlogPostForm'

export default function BlogEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [post, setPost] = useState<BlogPostRecord | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/admin/blog/${params.id}`)
        if (!res.ok) { if (!cancelled) setNotFound(true); return }
        const detail = await res.json()
        if (!cancelled) setPost(detail)
      } catch (err) {
        console.error('Load post error:', err)
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id, isNew])

  return (
    <div>
      <PageHeader
        title={isNew ? 'New Article' : post?.title || 'Edit Article'}
        breadcrumbs={[
          { label: 'Overview', href: '/admin/dashboard' },
          { label: 'Blog', href: '/admin/dashboard/blog' },
          { label: isNew ? 'New' : (post?.title || '…') },
        ]}
      />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading…</div>
        </Card>
      ) : notFound ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Article not found.</div>
        </Card>
      ) : (
        <BlogPostForm post={post} onCancel={() => router.push('/admin/dashboard/blog')} />
      )}
    </div>
  )
}

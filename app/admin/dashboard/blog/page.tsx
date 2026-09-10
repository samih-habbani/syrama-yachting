'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Newspaper, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import EmptyState from '@/components/admin/ui/EmptyState'
import ActionsMenu from '@/components/admin/ui/ActionsMenu'

interface PostRow {
  id: number
  slug: string
  title: string
  category: string
  status: string
  publishedAt: string | null
  readingMinutes: number
  updatedAt: string
}

export default function BlogAdminPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<PostRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/blog')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch (err) {
      console.error('Fetch posts error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const handleDelete = async (p: PostRow) => {
    if (!confirm(`Delete "${p.title}"? /blog/${p.slug} will stop resolving.`)) return
    setDeletingId(p.id)
    try {
      const res = await fetch(`/api/admin/blog/${p.id}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts((prev) => prev.filter((x) => x.id !== p.id))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to delete post')
      }
    } catch (err) {
      console.error('Delete post error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const published = posts.filter((p) => p.status === 'published')
  const drafts = posts.filter((p) => p.status !== 'published')

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Every /blog article — headline, SEO fields, cover image and body all live here, published without a code change."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Blog' }]}
        action={
          <Button variant="primary" onClick={() => router.push('/admin/dashboard/blog/new')}>
            <Plus size={14} strokeWidth={2} />
            New Article
          </Button>
        }
      />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading articles…</div>
        </Card>
      ) : posts.length === 0 ? (
        <Card><EmptyState icon={Newspaper} title="No articles yet" description="Write the first one to launch the blog." /></Card>
      ) : (
        <>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 12 }}>
            Published ({published.length})
          </div>
          {published.length > 0 ? (
            <PostTable rows={published} deletingId={deletingId} onEdit={(id) => router.push(`/admin/dashboard/blog/${id}`)} onDelete={handleDelete} />
          ) : (
            <Card><EmptyState icon={Newspaper} title="Nothing published yet" description="Set an article's status to Published to make it live." /></Card>
          )}

          {drafts.length > 0 && (
            <>
              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f', margin: '28px 0 12px' }}>
                Drafts ({drafts.length})
              </div>
              <PostTable rows={drafts} deletingId={deletingId} onEdit={(id) => router.push(`/admin/dashboard/blog/${id}`)} onDelete={handleDelete} />
            </>
          )}
        </>
      )}
    </div>
  )
}

function PostTable({ rows, deletingId, onEdit, onDelete }: {
  rows: PostRow[]
  deletingId: number | null
  onEdit: (id: number) => void
  onDelete: (p: PostRow) => void
}) {
  return (
    <Card style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 0.8fr 90px', gap: 16, alignItems: 'center',
          padding: '14px 24px', borderBottom: '1px solid rgba(184,151,74,0.12)',
          fontFamily: 'var(--font-lora)', fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f',
        }}
      >
        <div>Article</div>
        <div>Category</div>
        <div>Published</div>
        <div>Read</div>
        <div />
      </div>

      {rows.map((p, i) => (
        <div
          key={p.id}
          style={{
            display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 0.8fr 90px', gap: 16, alignItems: 'center',
            padding: '14px 24px',
            borderBottom: i < rows.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(184,151,74,0.08)', border: '1px solid rgba(184,151,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Newspaper size={14} color="#d4b472" strokeWidth={1.75} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#f5eedd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.title}
              </div>
              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, color: '#6b6b60', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                /blog/{p.slug}
              </div>
            </div>
          </div>
          <div>
            <Badge tone="neutral">{p.category}</Badge>
          </div>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: p.publishedAt ? '#d8d8cc' : '#5a5a52' }}>
            {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}
          </div>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#8f8f7f' }}>{p.readingMinutes} min</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ActionsMenu
              items={[
                { label: 'Edit', icon: <Pencil size={13} strokeWidth={2} />, onClick: () => onEdit(p.id) },
                { label: 'View live page', icon: <ExternalLink size={13} strokeWidth={2} />, onClick: () => window.open(`/blog/${p.slug}`, '_blank') },
                { label: deletingId === p.id ? 'Deleting…' : 'Delete', icon: <Trash2 size={13} strokeWidth={2} />, tone: 'danger', onClick: () => onDelete(p) },
              ]}
            />
          </div>
        </div>
      ))}
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import { FilterField, TextField, SelectField } from './ui/FilterBar'
import { BLOG_CATEGORIES, type BlogBlock } from '@/lib/blog'

export interface BlogPostRecord {
  id?: number
  slug: string
  title: string
  metaTitle: string | null
  metaDescription: string
  excerpt: string
  content: BlogBlock[]
  coverImage: string
  coverImageAlt: string
  category: string
  tags: string[]
  status: string
}

type BlockType = BlogBlock['type']

// The form edits blocks in a flat, string-only shape (a list's items are
// one-per-line in `text`; a quote's attribution is its own field) and
// converts back to BlogBlock[] on submit.
interface EditorBlock {
  type: BlockType
  text: string
  attribution: string
}

const BLOCK_LABELS: Record<BlockType, string> = {
  heading: 'Heading (H2)',
  paragraph: 'Paragraph',
  list: 'List (one item per line)',
  quote: 'Pull quote',
}

function toEditorBlocks(blocks: BlogBlock[]): EditorBlock[] {
  if (!blocks.length) return [{ type: 'paragraph', text: '', attribution: '' }]
  return blocks.map((b) => {
    if (b.type === 'list') return { type: 'list', text: b.items.join('\n'), attribution: '' }
    if (b.type === 'quote') return { type: 'quote', text: b.text, attribution: b.attribution ?? '' }
    return { type: b.type, text: b.text, attribution: '' }
  })
}

function toBlogBlocks(blocks: EditorBlock[]): BlogBlock[] {
  return blocks
    .map((b): BlogBlock | null => {
      if (b.type === 'list') {
        const items = b.text.split('\n').map((s) => s.trim()).filter(Boolean)
        return items.length ? { type: 'list', items } : null
      }
      const text = b.text.trim()
      if (!text) return null
      if (b.type === 'quote') return { type: 'quote', text, ...(b.attribution.trim() ? { attribution: b.attribution.trim() } : {}) }
      return { type: b.type, text }
    })
    .filter((b): b is BlogBlock => b !== null)
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(184,151,74,0.1)' }}>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f' }}>
          {title}
        </div>
        {description && <div style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: '#5a5a52', marginTop: 4 }}>{description}</div>}
      </div>
      {children}
    </div>
  )
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-lora)',
  fontSize: 13,
  color: '#f5eedd',
  background: 'rgba(6,9,15,0.5)',
  border: '1px solid rgba(184,151,74,0.2)',
  borderRadius: 7,
  padding: '10px 14px',
  outline: 'none',
  resize: 'vertical',
  minHeight: 70,
}

function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr]
  const target = index + dir
  if (target < 0 || target >= next.length) return arr
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

function IconButton({ onClick, disabled, title, tone = 'default', children }: {
  onClick: () => void
  disabled?: boolean
  title: string
  tone?: 'default' | 'danger'
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 6,
        background: 'transparent', border: '1px solid rgba(184,151,74,0.2)',
        color: tone === 'danger' ? '#e08080' : '#8f8f7f',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function BlogPostForm({ post, onCancel }: { post?: BlogPostRecord | null; onCancel: () => void }) {
  const router = useRouter()
  const isEditing = Boolean(post?.id)

  const [formData, setFormData] = useState({
    slug: post?.slug || '',
    title: post?.title || '',
    metaTitle: post?.metaTitle || '',
    metaDescription: post?.metaDescription || '',
    excerpt: post?.excerpt || '',
    coverImage: post?.coverImage || '',
    coverImageAlt: post?.coverImageAlt || '',
    category: post?.category || BLOG_CATEGORIES[0],
    tags: (post?.tags || []).join(', '),
    status: post?.status || 'draft',
  })
  const [blocks, setBlocks] = useState<EditorBlock[]>(toEditorBlocks(post?.content || []))
  const [slugTouched, setSlugTouched] = useState(isEditing)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (patch: Partial<typeof formData>) => setFormData((prev) => ({ ...prev, ...patch }))
  const updateBlock = (i: number, patch: Partial<EditorBlock>) =>
    setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))

  const handleTitleChange = (value: string) => {
    update({ title: value, ...(slugTouched ? {} : { slug: slugify(value) }) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const content = toBlogBlocks(blocks)
    if (content.length === 0) { setError('Add at least one content block with text'); return }

    const payload = {
      slug: formData.slug.trim().toLowerCase(),
      title: formData.title.trim(),
      metaTitle: formData.metaTitle.trim() || null,
      metaDescription: formData.metaDescription.trim(),
      excerpt: formData.excerpt.trim(),
      coverImage: formData.coverImage.trim(),
      coverImageAlt: formData.coverImageAlt.trim(),
      category: formData.category,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: formData.status,
      content,
    }

    setIsLoading(true)
    try {
      const url = isEditing ? `/api/admin/blog/${post!.id}` : '/api/admin/blog'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to save post')
        return
      }
      router.push('/admin/dashboard/blog')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const metaLen = formData.metaDescription.length
  const titleLen = (formData.metaTitle || formData.title).length

  return (
    <Card style={{ maxWidth: 900, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>
        {isEditing ? `Edit "${post?.title}"` : 'New Article'}
      </h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
        Publishing makes this live at <code style={{ color: '#d4b472' }}>/blog/{formData.slug || 'your-slug'}</code>. Drafts stay hidden.
      </p>

      {error && (
        <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '12px 16px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="Article">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <FilterField label="Headline (the on-page H1)">
              <TextField required value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Yacht Charter in Greece: Cyclades and Beyond" />
            </FilterField>
            <FilterField label="URL Slug">
              <TextField required value={formData.slug} onChange={(e) => { setSlugTouched(true); update({ slug: e.target.value.trim().toLowerCase() }) }} placeholder="yacht-charter-greece" />
            </FilterField>
            <FilterField label="Category">
              <SelectField value={formData.category} onChange={(v) => update({ category: v })}>
                {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </SelectField>
            </FilterField>
            <FilterField label="Status">
              <SelectField value={formData.status} onChange={(v) => update({ status: v })}>
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </SelectField>
            </FilterField>
            <FilterField label="Tags (comma-separated)">
              <TextField value={formData.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="Greece, Charter Guides, Cyclades" />
            </FilterField>
          </div>
          <div style={{ marginTop: 20 }}>
            <FilterField label="Excerpt (shown on the index card + as the intro line on the article)">
              <textarea style={{ ...textareaStyle, minHeight: 56 }} required value={formData.excerpt} onChange={(e) => update({ excerpt: e.target.value })} />
            </FilterField>
          </div>
        </Section>

        <Section title="SEO & Cover">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <FilterField label={`SERP title override (optional) — ${titleLen} chars`}>
              <TextField value={formData.metaTitle} onChange={(e) => update({ metaTitle: e.target.value })} placeholder="Leave blank to use the headline" />
            </FilterField>
            <FilterField label="Cover Image Path">
              <TextField required value={formData.coverImage} onChange={(e) => update({ coverImage: e.target.value })} placeholder="/images/regions/Greece.webp" />
            </FilterField>
            <FilterField label="Cover Image Alt Text">
              <TextField required value={formData.coverImageAlt} onChange={(e) => update({ coverImageAlt: e.target.value })} placeholder="A yacht anchored off a Greek island" />
            </FilterField>
          </div>
          <div style={{ marginTop: 20 }}>
            <FilterField label={`Meta Description — ${metaLen} chars (aim 150–160)`}>
              <textarea style={{ ...textareaStyle, minHeight: 56 }} required value={formData.metaDescription} onChange={(e) => update({ metaDescription: e.target.value })} />
            </FilterField>
          </div>
        </Section>

        <Section title="Content" description="Blocks render in order. Paragraphs and list items support [label](/internal-path) links and **bold**.">
          {blocks.map((block, i) => (
            <div key={i} style={{ border: '1px solid rgba(184,151,74,0.15)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SelectField value={block.type} onChange={(v) => updateBlock(i, { type: v as BlockType })}>
                    {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => <option key={t} value={t}>{BLOCK_LABELS[t]}</option>)}
                  </SelectField>
                  <textarea
                    style={{ ...textareaStyle, minHeight: block.type === 'heading' ? 44 : 80 }}
                    value={block.text}
                    onChange={(e) => updateBlock(i, { text: e.target.value })}
                    placeholder={block.type === 'list' ? 'One item per line' : block.type === 'heading' ? 'Section heading' : 'Text…'}
                  />
                  {block.type === 'quote' && (
                    <TextField
                      value={block.attribution}
                      onChange={(e) => updateBlock(i, { attribution: e.target.value })}
                      placeholder="Attribution (optional)"
                    />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <IconButton title="Move up" disabled={i === 0} onClick={() => setBlocks(move(blocks, i, -1))}><ChevronUp size={13} /></IconButton>
                  <IconButton title="Move down" disabled={i === blocks.length - 1} onClick={() => setBlocks(move(blocks, i, 1))}><ChevronDown size={13} /></IconButton>
                  <IconButton title="Remove" tone="danger" disabled={blocks.length === 1} onClick={() => setBlocks(blocks.filter((_, idx) => idx !== i))}><Trash2 size={13} /></IconButton>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setBlocks([...blocks, { type: 'paragraph', text: '', attribution: '' }])}>
            <Plus size={13} strokeWidth={2} />
            Add Block
          </Button>
        </Section>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" disabled={isLoading}>
            <Save size={14} strokeWidth={2} />
            {isLoading ? 'Saving…' : 'Save Article'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            <X size={14} strokeWidth={2} />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

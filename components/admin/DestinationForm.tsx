'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import { FilterField, TextField, SelectField } from './ui/FilterBar'
import MultiSelectField from './ui/MultiSelectField'

export interface DestinationFaqItem { question: string; answer: string }
export interface DestinationItineraryItem { name: string; description: string }

export interface DestinationRecord {
  id?: number
  kind: 'charter' | 'sale'
  regionSlug: string
  citySlug: string | null
  name: string
  region: string
  city: string | null
  title: string
  metaDescription: string
  h1: string
  heroImage: string
  eyebrow: string
  intro: string[]
  relatedKeys: string[]
  faqItems: DestinationFaqItem[]
  itineraries: DestinationItineraryItem[]
}

// `kind` lets the form only offer same-kind destinations as related links
// (a charter destination should never cross-link a sale one) — filtered
// against the form's own live Kind selection, see its usage below.
export interface RelatedOption { kind: 'charter' | 'sale'; value: string; label: string }

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

// Small icon-only button used throughout the repeatable-list rows
// (reorder up/down, remove) — kept local rather than promoted to the
// shared Button component since nowhere else needs a bare square icon
// button this small.
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

export default function DestinationForm({
  destination, relatedOptions, onCancel,
}: {
  destination?: DestinationRecord | null
  relatedOptions: RelatedOption[]
  onCancel: () => void
}) {
  const router = useRouter()
  const isEditing = Boolean(destination?.id)

  const [formData, setFormData] = useState<DestinationRecord>({
    kind: destination?.kind || 'charter',
    regionSlug: destination?.regionSlug || '',
    citySlug: destination?.citySlug ?? null,
    name: destination?.name || '',
    region: destination?.region || '',
    city: destination?.city ?? null,
    title: destination?.title || '',
    metaDescription: destination?.metaDescription || '',
    h1: destination?.h1 || '',
    heroImage: destination?.heroImage || '',
    eyebrow: destination?.eyebrow || '',
    intro: destination?.intro?.length ? destination.intro : [''],
    relatedKeys: destination?.relatedKeys || [],
    faqItems: destination?.faqItems?.length ? destination.faqItems : [{ question: '', answer: '' }],
    itineraries: destination?.itineraries?.length ? destination.itineraries : [{ name: '', description: '' }],
  })
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (patch: Partial<DestinationRecord>) => setFormData((prev) => ({ ...prev, ...patch }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const payload = {
      ...formData,
      citySlug: formData.citySlug?.trim() || null,
      city: formData.city?.trim() || null,
      intro: formData.intro.map((p) => p.trim()).filter(Boolean),
      faqItems: formData.faqItems.filter((f) => f.question.trim() && f.answer.trim()),
      itineraries: formData.itineraries.filter((it) => it.name.trim() && it.description.trim()),
    }

    if (payload.intro.length === 0) { setError('At least one intro paragraph is required'); return }

    setIsLoading(true)
    try {
      const url = isEditing ? `/api/admin/destinations/${destination!.id}` : '/api/admin/destinations'
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to save destination')
        return
      }

      router.push('/admin/dashboard/destinations')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card style={{ maxWidth: 900, padding: 36 }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>
        {isEditing ? `Edit ${destination?.name}` : 'New Destination'}
      </h2>
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
        Everything here is what renders on the public {formData.kind === 'sale' ? '/yacht-sale' : '/yacht-charter'} page — saving updates it immediately.
      </p>

      {error && (
        <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '12px 16px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="Identity" description="Controls the public URL and which real yacht inventory (by region/city) shows on this page. Change with care — the URL moves if you edit the slugs.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <FilterField label={isEditing ? 'Kind (fixed after creation)' : 'Kind'}>
              <SelectField
                value={formData.kind}
                onChange={(v) => update({ kind: v as 'charter' | 'sale' })}
              >
                <option value="charter" disabled={isEditing && formData.kind !== 'charter'}>Charter</option>
                <option value="sale" disabled={isEditing && formData.kind !== 'sale'}>Sale</option>
              </SelectField>
            </FilterField>
            <FilterField label="Display Name">
              <TextField required value={formData.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Monaco" />
            </FilterField>
            <FilterField label="Region URL Slug">
              <TextField required value={formData.regionSlug} onChange={(e) => update({ regionSlug: e.target.value.trim().toLowerCase() })} placeholder="e.g. french-riviera" />
            </FilterField>
            <FilterField label="City URL Slug (blank = region-only page)">
              <TextField value={formData.citySlug || ''} onChange={(e) => update({ citySlug: e.target.value.trim().toLowerCase() })} placeholder="e.g. monaco" />
            </FilterField>
            <FilterField label="Region (matches yacht records)">
              <TextField required value={formData.region} onChange={(e) => update({ region: e.target.value })} placeholder="e.g. French Riviera" />
            </FilterField>
            <FilterField label="City (matches yacht records, optional)">
              <TextField value={formData.city || ''} onChange={(e) => update({ city: e.target.value })} placeholder="e.g. Monaco" />
            </FilterField>
          </div>
        </Section>

        <Section title="SEO">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <FilterField label="Page Title (<title> tag)">
              <TextField required value={formData.title} onChange={(e) => update({ title: e.target.value })} />
            </FilterField>
            <FilterField label="H1 Heading">
              <TextField required value={formData.h1} onChange={(e) => update({ h1: e.target.value })} />
            </FilterField>
            <FilterField label="Eyebrow (small label above the H1)">
              <TextField required value={formData.eyebrow} onChange={(e) => update({ eyebrow: e.target.value })} placeholder="e.g. French Riviera" />
            </FilterField>
            <FilterField label="Hero Image Path">
              <TextField required value={formData.heroImage} onChange={(e) => update({ heroImage: e.target.value })} placeholder="/images/regions/Monaco.webp" />
            </FilterField>
          </div>
          <div style={{ marginTop: 20 }}>
            <FilterField label="Meta Description">
              <textarea style={{ ...textareaStyle, minHeight: 56 }} required value={formData.metaDescription} onChange={(e) => update({ metaDescription: e.target.value })} />
            </FilterField>
          </div>
        </Section>

        <Section title="Intro Paragraphs" description="Shown under the hero, above the fleet grid.">
          {formData.intro.map((paragraph, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <textarea
                style={textareaStyle}
                value={paragraph}
                onChange={(e) => update({ intro: formData.intro.map((p, idx) => (idx === i ? e.target.value : p)) })}
                placeholder="A paragraph of destination copy…"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <IconButton title="Move up" disabled={i === 0} onClick={() => update({ intro: move(formData.intro, i, -1) })}><ChevronUp size={13} /></IconButton>
                <IconButton title="Move down" disabled={i === formData.intro.length - 1} onClick={() => update({ intro: move(formData.intro, i, 1) })}><ChevronDown size={13} /></IconButton>
                <IconButton title="Remove" tone="danger" disabled={formData.intro.length === 1} onClick={() => update({ intro: formData.intro.filter((_, idx) => idx !== i) })}><Trash2 size={13} /></IconButton>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => update({ intro: [...formData.intro, ''] })}>
            <Plus size={13} strokeWidth={2} />
            Add Paragraph
          </Button>
        </Section>

        <Section title="FAQ" description="Rendered as the 2-column FAQ card grid on the public page.">
          {formData.faqItems.map((item, i) => (
            <div key={i} style={{ border: '1px solid rgba(184,151,74,0.15)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <TextField
                    value={item.question}
                    onChange={(e) => update({ faqItems: formData.faqItems.map((f, idx) => (idx === i ? { ...f, question: e.target.value } : f)) })}
                    placeholder="Question"
                  />
                  <textarea
                    style={{ ...textareaStyle, minHeight: 60 }}
                    value={item.answer}
                    onChange={(e) => update({ faqItems: formData.faqItems.map((f, idx) => (idx === i ? { ...f, answer: e.target.value } : f)) })}
                    placeholder="Answer"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <IconButton title="Move up" disabled={i === 0} onClick={() => update({ faqItems: move(formData.faqItems, i, -1) })}><ChevronUp size={13} /></IconButton>
                  <IconButton title="Move down" disabled={i === formData.faqItems.length - 1} onClick={() => update({ faqItems: move(formData.faqItems, i, 1) })}><ChevronDown size={13} /></IconButton>
                  <IconButton title="Remove" tone="danger" disabled={formData.faqItems.length === 1} onClick={() => update({ faqItems: formData.faqItems.filter((_, idx) => idx !== i) })}><Trash2 size={13} /></IconButton>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => update({ faqItems: [...formData.faqItems, { question: '', answer: '' }] })}>
            <Plus size={13} strokeWidth={2} />
            Add Question
          </Button>
        </Section>

        <Section
          title="Suggested Itineraries"
          description={formData.kind === 'sale'
            ? "Charter-only feature — a sale destination's yacht pages show its FAQ here instead, not itineraries. Safe to leave empty."
            : 'Shown on the destination page and on the description page of every yacht based there.'}
        >
          {formData.itineraries.map((item, i) => (
            <div key={i} style={{ border: '1px solid rgba(184,151,74,0.15)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <TextField
                    value={item.name}
                    onChange={(e) => update({ itineraries: formData.itineraries.map((it, idx) => (idx === i ? { ...it, name: e.target.value } : it)) })}
                    placeholder="Itinerary name"
                  />
                  <textarea
                    style={{ ...textareaStyle, minHeight: 60 }}
                    value={item.description}
                    onChange={(e) => update({ itineraries: formData.itineraries.map((it, idx) => (idx === i ? { ...it, description: e.target.value } : it)) })}
                    placeholder="Description"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <IconButton title="Move up" disabled={i === 0} onClick={() => update({ itineraries: move(formData.itineraries, i, -1) })}><ChevronUp size={13} /></IconButton>
                  <IconButton title="Move down" disabled={i === formData.itineraries.length - 1} onClick={() => update({ itineraries: move(formData.itineraries, i, 1) })}><ChevronDown size={13} /></IconButton>
                  <IconButton title="Remove" tone="danger" disabled={formData.itineraries.length === 1} onClick={() => update({ itineraries: formData.itineraries.filter((_, idx) => idx !== i) })}><Trash2 size={13} /></IconButton>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => update({ itineraries: [...formData.itineraries, { name: '', description: '' }] })}>
            <Plus size={13} strokeWidth={2} />
            Add Itinerary
          </Button>
        </Section>

        <Section title="Related Destinations" description="Cross-region links shown under 'Explore More' — same-region siblings are added automatically, this is only for curated cross-region suggestions.">
          <MultiSelectField
            label="destinations"
            options={relatedOptions.filter((o) => o.kind === formData.kind)}
            selected={formData.relatedKeys}
            onChange={(next) => update({ relatedKeys: next })}
            isOpen={isRelatedOpen}
            onOpenChange={setIsRelatedOpen}
          />
        </Section>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="submit" variant="primary" disabled={isLoading}>
            <Save size={14} strokeWidth={2} />
            {isLoading ? 'Saving…' : 'Save Destination'}
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

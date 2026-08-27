'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, ImageOff } from 'lucide-react'

interface Media {
  id: number
  url: string
  alt?: string | null
}

interface MediaManagerProps {
  yachtId: number
  media: Media[]
}

export default function MediaManager({ yachtId, media: initialMedia }: MediaManagerProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/admin/media?yachtId=${yachtId}`)
      if (response.ok) {
        setMedia(await response.json())
      }
    } catch (error) {
      console.error('Fetch media error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yachtId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('yachtId', String(yachtId))
      formData.append('alt', `${yachtId}-image`)

      const response = await fetch('/api/admin/media', { method: 'POST', body: formData })
      if (response.ok) await fetchMedia()
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Delete this image?')) return
    try {
      const response = await fetch(`/api/admin/media?id=${mediaId}`, { method: 'DELETE' })
      if (response.ok) setMedia((prev) => prev.filter((m) => m.id !== mediaId))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8f8f7f', marginBottom: 16 }}>
        Gallery {isLoading ? '' : `(${media.length} image${media.length === 1 ? '' : 's'})`}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 12 }}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: 'rgba(184,151,74,0.05)', border: '1px solid rgba(184,151,74,0.1)' }} />
          ))
        ) : (
          media.map((image) => (
            <div key={image.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(184,151,74,0.15)' }} className="group">
              {image.url ? (
                <img
                  src={`/uploads/yachts/${image.url}`}
                  alt={image.alt || 'Yacht image'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0, 1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(184,151,74,0.05)' }}>
                  <ImageOff size={18} color="#5a5a52" strokeWidth={1.5} />
                </div>
              )}
              <button
                onClick={() => handleDeleteMedia(image.id)}
                aria-label="Delete image"
                style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(6,9,15,0.7)', border: 'none', cursor: 'pointer',
                  opacity: 0, transition: 'opacity 0.2s ease',
                }}
                className="group-hover:opacity-100"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <Trash2 size={16} color="#e08080" strokeWidth={1.75} />
              </button>
            </div>
          ))
        )}

        <label
          style={{
            position: 'relative', aspectRatio: '1', borderRadius: 8, cursor: isUploading ? 'not-allowed' : 'pointer',
            border: '1px dashed rgba(184,151,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.2s ease', opacity: isUploading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.borderColor = 'rgba(184,151,74,0.7)' }}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(184,151,74,0.3)')}
        >
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} style={{ display: 'none' }} />
          <div style={{ textAlign: 'center' }}>
            <Plus size={18} color="#d4b472" strokeWidth={1.75} style={{ margin: '0 auto 4px' }} />
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 9.5, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8f8f7f' }}>
              {isUploading ? 'Uploading…' : 'Add'}
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}

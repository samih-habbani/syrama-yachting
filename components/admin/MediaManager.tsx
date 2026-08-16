'use client'

import { useState } from 'react'

interface MediaManagerProps {
  yachtId: number
  media: any[]
}

export default function MediaManager({ yachtId, media }: MediaManagerProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('yachtId', String(yachtId))
      formData.append('alt', `${yachtId}-image`)

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: number) => {
    if (confirm('Delete this image?')) {
      try {
        const response = await fetch(`/api/admin/media?id=${mediaId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          window.location.reload()
        }
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <h4 className="text-sm tracking-wider text-gray-600 uppercase">Gallery ({media.length} images)</h4>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
        {media.map((image) => (
          <div key={image.id} className="relative group">
            {image.url && (
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src={`/uploads/yachts/${image.url}`}
                  alt={image.alt || 'Yacht image'}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
            )}
            <button
              onClick={() => handleDeleteMedia(image.id)}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs tracking-wider font-light"
            >
              DELETE
            </button>
          </div>
        ))}

        {/* Upload Box */}
        <label className="relative w-full aspect-square border border-dashed border-[#b8974a] border-opacity-30 hover:border-opacity-100 transition cursor-pointer flex items-center justify-center bg-[#06090f] hover:bg-opacity-50">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="hidden"
          />
          <div className="text-center">
            <div className="text-2xl text-[#b8974a] mb-2">+</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">
              {isUploading ? 'Uploading...' : 'Add Image'}
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}

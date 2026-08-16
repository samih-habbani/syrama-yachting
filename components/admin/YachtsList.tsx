'use client'

import { useState } from 'react'
import Image from 'next/image'

interface YachtListProps {
  yachts: any[]
  onEdit: (yacht: any) => void
  onDelete: (id: number) => void
}

export default function YachtsList({ yachts, onEdit, onDelete }: YachtListProps) {
  const [expandedYachtId, setExpandedYachtId] = useState<number | null>(null)
  const [uploadingMediaId, setUploadingMediaId] = useState<number | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, yachtId: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingMediaId(yachtId)
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
      setUploadingMediaId(null)
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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#b8974a]">Yachts</h2>

      {yachts.length === 0 ? (
        <div className="text-gray-400">No yachts found</div>
      ) : (
        yachts.map((yacht) => (
          <div key={yacht.id} className="bg-[#0f1419] border border-[#b8974a] border-opacity-20 rounded-lg overflow-hidden">
            <div
              className="p-6 cursor-pointer hover:bg-opacity-50"
              onClick={() => setExpandedYachtId(expandedYachtId === yacht.id ? null : yacht.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#b8974a]">{yacht.model}</h3>
                  <p className="text-gray-400">{yacht.builder} • {yacht.length}m</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {yacht.cabins} cabins • {yacht.maxGuests} guests • {yacht.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(yacht)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(yacht.id)
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {expandedYachtId === yacht.id && (
              <div className="border-t border-[#b8974a] border-opacity-20 p-6 bg-[#06090f]">
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-[#b8974a] mb-4">Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {yacht.media?.map((image: any) => (
                      <div key={image.id} className="relative group">
                        {image.url && (
                          <div className="relative w-full aspect-square">
                            <Image
                              src={image.url}
                              alt={image.alt || 'Yacht image'}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteMedia(image.id)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-[#b8974a] mb-2">
                      {uploadingMediaId === yacht.id ? 'Uploading...' : 'Upload Image'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, yacht.id)}
                      disabled={uploadingMediaId === yacht.id}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#b8974a] file:text-[#06090f]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Region:</span>
                    <p className="text-white">{yacht.region || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">City:</span>
                    <p className="text-white">{yacht.city || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Price/Day:</span>
                    <p className="text-white">{yacht.priceDay || '-'} {yacht.currency}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Year:</span>
                    <p className="text-white">{yacht.year || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

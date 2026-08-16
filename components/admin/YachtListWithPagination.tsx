'use client'

import { useState } from 'react'
import MediaManager from './MediaManager'

interface YachtListProps {
  yachts: any[]
  currentPage: number
  totalPages: number
  onEdit: (yacht: any) => void
  onDelete: (id: number) => void
  onPageChange: (page: number) => void
}

export default function YachtListWithPagination({
  yachts,
  currentPage,
  totalPages,
  onEdit,
  onDelete,
  onPageChange
}: YachtListProps) {
  const [expandedYachtId, setExpandedYachtId] = useState<number | null>(null)

  return (
    <div className="space-y-8">
      {yachts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No yachts found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {yachts.map((yacht) => (
            <div
              key={yacht.id}
              className="bg-[#0f1419] border border-[#b8974a] border-opacity-10 hover:border-opacity-30 transition overflow-hidden"
            >
              <div className="p-8">
                <div className="flex gap-8 items-start">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {yacht.media && yacht.media[0]?.url ? (
                      <div className="w-40 h-40 overflow-hidden border border-[#b8974a] border-opacity-20">
                        <img
                          src={`/uploads/yachts/${yacht.media[0].url}`}
                          alt={yacht.model}
                          className="w-full h-full object-cover hover:scale-105 transition duration-700"
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-[#06090f] border border-[#b8974a] border-opacity-20 flex items-center justify-center text-gray-600 text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl text-[#b8974a] mb-1" style={{ fontFamily: 'var(--font-tenor)' }}>
                          {yacht.model}
                        </h3>
                        <p className="text-gray-500 text-sm tracking-wider">{yacht.builder || '—'}</p>

                        <div className="mt-6 grid grid-cols-3 gap-8 text-sm">
                          <div>
                            <p className="text-gray-600 uppercase tracking-wider text-xs mb-1">Length</p>
                            <p className="text-white">{yacht.length}m</p>
                          </div>
                          <div>
                            <p className="text-gray-600 uppercase tracking-wider text-xs mb-1">Cabins</p>
                            <p className="text-white">{yacht.cabins}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 uppercase tracking-wider text-xs mb-1">Guests</p>
                            <p className="text-white">{yacht.maxGuests || '—'}</p>
                          </div>
                          {yacht.region && (
                            <div>
                              <p className="text-gray-600 uppercase tracking-wider text-xs mb-1">Region</p>
                              <p className="text-white">{yacht.region}</p>
                            </div>
                          )}
                          {yacht.priceDay && (
                            <div>
                              <p className="text-gray-600 uppercase tracking-wider text-xs mb-1">Price/Day</p>
                              <p className="text-white">{yacht.priceDay} {yacht.currency}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-600 uppercase tracking-wider text-xs mb-1">Type</p>
                            <p className="text-white capitalize">{yacht.status}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onEdit(yacht)}
                          className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light whitespace-nowrap"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => onDelete(yacht.id)}
                          className="text-red-600 hover:text-red-400 border border-red-600 hover:border-red-400 px-4 py-2 transition text-xs tracking-wider font-light whitespace-nowrap"
                        >
                          DELETE
                        </button>
                        <button
                          onClick={() => setExpandedYachtId(expandedYachtId === yacht.id ? null : yacht.id)}
                          className="text-gray-500 hover:text-[#b8974a] border border-gray-500 hover:border-[#b8974a] px-4 py-2 transition text-xs tracking-wider font-light whitespace-nowrap"
                        >
                          {expandedYachtId === yacht.id ? '▼ IMAGES' : '▶ IMAGES'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Images Section */}
                {expandedYachtId === yacht.id && (
                  <div className="mt-8 pt-8 border-t border-[#b8974a] border-opacity-10">
                    <MediaManager yachtId={yacht.id} media={yacht.media || []} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#b8974a] border-opacity-10">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← PREVIOUS
          </button>

          <div className="flex gap-1 items-center">
            {/* First page */}
            {currentPage > 2 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-3 py-2 text-xs text-gray-600 hover:text-[#b8974a] transition"
                >
                  1
                </button>
                {currentPage > 3 && <span className="text-gray-600 px-1">...</span>}
              </>
            )}

            {/* Current page and neighbors */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => Math.abs(page - currentPage) <= 1)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-xs transition ${
                    page === currentPage
                      ? 'text-[#b8974a] border border-[#b8974a]'
                      : 'text-gray-600 hover:text-[#b8974a]'
                  }`}
                >
                  {page}
                </button>
              ))}

            {/* Last page */}
            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="text-gray-600 px-1">...</span>}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="px-3 py-2 text-xs text-gray-600 hover:text-[#b8974a] transition"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light disabled:opacity-30 disabled:cursor-not-allowed"
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}

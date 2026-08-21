import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

export type YachtSortBy = 'default' | 'price-asc' | 'price-desc' | 'length-asc' | 'length-desc'

export async function getYachts(options: {
  type?: 'charter' | 'sale' | 'all'
  limit?: number
  region?: string | null
  builder?: string | null
  minLength?: number
  maxLength?: number
  minGuests?: number
  maxGuests?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: YachtSortBy
} = {}) {
  const {
    type = 'all',
    limit = 500,
    region = null,
    builder = null,
    minLength = 0,
    maxLength = 200,
    minGuests = 0,
    maxGuests = 100,
    minPrice = 0,
    maxPrice = 0,
    sortBy = 'default',
  } = options

  const where: any = {
    available: true,
  }

  if (type === 'charter') {
    where.status = { in: ['Location', 'location'] }
  } else if (type === 'sale') {
    where.status = { in: ['Vente', 'vente'] }
  }

  if (region) {
    where.region = { equals: region, mode: 'insensitive' }
  }

  if (builder) {
    where.builder = { equals: builder, mode: 'insensitive' }
  }

  if (minLength || maxLength) {
    where.length = {}
    if (minLength) where.length.gte = minLength
    if (maxLength) where.length.lte = maxLength
  }

  if (minGuests || maxGuests) {
    where.maxGuests = {}
    if (minGuests) where.maxGuests.gte = minGuests
    if (maxGuests) where.maxGuests.lte = maxGuests
  }

  if (minPrice || maxPrice) {
    where.priceDay = {}
    if (minPrice) where.priceDay.gte = minPrice
    if (maxPrice) where.priceDay.lte = maxPrice
  }

  const orderBy: Prisma.YachtOrderByWithRelationInput =
    sortBy === 'price-asc' ? { priceDay: { sort: 'asc', nulls: 'last' } } :
    sortBy === 'price-desc' ? { priceDay: { sort: 'desc', nulls: 'last' } } :
    sortBy === 'length-asc' ? { length: 'asc' } :
    sortBy === 'length-desc' ? { length: 'desc' } :
    { id: 'asc' }

  return prisma.yacht.findMany({
    where,
    orderBy,
    take: limit,
    select: {
      id: true,
      builder: true,
      model: true,
      length: true,
      maxGuests: true,
      cabins: true,
      priceDay: true,
      status: true,
      region: true,
      media: {
        take: 1,
        orderBy: { id: 'asc' },
        select: { id: true, url: true, alt: true }
      }
    }
  })
}

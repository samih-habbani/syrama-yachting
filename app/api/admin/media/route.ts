import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return parseInt(userId)
}

// POST upload image
export async function POST(request: Request) {
  try {
    await checkAuth()
    const formData = await request.formData()
    const file = formData.get('file') as File
    const yachtId = formData.get('yachtId') as string
    const alt = formData.get('alt') as string

    if (!file || !yachtId) {
      return Response.json(
        { error: 'File and yacht ID are required' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const filename = `${Date.now()}-${file.name}`
    const uploadDir = path.join(process.cwd(), 'public/uploads/yachts')

    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(path.join(uploadDir, filename), Buffer.from(buffer))

    const media = await prisma.media.create({
      data: {
        yachtId: parseInt(yachtId),
        url: `/uploads/yachts/${filename}`,
        alt: alt || file.name
      }
    })

    return Response.json(media, { status: 201 })
  } catch (error) {
    console.error('Upload image error:', error)
    return Response.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// DELETE image
export async function DELETE(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json(
        { error: 'Media ID is required' },
        { status: 400 }
      )
    }

    const media = await prisma.media.findUnique({
      where: { id: parseInt(id) }
    })

    if (media && media.url) {
      const filename = media.url.split('/').pop()
      if (filename) {
        const filePath = path.join(process.cwd(), 'public/uploads/yachts', filename)
        try {
          await fs.unlink(filePath)
        } catch (e) {
          console.error('Failed to delete file:', e)
        }
      }
    }

    await prisma.media.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete image error:', error)
    return Response.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { validateBlogPayload, toBlogWriteData } from '@/lib/blog'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) throw new Error('Unauthorized')
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    const post = await prisma.yachtingBlogPost.findUnique({ where: { id: parseInt(id) } })
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 })
    return Response.json(post)
  } catch (error) {
    console.error('Get blog post error:', error)
    return Response.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

// PUT — full replace. The admin form always submits the complete post
// (content blocks are edited client-side first), so there's nothing to
// diff. `content` is one JSON column — no child rows to reconcile.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    const postId = parseInt(id)
    const data = await request.json()

    const check = validateBlogPayload(data)
    if ('error' in check) return Response.json({ error: check.error }, { status: 400 })

    const existing = await prisma.yachtingBlogPost.findUnique({ where: { id: postId } })
    if (!existing) return Response.json({ error: 'Post not found' }, { status: 404 })

    const updated = await prisma.yachtingBlogPost.update({
      where: { id: postId },
      data: toBlogWriteData(data, existing.publishedAt),
    })

    // The slug is editable — revalidate both the old and the new URL.
    revalidatePath('/blog')
    revalidatePath(`/blog/${existing.slug}`)
    revalidatePath(`/blog/${updated.slug}`)
    revalidatePath('/sitemap.xml')

    return Response.json(updated)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return Response.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    console.error('Update blog post error:', error)
    return Response.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAuth()
    const { id } = await params
    const postId = parseInt(id)

    const existing = await prisma.yachtingBlogPost.findUnique({ where: { id: postId } })
    if (!existing) return Response.json({ error: 'Post not found' }, { status: 404 })

    await prisma.yachtingBlogPost.delete({ where: { id: postId } })

    revalidatePath('/blog')
    revalidatePath(`/blog/${existing.slug}`)
    revalidatePath('/sitemap.xml')

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete blog post error:', error)
    return Response.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}

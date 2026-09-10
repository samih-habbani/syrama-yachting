import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { validateBlogPayload, toBlogWriteData } from '@/lib/blog'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) throw new Error('Unauthorized')
}

// GET — list for the admin table. Omits `content` (heavy) — the edit page
// fetches the full row by id separately.
export async function GET() {
  try {
    await checkAuth()
    const posts = await prisma.yachtingBlogPost.findMany({
      orderBy: [{ status: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true, slug: true, title: true, category: true, status: true,
        publishedAt: true, readingMinutes: true, updatedAt: true,
      },
    })
    return Response.json({ posts })
  } catch (error) {
    console.error('List blog posts error:', error)
    return Response.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()

    const check = validateBlogPayload(data)
    if ('error' in check) return Response.json({ error: check.error }, { status: 400 })

    const created = await prisma.yachtingBlogPost.create({ data: toBlogWriteData(data) })

    revalidatePath('/blog')
    revalidatePath(`/blog/${created.slug}`)
    revalidatePath('/sitemap.xml')

    return Response.json(created, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return Response.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    console.error('Create blog post error:', error)
    return Response.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

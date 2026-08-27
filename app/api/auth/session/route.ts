import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return Response.json({ isAuthenticated: false })
    }

    // The cookie alone proves the session — a DB hiccup while fetching the
    // profile (name/email) must not log the user out, so it fails soft here.
    let user = null
    try {
      user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: { id: true, email: true, name: true },
      })
    } catch (error) {
      console.error('Session profile lookup error:', error)
    }

    return Response.json({ isAuthenticated: true, userId, user })
  } catch (error) {
    console.error('Session check error:', error)
    return Response.json({ isAuthenticated: false })
  }
}

import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return Response.json({ isAuthenticated: false })
    }

    return Response.json({ isAuthenticated: true, userId })
  } catch (error) {
    console.error('Session check error:', error)
    return Response.json({ isAuthenticated: false })
  }
}

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { hashPassword } from '@/lib/auth'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return parseInt(userId)
}

// GET all users for admin
export async function GET() {
  try {
    await checkAuth()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return Response.json(users)
  } catch (error) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST create user
export async function POST(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()

    if (!data.email || !data.password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return Response.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    return Response.json(user, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT update user
export async function PUT(request: Request) {
  try {
    await checkAuth()
    const data = await request.json()
    const { id, email, password, name } = data

    if (!id) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const currentUserId = parseInt(cookieStore.get('userId')?.value || '0')

    // Check if email is being changed to an existing email
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser && existingUser.id !== parseInt(id)) {
        return Response.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (email) updateData.email = email
    if (name !== undefined) updateData.name = name

    if (password) {
      const hashedPassword = await hashPassword(password)
      updateData.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    return Response.json(updatedUser)
  } catch (error) {
    console.error('Update user error:', error)
    return Response.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE user
export async function DELETE(request: Request) {
  try {
    await checkAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent deleting yourself
    const cookieStore = await cookies()
    const currentUserId = cookieStore.get('userId')?.value
    if (currentUserId === id) {
      return Response.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return Response.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

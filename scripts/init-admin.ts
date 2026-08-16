import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/auth'

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@syrama.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin')
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@syrama.com',
        password: hashedPassword,
        name: 'Admin'
      }
    })

    console.log('Admin user created:', adminUser.email)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

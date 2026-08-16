import { prisma } from './prisma'
import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  const hashedPassword = crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex')
  return hashedPassword === hash
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  })
}

export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) return null

  const isValid = verifyPassword(password, user.password)
  if (!isValid) return null

  return user
}

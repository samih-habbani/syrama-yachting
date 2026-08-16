const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
}

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@syrama.com' }
    });

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = hashPassword('admin');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@syrama.com',
        password: hashedPassword,
        name: 'Admin'
      }
    });

    console.log('✓ Admin user created successfully');
    console.log('  Email: admin@syrama.com');
    console.log('  Password: admin');
  } catch (error) {
    console.error('✗ Error creating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
}

async function main() {
  try {
    console.log('Resetting admin user...\n');

    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: { email: 'admin@syrama.com' }
    });
    console.log('✓ Deleted existing admin user');

    // Create new admin user
    const hashedPassword = hashPassword('admin');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@syrama.com',
        password: hashedPassword,
        name: 'Admin'
      }
    });

    console.log('✓ New admin user created successfully');
    console.log('  Email: admin@syrama.com');
    console.log('  Password: admin');
    console.log('  ID:', adminUser.id);
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

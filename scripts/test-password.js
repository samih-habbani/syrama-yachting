const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
}

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@syrama.com' }
    });

    if (!user) {
      console.log('✗ User not found');
      return;
    }

    console.log('User found:', user.email);
    console.log('Stored hash:', user.password.substring(0, 20) + '...');

    const testPassword = 'admin';
    const testHash = hashPassword(testPassword);
    console.log('Test hash:', testHash.substring(0, 20) + '...');

    console.log('Hash match:', testHash === user.password ? '✓ YES' : '✗ NO');

    if (testHash !== user.password) {
      console.log('\n✗ Passwords do not match! Recreating user...');

      await prisma.user.delete({
        where: { id: user.id }
      });

      const newUser = await prisma.user.create({
        data: {
          email: 'admin@syrama.com',
          password: testHash,
          name: 'Admin'
        }
      });

      console.log('✓ User recreated with correct password');
    } else {
      console.log('\n✓ Password verification works!');
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

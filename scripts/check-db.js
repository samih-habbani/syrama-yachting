const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking database...\n');

    // Check if User table exists and list users
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.log('✗ No users found in database');
    } else {
      console.log('✓ Users in database:');
      users.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
      });
    }

    // Check yachts
    const yachtCount = await prisma.yacht.count();
    console.log(`\n✓ Yachts in database: ${yachtCount}`);

  } catch (error) {
    console.error('✗ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

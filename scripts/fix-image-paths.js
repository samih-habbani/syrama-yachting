const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fixing image paths...\n');

    const medias = await prisma.media.findMany({
      where: {
        url: {
          not: null
        }
      }
    });

    let fixed = 0;

    for (const media of medias) {
      if (media.url && !media.url.startsWith('/uploads/yachts/')) {
        const newUrl = `/uploads/yachts/${media.url}`;

        await prisma.media.update({
          where: { id: media.id },
          data: { url: newUrl }
        });

        console.log(`✓ Fixed: ${media.url} → ${newUrl}`);
        fixed++;
      }
    }

    console.log(`\n✓ Fixed ${fixed} image paths`);

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

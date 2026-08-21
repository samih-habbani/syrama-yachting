const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const regions = await prisma.yacht.findMany({
    select: { region: true },
    distinct: ['region'],
    where: { region: { not: null } }
  });

  console.log('Distinct regions:');
  regions.forEach(r => console.log(`  ${r.region}`));
  
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

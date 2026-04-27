import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const farms = await prisma.farm.findMany();
  console.log('Farms:', JSON.stringify(farms, null, 2));
  for (const farm of farms) {
    const animals = await prisma.animal.count({ where: { farmId: farm.id } });
    const milk = await prisma.milkRecord.count({ where: { animal: { farmId: farm.id } } });
    const finance = await prisma.financeRecord.count({ where: { farmId: farm.id } });
    console.log(`Farm ${farm.name} (${farm.id}): Animals=${animals}, Milk=${milk}, Finance=${finance}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

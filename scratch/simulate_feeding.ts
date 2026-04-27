import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const farmId = 'cb7f8100-0316-4dfe-9e75-6c45dc89c4a1';

async function main() {
  console.log('Simulating 24 days of history including Feeding Records...');
  
  const today = new Date();
  
  // Get rations
  const rations = await prisma.ration.findMany({ where: { farmId } });
  if (rations.length === 0) {
    console.error('No rations found. Run populate_real_data first.');
    return;
  }

  for (let i = 24; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    // Create feeding records for each milking group
    for (const r of rations) {
      if (r.name.includes('Rasion')) {
        await prisma.feedingRecord.create({
          data: {
            date,
            groupName: r.name.includes('S1') ? 'SAĞMAL 1' : (r.name.includes('S2') ? 'SAĞMAL 2' : 'YENİ DOĞANLAR'),
            animalCount: 20,
            rationId: r.id,
            farmId,
            totalCost: 150 + (Math.random() * 50)
          }
        });
      }
    }
  }

  console.log('Feeding records simulation complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

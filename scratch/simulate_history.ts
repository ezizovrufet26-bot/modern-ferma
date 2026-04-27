import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const farmId = 'cb7f8100-0316-4dfe-9e75-6c45dc89c4a1';

async function main() {
  console.log('Simulating last 24 days of operations...');
  
  const today = new Date();
  const milkPrice = 0.95; // Real price per liter

  // 1. Create 3 Specific Milking Rations
  const feedItems = await prisma.feedItem.findMany({ where: { farmId } });
  const silo = feedItems.find(i => i.name === 'Qarğıdalı silosu')!;
  const yonca = feedItems.find(i => i.name === 'Yonca otu')!;
  const concentrat = feedItems.find(i => i.name === 'Konsentrat yem (Simmental)')!;
  const soya = feedItems.find(i => i.name === 'Soya şrotu')!;

  const specificRations = [
    { name: 'Rasion S1 (Yüksək Verim - 30L+)', group: 'SAĞMAL 1', silo: 25, yonca: 8, con: 12, soya: 2 },
    { name: 'Rasion S2 (Orta Verim - 28L)', group: 'SAĞMAL 2', silo: 22, yonca: 6, con: 10, soya: 1 },
    { name: 'Rasion YD (Yeni Doğulmuşlar)', group: 'YENİ DOĞANLAR', silo: 20, yonca: 5, con: 8, soya: 2 }
  ];

  for (const sr of specificRations) {
    await prisma.ration.create({
      data: {
        name: sr.name,
        farmId,
        items: {
          create: [
            { feedItemId: silo.id, amount: sr.silo },
            { feedItemId: yonca.id, amount: sr.yonca },
            { feedItemId: concentrat.id, amount: sr.con },
            { feedItemId: soya.id, amount: sr.soya }
          ]
        }
      }
    });
  }

  // 2. Generate 24 days of history
  for (let i = 24; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Income: Milk Sales
    // 50 cows * ~27L = ~1350L
    const dailyLiters = 1300 + (Math.random() * 100);
    const dailyIncome = dailyLiters * milkPrice;

    await prisma.financeRecord.create({
      data: {
        date,
        type: 'INCOME',
        category: 'Süd Satışı',
        amount: dailyIncome,
        description: `${dailyLiters.toFixed(0)} Litr süd satışı (0.95 AZN/L)`,
        farmId
      }
    });

    // Expenses: Feed
    const dailyFeedExpense = 450 + (Math.random() * 50);
    await prisma.financeRecord.create({
      data: {
        date,
        type: 'EXPENSE',
        category: 'Yem Xərci',
        amount: dailyFeedExpense,
        description: 'Günlük qarışıq yem rasionu xərci',
        farmId
      }
    });

    // Expenses: Other (Staff/Med)
    if (i % 7 === 0) { // Weekly salaries
      await prisma.financeRecord.create({
        data: {
          date,
          type: 'EXPENSE',
          category: 'Əmək Haqqı',
          amount: 1200,
          description: 'Həftəlik işçi maaşları',
          farmId
        }
      });
    }

    if (Math.random() > 0.7) {
      await prisma.financeRecord.create({
        data: {
          date,
          type: 'EXPENSE',
          category: 'Baytarlıq',
          amount: 80 + (Math.random() * 100),
          description: 'Dərman və müayinə xərci',
          farmId
        }
      });
    }
  }

  console.log('24-day simulation complete for Xəzər Ferması.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

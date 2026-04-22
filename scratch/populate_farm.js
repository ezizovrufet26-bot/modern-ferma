const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'ai@antigravity.com' } });
  if (!user) { console.log('User not found'); return; }
  const uid = user.id;

  // Clear existing
  await prisma.feedingRecord.deleteMany({ where: { userId: uid } });
  await prisma.rationItem.deleteMany({ where: { ration: { userId: uid } } });
  await prisma.ration.deleteMany({ where: { userId: uid } });
  await prisma.feedItem.deleteMany({ where: { userId: uid } });
  await prisma.weightRecord.deleteMany({ where: { userId: uid } });
  await prisma.animal.deleteMany({ where: { userId: uid } });
  await prisma.financeRecord.deleteMany({ where: { userId: uid } });

  console.log('Ambar qurulur...');
  const feeds = [
    { name: 'Arpa', unit: 'kg', costPerUnit: 0.48, stock: 5000 },
    { name: 'Yonca', unit: 'kg', costPerUnit: 0.42, stock: 3000 },
    { name: 'Silos', unit: 'kg', costPerUnit: 0.19, stock: 15000 },
    { name: 'Kəpək', unit: 'kg', costPerUnit: 0.36, stock: 2000 },
    { name: 'Konsentrat Yem', unit: 'kg', costPerUnit: 0.80, stock: 1500 },
    { name: 'Buzov Yemi', unit: 'kg', costPerUnit: 0.85, stock: 1000 },
    { name: 'Düye Yemi', unit: 'kg', costPerUnit: 0.70, stock: 1200 }
  ];

  for (const f of feeds) {
    await prisma.feedItem.create({ data: { ...f, userId: uid } });
  }

  const dbFeeds = await prisma.feedItem.findMany({ where: { userId: uid } });
  const fArpa = dbFeeds.find(f => f.name === 'Arpa').id;
  const fYonca = dbFeeds.find(f => f.name === 'Yonca').id;
  const fSilos = dbFeeds.find(f => f.name === 'Silos').id;
  const fKepek = dbFeeds.find(f => f.name === 'Kəpək').id;
  const fKons = dbFeeds.find(f => f.name === 'Konsentrat Yem').id;
  const fBuzov = dbFeeds.find(f => f.name === 'Buzov Yemi').id;
  const fDuye = dbFeeds.find(f => f.name === 'Düye Yemi').id;

  console.log('Rasionlar yaradılır...');
  const rMilking = await prisma.ration.create({
    data: { 
      name: 'Yüksək Süd Verimi Rasionu', 
      userId: uid,
      items: { create: [
        { feedItemId: fSilos, amount: 25 },
        { feedItemId: fYonca, amount: 8 },
        { feedItemId: fKons, amount: 10 }
      ]}
    }
  });

  const rDry = await prisma.ration.create({
    data: { 
      name: 'Quru Dövr Rasionu (Mühafizə)', 
      userId: uid,
      items: { create: [
        { feedItemId: fSilos, amount: 20 },
        { feedItemId: fYonca, amount: 4 },
        { feedItemId: fKepek, amount: 3 }
      ]}
    }
  });

  const rCalf = await prisma.ration.create({
    data: { 
      name: 'Buzov Bəsləmə Rasionu', 
      userId: uid,
      items: { create: [
        { feedItemId: fArpa, amount: 1.5 },
        { feedItemId: fYonca, amount: 1 },
        { feedItemId: fBuzov, amount: 2 }
      ]}
    }
  });

  const rHeifer = await prisma.ration.create({
    data: { 
      name: 'Düye İnkişaf Rasionu', 
      userId: uid,
      items: { create: [
        { feedItemId: fSilos, amount: 15 },
        { feedItemId: fYonca, amount: 5 },
        { feedItemId: fDuye, amount: 4 }
      ]}
    }
  });

  console.log('Heyvanlar daxil edilir (Sağmal, Quru, Buzov, Düye)...');
  for (let i = 1; i <= 40; i++) {
    let group = 'SAĞMAL 1';
    let stage = 'ACTIVE';
    if (i > 15) group = 'QURUYA ÇIXANLAR';
    if (i > 25) { group = 'BUZOVLAR'; stage = 'CALF'; }
    if (i > 35) { group = 'DANALAR'; stage = 'HEIFER'; } // Düye

    await prisma.animal.create({
      data: {
        tagNumber: 'AZ' + (2000 + i),
        name: (group === 'DANALAR' ? 'Düye ' : group === 'BUZOVLAR' ? 'Buzov ' : 'İnək ') + i,
        breed: 'Holstein',
        gender: 'FEMALE',
        birthDate: new Date(Date.now() - (stage === 'CALF' ? 60 : stage === 'HEIFER' ? 400 : 1200) * 24 * 60 * 60 * 1000),
        stage: stage,
        groupName: group,
        userId: uid,
        weightRecords: (stage === 'CALF' || stage === 'HEIFER') ? { create: [
           { weight: 45 + i, userId: uid, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
           { weight: 75 + i, userId: uid, date: new Date() }
        ]} : undefined
      }
    });
  }

  // 4. Record some feedings to generate financial data
  console.log('Yemləmə tarixçəsi və xərclər yaradılır...');
  const feedingStats = [
    { group: 'SAĞMAL 1', count: 15, rationId: rMilking.id },
    { group: 'QURUYA ÇIXANLAR', count: 10, rationId: rDry.id },
    { group: 'BUZOVLAR', count: 10, rationId: rCalf.id },
    { group: 'DANALAR', count: 5, rationId: rHeifer.id }
  ];

  for (const s of feedingStats) {
    const ration = await prisma.ration.findUnique({ where: { id: s.rationId }, include: { items: { include: { feedItem: true } } } });
    const costPerAnimal = ration.items.reduce((acc, it) => acc + (it.amount * it.feedItem.costPerUnit), 0);
    const totalCost = costPerAnimal * s.count;

    await prisma.feedingRecord.create({
      data: {
        groupName: s.group,
        animalCount: s.count,
        rationId: s.rationId,
        totalCost,
        userId: uid,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    });

    await prisma.financeRecord.create({
      data: {
        type: 'EXPENSE',
        category: 'YEM',
        amount: totalCost,
        description: `${s.group} qrupunun yemlənməsi (${ration.name})`,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        userId: uid
      }
    });
  }

  console.log('Fərma real məlumatlarla tam təchiz olundu!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

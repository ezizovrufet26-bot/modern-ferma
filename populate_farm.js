const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { contains: 'antigravity' } }
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  const userId = user.id;

  // Cleanup
  await prisma.animal.deleteMany({ where: { userId } });
  await prisma.financeRecord.deleteMany({ where: { userId } });
  await prisma.feedingRecord.deleteMany({ where: { userId } });
  await prisma.rationItem.deleteMany({ where: { ration: { userId } } });
  await prisma.ration.deleteMany({ where: { userId } });
  await prisma.feedItem.deleteMany({ where: { userId } });
  await prisma.staff.deleteMany({ where: { userId } });

  console.log(`Building 10-day history for ${user.name}...`);

  // 1. Staff
  const vet = await prisma.staff.create({ data: { name: 'Dr. Murad Əliyev', role: 'HEKIM', userId } });
  const tech = await prisma.staff.create({ data: { name: 'Vaqif Texnik', role: 'TEXNIK', userId } });

  // 2. Feeds
  const feeds = [
    { name: 'Silos', unit: 'kq', costPerUnit: 0.15, stock: 100000 },
    { name: 'Yonca', unit: 'kq', costPerUnit: 0.45, stock: 40000 },
    { name: 'Süd Verən Yem (21%)', unit: 'kq', costPerUnit: 0.78, stock: 20000 },
    { name: 'Quru Dövr Yemi', unit: 'kq', costPerUnit: 0.65, stock: 10000 },
    { name: 'Buzov Başlanğıc', unit: 'kq', costPerUnit: 0.88, stock: 5000 },
    { name: 'Saman', unit: 'kq', costPerUnit: 0.11, stock: 20000 }
  ];

  const createdFeeds = [];
  for (const f of feeds) {
    createdFeeds.push(await prisma.feedItem.create({ data: { ...f, userId } }));
  }

  // 3. Rations
  const rationsData = [
    { name: 'ELİT SAĞMAL', costPerAnimal: 11.5, items: [ { name: 'Silos', amount: 30 }, { name: 'Yonca', amount: 6 }, { name: 'Süd Verən Yem (21%)', amount: 10 } ] },
    { name: 'STANDART SAĞMAL', costPerAnimal: 8.2, items: [ { name: 'Silos', amount: 20 }, { name: 'Yonca', amount: 4 }, { name: 'Süd Verən Yem (21%)', amount: 6 } ] },
    { name: 'QURU DÖVR', costPerAnimal: 5.5, items: [ { name: 'Silos', amount: 15 }, { name: 'Saman', amount: 5 }, { name: 'Quru Dövr Yemi', amount: 2 } ] },
    { name: 'BUZOV RASİONU', costPerAnimal: 3.2, items: [ { name: 'Buzov Başlanğıc', amount: 2 }, { name: 'Yonca', amount: 1 } ] }
  ];

  const createdRations = [];
  for (const r of rationsData) {
    const ration = await prisma.ration.create({
      data: {
        name: r.name,
        userId,
        items: {
          create: r.items.map(i => ({ amount: i.amount, feedItemId: createdFeeds.find(f => f.name === i.name).id }))
        }
      }
    });
    createdRations.push({ ...ration, costPerAnimal: r.costPerAnimal });
  }

  // 4. ANIMALS
  const createAnimal = async (tag, name, stage, group, ageMonths, gestationData = {}) => {
    const birthDate = new Date(); birthDate.setMonth(birthDate.getMonth() - ageMonths);
    return await prisma.animal.create({ 
      data: { 
        tagNumber: tag, 
        name, 
        breed: 'Holştayn', 
        gender: 'FEMALE', 
        stage, 
        groupName: group, 
        birthDate, 
        userId,
        ...gestationData
      } 
    });
  };

  const animals = [];
  // 30 Animals distribution
  for (let i = 1; i <= 5; i++) {
    // 3rd month pregnant
    const breedingDate = new Date(); breedingDate.setMonth(breedingDate.getMonth() - 3);
    const expectedCalving = new Date(breedingDate); expectedCalving.setDate(expectedCalving.getDate() + 283);
    const a = await createAnimal(`YD-${100+i}`, `Yeni Doğan ${i}`, 'MILKING', 'YENİ DOĞANLAR', 36, {
      isPregnant: true,
      lastBreedingDate: breedingDate,
      expectedCalvingDate: expectedCalving
    });
    await prisma.reproductionRecord.create({ data: { animalId: a.id, date: breedingDate, eventType: 'PREGNANCY_CONFIRMED', expectedCalvingDate: expectedCalving } });
    animals.push({ ...a, yield: 25, ration: 'ELİT SAĞMAL' });
  }
  for (let i = 1; i <= 7; i++) {
    // 7th month pregnant (almost dry)
    const breedingDate = new Date(); breedingDate.setMonth(breedingDate.getMonth() - 7);
    const expectedCalving = new Date(breedingDate); expectedCalving.setDate(expectedCalving.getDate() + 283);
    const a = await createAnimal(`S1-${100+i}`, `Sağmal-1 ${i}`, 'MILKING', 'SAĞMAL 1', 48, {
      isPregnant: true,
      lastBreedingDate: breedingDate,
      expectedCalvingDate: expectedCalving
    });
    await prisma.reproductionRecord.create({ data: { animalId: a.id, date: breedingDate, eventType: 'PREGNANCY_CONFIRMED', expectedCalvingDate: expectedCalving } });
    animals.push({ ...a, yield: 30, ration: 'ELİT SAĞMAL' });
  }
  for (let i = 1; i <= 3; i++) {
    // Non-pregnant
    const a = await createAnimal(`S2-${100+i}`, `Sağmal-2 ${i}`, 'MILKING', 'SAĞMAL 2', 60);
    animals.push({ ...a, yield: 22, ration: 'STANDART SAĞMAL' });
  }
  for (let i = 1; i <= 5; i++) {
    // 8th month pregnant and DRY
    const breedingDate = new Date(); breedingDate.setMonth(breedingDate.getMonth() - 8);
    const expectedCalving = new Date(breedingDate); expectedCalving.setDate(expectedCalving.getDate() + 283);
    const dryDate = new Date(); dryDate.setDate(dryDate.getDate() - 20);
    const a = await createAnimal(`DRY-${100+i}`, `Quru ${i}`, 'DRY', 'QURUYA ÇIXANLAR', 50, {
      isPregnant: true,
      isDry: true,
      dryDate: dryDate,
      lastBreedingDate: breedingDate,
      expectedCalvingDate: expectedCalving
    });
    await prisma.reproductionRecord.create({ data: { animalId: a.id, date: dryDate, eventType: 'DRY_OFF' } });
    animals.push({ ...a, ration: 'QURU DÖVR' });
  }
  for (let i = 1; i <= 5; i++) {
    const a = await createAnimal(`HEIF-${100+i}`, `Düye ${i}`, 'HEIFER', 'DÜYƏLƏR', 18);
    animals.push({ ...a, ration: 'QURU DÖVR' });
  }
  for (let i = 1; i <= 5; i++) {
    const a = await createAnimal(`CALF-${100+i}`, `Buzov ${i}`, 'CALF', 'BUZOVLAR', 2);
    animals.push({ ...a, ration: 'BUZOV RASİONU' });
  }

  // 5. 10-DAY HISTORY (FEEDING & MILKING)
  console.log("Generating 10 days of feeding and milking data...");
  for (let day = 0; day < 10; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    // a. Milking Records & Income
    let dailyTotalYield = 0;
    const milkingAnimals = animals.filter(a => a.yield);
    for (const a of milkingAnimals) {
      await prisma.milkRecord.create({
        data: {
          animalId: a.id,
          date,
          yieldMorning: a.yield / 2,
          yieldEvening: a.yield / 2,
          totalYield: a.yield
        }
      });
      dailyTotalYield += a.yield;
    }
    
    // Milk Sale Income (once per day)
    await prisma.financeRecord.create({
      data: { type: 'INCOME', category: 'MILK_SALE', amount: dailyTotalYield * 0.85, description: `${date.toLocaleDateString()} Süd Satışı (${dailyTotalYield.toFixed(1)}L)`, date, userId }
    });

    // b. Feeding Records & Expense
    const groupData = [
      { name: 'SAĞMAL 1', count: 7, rationName: 'ELİT SAĞMAL', freq: 3 },
      { name: 'YENİ DOĞANLAR', count: 5, rationName: 'ELİT SAĞMAL', freq: 3 },
      { name: 'SAĞMAL 2', count: 3, rationName: 'STANDART SAĞMAL', freq: 3 },
      { name: 'QURUYA ÇIXANLAR', count: 5, rationName: 'QURU DÖVR', freq: 2 },
      { name: 'DÜYƏLƏR', count: 5, rationName: 'QURU DÖVR', freq: 2 },
      { name: 'BUZOVLAR', count: 5, rationName: 'BUZOV RASİONU', freq: 3 }
    ];

    for (const g of groupData) {
      const ration = createdRations.find(r => r.name === g.rationName);
      const dailyCost = (ration.costPerAnimal * g.count);
      
      // We log one feeding record per group per day for history (representing the TMR total)
      await prisma.feedingRecord.create({
        data: {
          groupName: g.name,
          animalCount: g.count,
          rationId: ration.id,
          totalCost: dailyCost,
          date,
          userId
        }
      });

      // Feeding Expense in Finance
      await prisma.financeRecord.create({
        data: { type: 'EXPENSE', category: 'FEED', amount: dailyCost, description: `${date.toLocaleDateString()} ${g.name} Yemləmə (${g.freq} dəfə)`, date, userId }
      });
    }
  }

  // 6. HEALTH
  const healthAnimal = animals[6]; // One Milking 1 cow
  await prisma.healthRecord.create({
    data: { animalId: healthAnimal.id, date: new Date(), type: 'TREATMENT', disease: 'Mastit', description: 'Mastijet vurduq', medications: 'Mastijet Forte', cost: 40 }
  });
  await prisma.vaccineRecord.create({
    data: { animalId: healthAnimal.id, vaccineName: 'Şap (FMD)', date: new Date(), dose: '2ml', notes: 'Dost köməyi peyvəndi' }
  });

  console.log("SUCCESS: 10-day history generated with professional feeding schedules!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

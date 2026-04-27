import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const farmId = 'cb7f8100-0316-4dfe-9e75-6c45dc89c4a1';

async function main() {
  console.log('Cleaning existing data for Xəzər Ferması...');
  
  // 1. Feed Items (Anbar)
  const feedItems = [
    { name: 'Qarğıdalı silosu', unit: 'kg', costPerUnit: 0.12, stock: 50000 },
    { name: 'Yonca otu', unit: 'kg', costPerUnit: 0.25, stock: 20000 },
    { name: 'Konsentrat yem (Simmental)', unit: 'kg', costPerUnit: 0.60, stock: 10000 },
    { name: 'Soya şrotu', unit: 'kg', costPerUnit: 0.85, stock: 5000 },
    { name: 'Mineral və Vitaminlər', unit: 'kg', costPerUnit: 2.50, stock: 1000 },
    { name: 'Arpa ezməsi', unit: 'kg', costPerUnit: 0.35, stock: 15000 }
  ];

  const createdFeedItems = [];
  for (const item of feedItems) {
    const created = await prisma.feedItem.create({
      data: { ...item, farmId }
    });
    createdFeedItems.push(created);
  }
  console.log('Feed items added.');

  // 2. Animals (75 total)
  const today = new Date();
  const milkingCows: any[] = [];

  // Create 50 Milking Cows
  for (let i = 1; i <= 50; i++) {
    const group = i <= 20 ? 'SAĞMAL 1' : (i <= 40 ? 'SAĞMAL 2' : 'YENİ DOĞANLAR');
    const stage = 'ADULT';
    const birthDate = new Date();
    birthDate.setFullYear(today.getFullYear() - (3 + Math.random() * 3));

    const animal = await prisma.animal.create({
      data: {
        tagNumber: `AZ100${i.toString().padStart(3, '0')}`,
        name: `Inək #${i}`,
        breed: 'Simmental',
        gender: 'FEMALE',
        birthDate: birthDate,
        stage: stage,
        groupName: group,
        farmId: farmId
      }
    });
    milkingCows.push(animal);

    // Milk records
    const targetTotal = i <= 20 ? 30 : (i <= 40 ? 28 : 24);
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(today.getDate() - d);
      await prisma.milkRecord.create({
        data: {
          animalId: animal.id,
          date: date,
          yieldMorning: targetTotal * 0.55 + (Math.random() * 1),
          yieldEvening: targetTotal * 0.45 + (Math.random() * 1),
          totalYield: targetTotal + (Math.random() * 1)
        }
      });
    }

    // Reproduction (Insemination)
    if (i % 3 === 0) {
      await prisma.reproductionRecord.create({
        data: {
          animalId: animal.id,
          date: new Date(today.getTime() - (45 * 24 * 60 * 60 * 1000)),
          eventType: 'INSEMINATION',
          notes: 'Süni mayalanma - Simmental elit buğa'
        }
      });
    }
  }

  // 10 Heifers (Düye)
  for (let i = 1; i <= 10; i++) {
    const birthDate = new Date();
    birthDate.setMonth(today.getMonth() - (15 + Math.random() * 5));
    const heifer = await prisma.animal.create({
      data: {
        tagNumber: `AZ200${i.toString().padStart(3, '0')}`,
        name: `Düye #${i}`,
        breed: 'Simmental',
        gender: 'FEMALE',
        birthDate: birthDate,
        stage: 'HEIFER',
        groupName: 'DÜYƏLƏR',
        farmId: farmId
      }
    });
    
    if (i <= 5) {
      await prisma.reproductionRecord.create({
        data: {
          animalId: heifer.id,
          date: new Date(today.getTime() - (20 * 24 * 60 * 60 * 1000)),
          eventType: 'INSEMINATION',
          notes: 'İlk mayalanma'
        }
      });
    }
  }

  // 5 Dry Cows
  for (let i = 1; i <= 5; i++) {
    await prisma.animal.create({
      data: {
        tagNumber: `AZ300${i.toString().padStart(3, '0')}`,
        name: `Quru İvək #${i}`,
        breed: 'Simmental',
        gender: 'FEMALE',
        birthDate: new Date(today.getFullYear() - 5, 0, 1),
        stage: 'ADULT',
        groupName: 'QURUYA ÇIXANLAR',
        isDry: true,
        farmId: farmId
      }
    });
  }

  // 10 Calves (Buzov)
  for (let i = 1; i <= 10; i++) {
    const mother = milkingCows[i-1];
    const birthDate = new Date();
    birthDate.setMonth(today.getMonth() - Math.floor(Math.random() * 6));
    
    const calf = await prisma.animal.create({
      data: {
        tagNumber: `AZ400${i.toString().padStart(3, '0')}`,
        name: `Buzov #${i}`,
        breed: 'Simmental',
        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
        birthDate: birthDate,
        stage: 'CALF',
        groupName: 'BUZOV_QRUPU',
        motherId: mother.id,
        farmId: farmId
      }
    });

    await prisma.calvingRecord.create({
      data: {
        animalId: mother.id,
        date: birthDate,
        calfId: calf.id,
        notes: 'Sağlam bala doğumu'
      }
    });
  }

  // 3. Health & Vaccines
  const allAnimals = await prisma.animal.findMany({ where: { farmId } });
  for (const a of allAnimals) {
    await prisma.vaccineRecord.create({
      data: {
        animalId: a.id,
        date: today,
        vaccineName: 'Şap (FMD) + Bruselyoz',
        dose: '2ml',
        notes: 'Ümumi profilaktik tədbir'
      }
    });
  }

  // Sick Bay
  for (let i = 0; i < 4; i++) {
    await prisma.healthRecord.create({
      data: {
        animalId: allAnimals[i].id,
        date: today,
        type: 'TREATMENT',
        disease: 'Mastit',
        description: 'Süd vəzisi iltihabı qeyd edildi',
        treatment: 'Antibiotik mualicəsi başlanıldı',
        vetName: 'Baş Baytar'
      }
    });
  }

  // 4. Rations
  const rations = [
    { name: 'Sağmal Rasionu (Premium)', group: 'SAĞMAL 1', amount: 45 },
    { name: 'Düye Rasionu', group: 'DÜYƏLƏR', amount: 25 },
    { name: 'Buzov Rasionu', group: 'BUZOV_QRUPU', amount: 12 }
  ];

  for (const r of rations) {
    const ration = await prisma.ration.create({
      data: {
        name: r.name,
        farmId,
        items: {
          create: [
            { feedItemId: createdFeedItems[0].id, amount: r.amount * 0.6 },
            { feedItemId: createdFeedItems[1].id, amount: r.amount * 0.2 },
            { feedItemId: createdFeedItems[2].id, amount: r.amount * 0.2 }
          ]
        }
      }
    });

    // Create a feeding record for today
    await prisma.feedingRecord.create({
      data: {
        date: today,
        groupName: r.group,
        animalCount: 20,
        rationId: ration.id,
        farmId,
        totalCost: r.amount * 0.5 * 20 // Approx cost
      }
    });
  }

  console.log('Xəzər Ferması real data simulation complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());

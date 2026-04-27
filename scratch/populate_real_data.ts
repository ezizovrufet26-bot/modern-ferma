import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const farmId = 'cb7f8100-0316-4dfe-9e75-6c45dc89c4a1';

async function main() {
  console.log('Cleaning existing data for Xəzər Ferması...');
  // Optional: Clean existing data to avoid duplicates if desired, 
  // but usually better to just add.
  
  // 1. Warehouse Items (Anbar)
  const feedItems = [
    { name: 'Qarğıdalı silosu', unit: 'KG', quantity: 50000, minStock: 5000, price: 0.12 },
    { name: 'Yonca otu', unit: 'KG', quantity: 20000, minStock: 2000, price: 0.25 },
    { name: 'Konsentrat yem (Simmental)', unit: 'KG', quantity: 10000, minStock: 1000, price: 0.60 },
    { name: 'Soya şrotu', unit: 'KG', quantity: 5000, minStock: 500, price: 0.85 },
    { name: 'Mineral və Vitaminlər', unit: 'KG', quantity: 1000, minStock: 100, price: 2.50 },
    { name: 'Arpa ezməsi', unit: 'KG', quantity: 15000, minStock: 1500, price: 0.35 }
  ];

  for (const item of feedItems) {
    await prisma.warehouseItem.create({
      data: { ...item, farmId }
    });
  }
  console.log('Warehouse items added.');

  // 2. Animals (75 total)
  // 50 Milking Cows
  // 10 Heifers (Düye)
  // 5 Dry Cows (Quruya çıxan)
  // 10 Calves (Buzov)
  
  const animals: any[] = [];
  const today = new Date();

  // Create 50 Milking Cows
  for (let i = 1; i <= 50; i++) {
    const status = i <= 20 ? 'SAĞMAL 1' : (i <= 40 ? 'SAĞMAL 2' : 'YENİ DOĞAN');
    const birthDate = new Date();
    birthDate.setFullYear(today.getFullYear() - (3 + Math.random() * 3)); // 3-6 years old

    const animal = await prisma.animal.create({
      data: {
        earTag: `AZ100${i.toString().padStart(3, '0')}`,
        name: `Inək #${i}`,
        breed: 'Simmental',
        gender: 'FEMALE',
        birthDate: birthDate,
        status: status,
        farmId: farmId
      }
    });
    animals.push(animal);

    // Add 30 days of milk records for this cow
    // S1: 30L, S2: 28L, YD: 24L
    const targetYield = status === 'SAĞMAL 1' ? 30 : (status === 'SAĞMAL 2' ? 28 : 24);
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(today.getDate() - d);
      await prisma.milkRecord.create({
        data: {
          animalId: animal.id,
          farmId: farmId,
          date: date,
          morningYield: targetYield * 0.4 + (Math.random() * 2),
          eveningYield: targetYield * 0.4 + (Math.random() * 2),
          nightYield: targetYield * 0.2 + (Math.random() * 1),
          totalYield: 0, // Will be updated by internal logic or I can set it
          fat: 3.8 + Math.random() * 0.4,
          protein: 3.2 + Math.random() * 0.3
        }
      });
    }

    // Add Artificial Insemination records for some
    if (i % 3 === 0) {
      await prisma.reproRecord.create({
        data: {
          animalId: animal.id,
          farmId: farmId,
          date: new Date(today.getTime() - (45 * 24 * 60 * 60 * 1000)), // 45 days ago
          eventType: 'INSEMINATION',
          details: 'Süni mayalanma - Simmental elit buğa',
          performedBy: 'Dr. Əliyev'
        }
      });
    }
  }

  // Create 10 Heifers (Düye)
  for (let i = 1; i <= 10; i++) {
    const birthDate = new Date();
    birthDate.setMonth(today.getMonth() - (15 + Math.random() * 5)); // 15-20 months old
    const heifer = await prisma.animal.create({
      data: {
        earTag: `AZ200${i.toString().padStart(3, '0')}`,
        name: `Düye #${i}`,
        breed: 'Simmental',
        gender: 'FEMALE',
        birthDate: birthDate,
        status: 'DANALAR', // Will be classified as Heifer in UI
        farmId: farmId
      }
    });
    
    // Inseminate some heifers
    if (i <= 5) {
      await prisma.reproRecord.create({
        data: {
          animalId: heifer.id,
          farmId: farmId,
          date: new Date(today.getTime() - (20 * 24 * 60 * 60 * 1000)),
          eventType: 'INSEMINATION',
          details: 'İlk mayalanma',
          performedBy: 'Dr. Qasımov'
        }
      });
    }
  }

  // Create 5 Dry Cows
  for (let i = 1; i <= 5; i++) {
    const birthDate = new Date();
    birthDate.setFullYear(today.getFullYear() - 5);
    await prisma.animal.create({
      data: {
        earTag: `AZ300${i.toString().padStart(3, '0')}`,
        name: `Quru İvək #${i}`,
        breed: 'Simmental',
        gender: 'FEMALE',
        birthDate: birthDate,
        status: 'QURUYA ÇIXANLAR',
        farmId: farmId
      }
    });
  }

  // Create 10 Calves (Buzov) and link to mothers
  for (let i = 1; i <= 10; i++) {
    const mother = animals[i-1];
    const birthDate = new Date();
    birthDate.setMonth(today.getMonth() - Math.floor(Math.random() * 6));
    
    const calf = await prisma.animal.create({
      data: {
        earTag: `AZ400${i.toString().padStart(3, '0')}`,
        name: `Buzov #${i}`,
        breed: 'Simmental',
        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
        birthDate: birthDate,
        status: 'BUZOVLAR',
        motherId: mother.id,
        farmId: farmId
      }
    });

    // Add birth record for mother
    await prisma.calvingRecord.create({
      data: {
        animalId: mother.id,
        farmId: farmId,
        date: birthDate,
        calfId: calf.id,
        type: 'NORMAL',
        details: 'Sağlam bala doğumu'
      }
    });
  }

  // 3. Health Records (Sick bay & Vaccinations)
  // Vaccination for ALL animals
  const allAnimals = await prisma.animal.findMany({ where: { farmId } });
  for (const a of allAnimals) {
    await prisma.healthRecord.create({
      data: {
        animalId: a.id,
        farmId: farmId,
        date: today,
        type: 'VACCINATION',
        details: 'Ümumi Şap (FMD) və Bruselyoz vaksini',
        doctor: 'Baş Baytar',
        treatment: '2ml / Heyvan'
      }
    });
  }

  // Sick animals
  for (let i = 0; i < 3; i++) {
    await prisma.healthRecord.create({
      data: {
        animalId: allAnimals[i].id,
        farmId: farmId,
        date: today,
        type: 'TREATMENT',
        details: 'Mastit (Süd vəzisi iltihabı) - Sağ ön rüb',
        doctor: 'Dr. Əliyev',
        treatment: 'Amoksisilin + Vitamin C',
        nextCheck: new Date(today.getTime() + (48 * 60 * 60 * 1000))
      }
    });
  }

  // 4. Feeding Rations (Rasion)
  const rations = [
    { name: 'Sağmal Rasionu (High Yield)', targetGroup: 'SAĞMAL 1', totalAmount: 45 },
    { name: 'Düye Rasionu', targetGroup: 'DANALAR', totalAmount: 25 },
    { name: 'Buzov Başlanğıc', targetGroup: 'BUZOVLAR', totalAmount: 12 }
  ];

  for (const r of rations) {
    await prisma.feedingRation.create({
      data: {
        ...r,
        farmId,
        components: {
          create: [
            { itemId: (await prisma.warehouseItem.findFirst({ where: { name: 'Qarğıdalı silosu' } }))!.id, amount: r.totalAmount * 0.6 },
            { itemId: (await prisma.warehouseItem.findFirst({ where: { name: 'Yonca otu' } }))!.id, amount: r.totalAmount * 0.2 },
            { itemId: (await prisma.warehouseItem.findFirst({ where: { name: 'Konsentrat yem (Simmental)' } }))!.id, amount: r.totalAmount * 0.2 }
          ]
        }
      }
    });
  }

  console.log('All real data populated for Xəzər Ferması.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

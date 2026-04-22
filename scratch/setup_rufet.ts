import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupRufetFarm() {
  try {
    const userId = '643a39ee-d0b3-487c-8401-20f1626d11d1';
    
    console.log("Rufet Admin üçün heyvanlar yaradılır...");

    // 1. Heyvanları yaradırıq
    const animals = await Promise.all([
      prisma.animal.create({ data: { tagNumber: "AZ-1001", name: "Göyçək", gender: "FEMALE", birthDate: new Date("2022-01-01"), userId } }),
      prisma.animal.create({ data: { tagNumber: "AZ-1002", name: "Maral", gender: "FEMALE", birthDate: new Date("2021-05-15"), userId } }),
      prisma.animal.create({ data: { tagNumber: "AZ-1003", name: "Ceyran", gender: "FEMALE", birthDate: new Date("2023-02-10"), userId } }),
    ]);

    console.log(`${animals.length} heyvan yaradıldı. İndi vaksin vurulur...`);

    // 2. Vaksinləri vururuq
    const vaccineDate = new Date("2026-04-02");
    await prisma.vaccineRecord.createMany({
      data: animals.map(a => ({
        animalId: a.id,
        vaccineName: "Dabaq",
        date: vaccineDate,
        dose: "2ml",
        notes: "Uğurlu test"
      }))
    });

    console.log("Hər şey hazırdır! İndi Sağlamlıq bölməsinə baxın.");

  } catch (error) {
    console.error("Xəta:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRufetFarm();

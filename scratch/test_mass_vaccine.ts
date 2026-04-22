import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulateMassVaccine() {
  try {
    const userId = 'ff691639-3364-45d4-b815-7547d3375f47';
    
    // 2. Heyvanları tapırıq
    const animals = await prisma.animal.findMany({
      where: { userId },
      take: 5
    });

    console.log(`${animals.length} heyvan üçün 'Dabaq' vaksini (2 Aprel) yaradılır...`);

    const vaccineDate = new Date("2026-04-02");
    
    const records = await prisma.vaccineRecord.createMany({
      data: animals.map(a => ({
        animalId: a.id,
        vaccineName: "Dabaq",
        date: vaccineDate,
        dose: "2ml",
        notes: "Real məlumat sinxronizasiya testi"
      }))
    });

    console.log(`Uğurlu! ${records.count} heyvan üçün qeyd yaradıldı.`);
    
    // Yoxlanış
    const check = await prisma.vaccineRecord.findMany({
      where: { vaccineName: "Dabaq", date: vaccineDate },
      include: { animal: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log("\nSağlamlıq Mərkəzində Görünəcək Timeline:");
    check.forEach(r => {
      console.log(`- ${r.animal.tagNumber}: ${r.vaccineName} (${r.date.toLocaleDateString('az-AZ')}) [YADDA SAXLANILDI]`);
    });

  } catch (error) {
    console.error("Xəta:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateMassVaccine();
